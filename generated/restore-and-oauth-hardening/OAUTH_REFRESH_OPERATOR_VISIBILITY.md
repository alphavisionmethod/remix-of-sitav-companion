# OAuth Refresh — Operator Visibility

## Admin surfaces

| Surface | Path | Component |
|---|---|---|
| Admin Integrations | `/admin/integrations` | `OAuthRefreshHealthBoard` |
| Admin Health | `/admin/health` | `DrillCadenceBoard` (cadence row) |

## Board contents
- per-provider table: total tokens, healthy, degraded, failing, reauth_required
- last probe timestamp per provider
- failing tokens drilldown
- retry/backoff state

## User-facing surface
- `connected-services` page shows per-connection badge:
  - 🟢 connected
  - 🟡 degraded (retrying)
  - 🟠 reauth required (CTA: Reconnect)
  - 🔴 disconnected

## Queries

```sql
-- provider health rollup
SELECT provider, lifecycle_status, count(*)
FROM oauth_refresh_probe_results r
JOIN LATERAL (
  SELECT lifecycle_status FROM oauth_refresh_probe_results
  WHERE connector_token_id = r.connector_token_id
  ORDER BY probed_at DESC LIMIT 1
) latest ON true
GROUP BY provider, lifecycle_status;
```
