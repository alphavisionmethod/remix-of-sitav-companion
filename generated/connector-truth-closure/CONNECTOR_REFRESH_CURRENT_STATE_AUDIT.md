# Connector Refresh — Current State Audit

_Phase 1 of Connector Truth Closure._ Source-of-truth inputs: `generated/restore-and-oauth-hardening/OAUTH_REFRESH_*.md`.

## Where refresh logic lives today

| Provider   | Refresh path                                              | Token row                                  |
| ---------- | --------------------------------------------------------- | ------------------------------------------ |
| Google     | `supabase/functions/oauth-refresh-probe/index.ts::probeGoogle` (real `https://oauth2.googleapis.com/token`) | `connector_tokens` (`refresh_token`)        |
| Microsoft  | `probeMicrosoft` (real `login.microsoftonline.com/{tenant}/oauth2/v2.0/token`) | `connector_tokens` (`refresh_token`)        |
| Slack      | `probeSlack` via real `slack.com/api/auth.test` (auth-test as refresh-equivalent for long-lived tokens) | `connector_tokens` (`access_token`)         |
| All others | _no live OAuth refresh_ — manual / API-key only           | n/a                                        |

## Tables involved

- `connector_tokens` — encrypted token storage (real refresh uses these)
- `connector_accounts` — account/connection metadata
- `connector_registry` — catalog of connectors (35+ entries)
- `connector_effective_state` (view) — joins accounts + tokens + last probe → derived `effective_state`
- `oauth_refresh_probe_results` — durable per-token probe receipts (used hourly by `oauth-refresh-probe`)
- `drill_cadence_registry` — tracks last_run / next_due per probe drill key
- **(NEW)** `connector_refresh_nightly_runs` — one row per nightly verification (this closure)
- **(NEW)** `connector_refresh_streak_state` — per-provider 7-day streak singleton (this closure)

## Surfaces consuming the data

- `OAuthRefreshHealthBoard` — canonical admin board (control surface)
- `IntegrationStreakPanel` — 7-day per-day chips (read from `oauth_refresh_probe_results`)
- `IntegrationReceiptDrawer` — per-probe drilldown
- `ConnectorStateBadge` — canonical 6-state grammar chip (zero local color maps)

## Cadence

- Hourly: `pg_cron` job `oauth-refresh-probe-hourly` invokes `oauth-refresh-probe` edge function
- **(NEW)** Nightly 02:30 UTC: `connector-refresh-nightly-verify` (this closure)
- **(NEW)** CI 03:30 UTC: `.github/workflows/connector-truth-nightly.yml` triggers verify, emits artifacts, runs gates

## What was NOT proven before this closure

1. ❌ No DB-backed multi-day streak object (streak was computed in-memory in UI)
2. ❌ No expiry-pressure synthetic failure-class assertion
3. ❌ No nightly run history with structured pass/fail/degraded
4. ❌ No CI workflow gating release on connector refresh truth
5. ❌ No machine-readable rollup artifact for governance consumption

All 5 are addressed by this closure.
