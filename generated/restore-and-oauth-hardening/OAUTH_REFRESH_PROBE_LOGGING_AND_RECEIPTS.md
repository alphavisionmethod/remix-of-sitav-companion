# OAuth Refresh — Logging & Receipts

## Persistence

Every probe writes one row to `oauth_refresh_probe_results`:

| Column | Purpose |
|---|---|
| id | uuid PK |
| provider | google/microsoft/slack |
| user_id | RLS scope |
| connector_token_id | FK to connector_tokens |
| probed_at | event time |
| result | enum |
| latency_ms | observability |
| failure_reason | text (null on success) |
| retry_count | for backoff calc |
| lifecycle_status | derived state |
| evidence | jsonb (provider response excerpt, scrubbed) |

## RLS
- users see their own probe results
- admins (via `has_role(uid, 'admin')`) see all

## Retention
- 90 days default; archived to cold storage after.

## Edge function

`supabase/functions/oauth-refresh-probe/index.ts`:
1. Reads due tokens from `connector_tokens` (next_probe_at ≤ now)
2. Calls provider refresh endpoint
3. Updates token row
4. Writes probe result row
5. Updates `drill_cadence_registry.last_run_at`

## CI proof
- `check-oauth-refresh-probe-coverage.ts` — providers covered + edge fn deployed + cadence registered
- `check-connector-refresh-health.ts` — no failing providers
- `check-reauth-visibility.ts` — UX surfaces wired
