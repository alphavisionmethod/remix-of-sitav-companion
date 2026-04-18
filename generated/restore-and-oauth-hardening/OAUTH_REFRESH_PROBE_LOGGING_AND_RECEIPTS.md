# OAuth Refresh — Logging & Receipts

## Persistence
Table: `oauth_refresh_probe_results`
Columns: `id, provider, account_id, probed_at, attempt_result, failure_reason, retry_count, lifecycle_status, alert_state, evidence_url, user_id`.

## Retention
90 days, trimmed nightly.

## Receipts
Each probe writes one row. Aggregate per-provider summary mirrored to `generated/restore-and-oauth-hardening/oauth-refresh-probe-status.json`.

## Alerts
- 3 consecutive failures → incident raised via `raiseAlert`
- reauth_required → user-facing connected services banner
