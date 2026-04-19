# Connector Refresh Receipt Model

_Phase 2 receipt model._ All meaningful refresh activity persists durable evidence.

## Per-token probe receipt (existing — every probe)

Table: `oauth_refresh_probe_results`

| Field                  | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `probe_id`             | Groups all results from one probe invocation     |
| `user_id`, `account_id`| Per-token scoping                                 |
| `provider`             | google / microsoft / slack                        |
| `token_row_id`         | FK to `connector_tokens`                          |
| `probe_started_at` / `probe_finished_at` | Timing                              |
| `duration_ms`          | Latency                                           |
| `status`               | `success` \| `fail`                               |
| `failure_class`        | `transient` \| `reauth_required` \| `permission_drift` \| `revoked` \| `provider_outage` \| `config` |
| `failure_reason`       | Provider-supplied error string (truncated 120 chars) |
| `retry_count`          | Cumulative consecutive failure count             |
| `lifecycle_state`      | Maps to canonical 6-state grammar                |
| `alert_state`          | `ok` \| `warning` \| `critical`                   |
| `reauth_required`      | Boolean — drives reauth CTA                       |
| `next_probe_due_at`    | Cadence anchor (1h)                               |
| `evidence`             | JSONB: latency, status code, provider details    |

## Per-night nightly run receipt (NEW — one per night)

Table: `connector_refresh_nightly_runs` (see `CONNECTOR_NIGHTLY_REFRESH_MODEL.md`)

## Per-provider streak state (NEW — singleton per provider)

Table: `connector_refresh_streak_state`

- Updated automatically by `recompute_connector_refresh_streak()` trigger on every nightly run insert
- Tracks: `current_streak_days`, `longest_streak_days`, last pass/fail timestamps, 7-day totals

## Consumed by

- `OAuthRefreshHealthBoard` (probe-level)
- `IntegrationReceiptDrawer` (per-receipt drill-down)
- `IntegrationStreakPanel` (7-day per-day chips)
- `ConnectorTruthSummaryPanel` (NEW — streak + nightly status for AI Engineer team)
- `emit-connector-truth-artifacts.ts` (generates 4 JSON rollups for governance)
- `check-os-release-readiness.ts` (BLOCK gates — release truth)
