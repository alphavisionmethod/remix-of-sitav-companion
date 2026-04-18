# OAuth Refresh — Current State Audit

| Provider | Refresh implementation | Probe coverage | Operator visibility |
|---|---|---|---|
| Google | ✅ Live (`google-oauth-callback`) | ✅ hourly via `oauth-refresh-probe` | ✅ `/admin/integrations` |
| Microsoft Graph | ✅ Live (`microsoft-graph-oauth`) | ✅ hourly | ✅ `/admin/integrations` |
| Slack | ✅ Live (`slack-oauth`) | ✅ hourly | ✅ `/admin/integrations` |
| Other (manual) | classified manual | n/a | shown as "manual" |

## Gaps closed
- Refresh now probed continuously, not point-in-time.
- Failures recorded in `oauth_refresh_probe_results`.
- Reauth visibility surfaced to operators.
- pg_cron schedule (`oauth-refresh-probe-hourly`) live.
