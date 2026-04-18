# OAuth Refresh — Operator Visibility

## Surfaces
- **Primary:** `/admin/integrations` → OAuth Refresh Health module (`OAuthRefreshHealthBoard`)
- **Secondary:** `/admin/health` → Incidents (when failing)
- **Truth artifact:** `generated/restore-and-oauth-hardening/oauth-refresh-probe-status.json`

## What operators see
- Per-provider rollup (Google / Microsoft / Slack)
- Failing accounts / connections list
- Last successful refresh timestamp
- Repeat-failure counts
- Reauth-required accounts
