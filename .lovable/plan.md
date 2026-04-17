

## Re-Audit Verdict — Checklist 15: 4/12 Truthful, 8 Real Gaps

**Live disk + DB truth shows the connector layer is mostly scaffolding pointing at non-existent tables.** Existing tables (`connector_tokens`, `connector_oauth_flows`, `connector_sync_runs`) are isolated; no code reads them, and the tables the code *does* reference don't exist.

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Connector registry exists | ❌ | `connector_registry` table **missing**; `CN02ConnectorRegistryConsole` + `CN01ConnectorRealityOverview` query it → render empty. Catalog JSON has placeholder strings (`"id: plaid"`) not objects. 11 connector defs in `connectors/` are TS-only, never seeded. |
| 2 | Provider health exists | ⚠️ | `connector-health` edge fn queries `connector_configs` — **table missing**. Function will 500 on every call. |
| 3 | OAuth/token lifecycle modeled | ❌ | `connector-oauth` writes to `connector_oauth_tokens`, `connector_accounts`, `connector_receipts`, `consent_scope_records` — **all 4 missing**. `connector_tokens` exists but unused. |
| 4 | Refresh token rotation | ❌ | Schema has `rotation_count` + `last_refreshed_at` columns but **no refresh worker, no cron, no edge fn** performs rotation. |
| 5 | Webhook handling | ❌ | **Zero webhook-receiver edge functions**. `edge-function-replay-map.ts` lists `webhook-redelivery` as a *category*, but no actual webhook ingest fn exists. |
| 6 | Replay failed webhooks | ❌ | Replay map declares the kind, no implementation, no `webhook_events` table, no DLQ. |
| 7 | Sync cursors stored | ⚠️ | `connector_sync_runs` exists (start/complete/records_synced) but **no `cursor` column, no `last_sync_token`, no per-resource checkpoint**. `cloud_sync_checkpoints` is for OS sync, not connectors. |
| 8 | Connector truth visible in admin | ❌ | 12 admin pages reference connector tables; most query `connector_registry` / `connector_accounts` (missing) and render blank. |
| 9 | User-facing connection states accurate | ❌ | Depends on `connector_accounts.status` — table missing. UI cannot show real state. |
| 10 | Integration failure fallbacks | ⚠️ | `connector-fake-mode.service.ts` exists; no policy that auto-switches on real failure; no degraded-mode receipt. |
| 11 | Disconnect/reconnect flows | ⚠️ | `connector-oauth` has `disconnect` action but writes to missing tables → throws. Reconnect path absent. |
| 12 | Permissions/scopes auditable | ⚠️ | Code writes `consent_scope_records` + `consent_ledger`; **`consent_scope_records` table missing**, `consent_ledger` exists. Partial. |

**Truth: 4/12 partial, 8/12 hard fails. Connector layer is a façade.**

---

## Phase 22 — Connector Reality Closure

### 22.A — Create the 6 missing core tables (fixes 1, 2, 3, 8, 9, 12)
Migration adds, with admin-RW + user-scoped RLS + indexes:
- **`connector_registry`** — `id, connector_id (uniq), display_name, provider, connector_class, auth_method, read_supported, write_supported, sync_supported, launch_stage, default_scopes text[], webhook_supported, refresh_supported, icon_url`
- **`connector_accounts`** — `id, user_id, registry_id FK, connector_type, display_name, account_email, status (connected|disconnected|reauth_required|degraded), connected_at, disconnected_at, last_health_at, demo_mode, UNIQUE(connector_type,user_id)`
- **`connector_oauth_tokens`** — `id, user_id, account_id FK uniq, provider, access_token (encrypted ref), refresh_token, token_type, scopes_granted text[], expires_at, last_refreshed_at, rotation_count, reauth_required`
- **`connector_receipts`** — `id, user_id, account_id, event_type (oauth_connect|disconnect|refresh|sync_start|sync_complete|webhook_received|fallback_engaged), connector_type, details jsonb, created_at` (insert-only)
- **`connector_configs`** — `id, user_id, service, status, last_sync_at, sync_interval_min, config jsonb, updated_at` (the table `connector-health` already queries)
- **`consent_scope_records`** — `id, user_id, provider_family, scope_value, scope_label, scope_category, consent_type, granted, granted_at, revoked_at`

### 22.B — Webhook ingest + replay (fixes 5, 6)
- **NEW table `webhook_events`** — `id, provider, event_type, external_id (idempotency), payload jsonb, signature, signature_valid, received_at, processed_at, status (pending|processed|failed|replayed), retry_count, last_error, dead_letter bool`
- **NEW edge fn `webhook-ingest`** — generic `verify_jwt = false` receiver: `/webhook-ingest/{provider}`. Validates HMAC per provider, dedupes by `external_id`, persists to `webhook_events`, dispatches to `webhook-process`.
- **NEW edge fn `webhook-process`** — pulls pending events, runs provider handler, marks processed/failed, increments retry. After 5 retries → `dead_letter=true` + Phase 20 alert.
- **NEW edge fn `webhook-replay`** — admin-gated; replays a single event or all dead-letter events of a provider.
- **CRON `sita-webhook-process-1m`** every minute → `webhook-process`.

