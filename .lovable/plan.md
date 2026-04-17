

## Re-Audit Verdict — Checklist 15: 10/12 ✅ + 2 Real Gaps

Live disk + DB truth confirms Phase 22 infrastructure is fully landed. Two wiring gaps remain.

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Connector registry exists | ✅ | `connector_registry` 12 rows, RLS on, catalog JSON valid |
| 2 | Provider health exists | ✅ | `connector_configs` table live + RLS, `connector-health` fn deployed |
| 3 | OAuth/token lifecycle | ✅ | All 4 tables (`accounts`, `oauth_tokens`, `receipts`, `consent_scope_records`) exist with RLS |
| 4 | Refresh token rotation | ✅ | `connector-token-refresh` fn deployed; cron `sita-connector-token-refresh-5m` **active** |
| 5 | Webhook handling | ✅ | `webhook-ingest` fn deployed + `verify_jwt=false`; `webhook_events` table live |
| 6 | Replay failed webhooks | ✅ | `webhook-replay` fn deployed; `webhook-process` cron `sita-webhook-process-1m` **active** |
| 7 | Sync cursors | ✅ | `connector_sync_cursors` table exists + RLS |
| 8 | Connector truth visible in admin | ✅ | `CN01ConnectorRealityOverview` + `CN02ConnectorRegistryConsole` query real tables |
| 9 | User-facing connection states | ✅ | `connector_accounts.status` modeled (connected/disconnected/reauth_required/degraded) |
| 10 | Integration failure fallbacks | ❌ | **`connector-fake-mode.service.ts` has no auto-engage policy** — no `recordFailure()`, no 3-strike trigger, no `fallback_engaged` receipt |
| 11 | Disconnect/reconnect flows | ⚠️ | `disconnect` action wired & tested; **`reconnect` action MISSING** from `connector-oauth/index.ts` (grep returns 0 hits). CN01 has no Reconnect button. |
| 12 | Permissions/scopes auditable | ✅ | `consent_scope_records` table live + `consent_ledger` exists |

**Truth: 10/12 wired, 2 concrete code gaps.**

---

## Phase 22.1 — Reality Closure (2 fixes, ~4 files)

### 22.1.A — Add `reconnect` action to OAuth fn (fixes #11)
Edit `supabase/functions/connector-oauth/index.ts`:
- Add `reconnect` to action union schema (alongside `initiate|callback|disconnect`)
- Handler reads existing `connector_accounts` row + `connector_oauth_tokens.scopes_granted`
- Marks token `reauth_required=true`, sets `connector_accounts.status='reauth_required'`
- Returns a fresh OAuth `initiate` URL with prior scopes preserved
- Writes `connector_receipts(event_type='reconnect_initiated')`

### 22.1.B — Reconnect button in admin (fixes #11)
Edit `src/pages/admin/CN01ConnectorRealityOverview.tsx`:
- Add "Reconnect" button in account row when `status==='reauth_required'`
- Calls `supabase.functions.invoke('connector-oauth', { body: { action:'reconnect', account_id }})`
- On success → toast + redirect to returned auth URL

### 22.1.C — Auto-fallback policy (fixes #10)
Extend `src/lib/services/connector-control-plane/connector-fake-mode.service.ts`:
- Add `recordConnectorFailure(accountId, connectorType)` — tracks failures in a 10-min sliding window
- After 3 failures → `engageFakeMode(accountId)`:
  - UPDATE `connector_accounts SET status='degraded'`
  - INSERT `connector_receipts(event_type='fallback_engaged', details:{ reason:'3 failures in 10min' })`
  - Emit Phase 20 alert via `emitAlert()`
- Add manual override `disengageFakeMode(accountId)` for admin button
- Wire `recordConnectorFailure` into `connector-proxy` and `connector-sync` fn error paths

### 22.1.D — Strengthen Gate 33 + refresh report
Edit `scripts/architecture/checks/check-connector-reality.ts`:
- Assert `connector-oauth/index.ts` contains `"reconnect"` action literal
- Assert `connector-fake-mode.service.ts` exports `recordConnectorFailure` + `engageFakeMode`
- Assert `CN01ConnectorRealityOverview.tsx` contains "Reconnect" button
- Refresh `generated/connector-reality-report.json` with new evidence fields

### Files

| Layer | Change |
|---|---|
| `supabase/functions/connector-oauth/index.ts` | EXTEND — add `reconnect` action |
| `src/pages/admin/CN01ConnectorRealityOverview.tsx` | EXTEND — Reconnect button |
| `src/lib/services/connector-control-plane/connector-fake-mode.service.ts` | EXTEND — auto-fallback policy + failure tracker |
| `supabase/functions/connector-proxy/index.ts` | WIRE — call `recordConnectorFailure` on error |
| `supabase/functions/connector-sync/index.ts` | WIRE — call `recordConnectorFailure` on error |
| `scripts/architecture/checks/check-connector-reality.ts` | +3 assertions |
| `generated/connector-reality-report.json` | Refresh evidence |

### Acceptance

- `grep "reconnect" supabase/functions/connector-oauth/index.ts` returns hits
- Calling `connector-oauth { action:'reconnect', account_id }` → returns auth URL + flips status to `reauth_required` + writes receipt
- CN01 admin renders "Reconnect" button on `reauth_required` rows
- Simulating 3 connector-proxy failures within 10 min → `connector_accounts.status='degraded'` + `fallback_engaged` receipt written + alert emitted
- Gate 33 green with new assertions; report `ok:true`
- Checklist 15 truthfully **12/12 — fully deployable**

