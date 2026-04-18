# OAuth Refresh — Target Model

## Probe lifecycle
```
schedule (hourly) → enumerate connector_tokens
  → per-token: refresh attempt → classify result
  → write oauth_refresh_probe_results row
  → if degraded/failing: raise alert + flip connector status
  → operator sees row in /admin/integrations → OAuth Refresh Health
```

## States
| State | Meaning |
|---|---|
| healthy | refresh ok, token valid, next deadline > 0 |
| degraded | transient failure, retry pending |
| failing | repeated failure, circuit open |
| reauth_required | refresh token revoked/expired |
| blocked | provider outage suspected |

## Cadence
Hourly via `pg_cron` job `oauth-refresh-probe-hourly` (cron `7 * * * *`).