### 22.C — Sync cursors (fixes 7)
- **EXTEND `connector_sync_runs`** — add `cursor text`, `last_cursor text`, `resource_type text`, `direction (push|pull|bidirectional)`, `error text`, `dead_letter bool`.
- **NEW table `connector_sync_cursors`** — `account_id PK, resource_type, cursor, last_synced_at, etag` (one cursor per account+resource).
- `connector-sync` fn rewritten to read cursor, call provider, persist new cursor + records_synced + receipt.

### 22.D — Refresh token rotation (fixes 4)
- **NEW edge fn `connector-token-refresh`** — for every `connector_oauth_tokens` row where `expires_at < now() + 10min` AND `refresh_token IS NOT NULL`, refresh via provider, update access_token + `last_refreshed_at` + `rotation_count`++; on failure → set `reauth_required=true` + alert + `connector_accounts.status='reauth_required'`.
- **CRON `sita-connector-token-refresh-5m`** every 5 min.

### 22.E — Seed registry + fix catalog generator (fixes 1, 8)
- **REWRITE `scripts/manifests/generate/connector-catalog.ts`** — actually parse the 11 `*.connector.ts` files (AST) and emit objects with `id, name, provider, class, auth, scopes, status` instead of placeholder strings.
- **NEW edge fn `seed-connector-registry`** — one-shot sync from generated JSON → `connector_registry` table at deploy time. Seeds ≥11 rows (gmail, calendar, crm, accounting, banking, travel, cloud-drive, signature, forex-broker, crypto-exchange, wallet).

### 22.F — Fallback / degraded mode (fixes 10)
- **EXTEND `connector-fake-mode.service`** — when a real call fails 3× in 10min, auto-engage fake mode + write `connector_receipts(event_type='fallback_engaged')` + alert + flip `connector_accounts.status='degraded'`. Manual override via admin button on `CN01ConnectorRealityOverview`.

### 22.G — Reconnect flow + disconnect fix (fixes 11)
- **EXTEND `connector-oauth`** — add `action: "reconnect"` (revokes old token, initiates new flow with prior scopes); `disconnect` already wired but now hits real tables.
- UI: `CN01ConnectorRealityOverview` gains "Reconnect" button per account in `reauth_required` state.

### 22.H — CI Gate 33 + report
- **NEW `scripts/architecture/checks/check-connector-reality.ts`** (Gate 33):
  - All 8 new/extended tables exist + RLS on
  - `connector_registry.count >= 11`
  - `webhook_events` table present + webhook-ingest fn deployed
  - Cron `sita-webhook-process-1m` + `sita-connector-token-refresh-5m` active
  - Every `*.connector.ts` has matching `connector_registry` row
  - No admin page references a connector table that doesn't exist (cross-check)
  - Emit `generated/connector-reality-report.json`
- Bump `gateCount: 33` in `ci-gate-registry.ts` + `ci-umbrella-manifest.json`.
- Register all 8 new tables in `non-edge-table-io-sources.ts`.

### Files

| Layer | Change |
|---|---|
| DB migration | 8 tables (6 new + 1 extend + webhook_events + sync_cursors), RLS, indexes |
| Edge fn `webhook-ingest` | NEW — generic webhook receiver |
| Edge fn `webhook-process` | NEW — process pending events |
| Edge fn `webhook-replay` | NEW — admin replay |
| Edge fn `connector-token-refresh` | NEW — rotation worker |
| Edge fn `seed-connector-registry` | NEW — one-shot sync |
| Edge fn `connector-sync` | REWRITE — real cursor logic |
| Edge fn `connector-oauth` | EXTEND — reconnect action |
| `connector-fake-mode.service.ts` | EXTEND — auto-fallback policy |
| `scripts/manifests/generate/connector-catalog.ts` | REWRITE — AST parse |
| `scripts/architecture/checks/check-connector-reality.ts` | NEW Gate 33 |
| `src/lib/ci/ci-gate-registry.ts` + manifest | gateCount 33 |
| `src/lib/db/non-edge-table-io-sources.ts` | register 8 tables |
| Cron data inserts | `sita-webhook-process-1m` + `sita-connector-token-refresh-5m` |
| `generated/connector-reality-report.json` | NEW |
| `generated/connector-catalog.json` | REGENERATED with 11 real entries |

### Acceptance

- All 8 tables exist with RLS; `connector_registry` has ≥11 rows
- `connector-oauth` end-to-end: initiate → callback → token written → receipt written → consent recorded → disconnect revokes & cleans up (no missing-table errors)
- `connector-health` returns real status from `connector_configs` (no 500)
- `webhook-ingest` accepts a signed test POST → row in `webhook_events`; `webhook-process` cron processes it within 1 min
- `connector-token-refresh` cron rotates a token nearing expiry within 5 min; `rotation_count`++
- `connector-sync` advances `connector_sync_cursors.cursor` and writes `connector_sync_runs` with non-null cursor
- Fallback policy engages fake mode after 3 failures; receipt logged; `status='degraded'`
- `/admin/connectors/CN01` and `CN02` render real rows (no longer empty)
- `cron.job` contains both new schedules
- Gate 33 green; CI Umbrella `gateCount: 33`; `connector-reality-report.json` `ok:true`
- Checklist 15 truthfully **12/12 — fully deployable**

