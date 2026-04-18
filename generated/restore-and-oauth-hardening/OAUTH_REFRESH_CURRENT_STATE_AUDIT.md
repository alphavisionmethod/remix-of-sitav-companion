# OAuth Refresh — Current State Audit

## Live providers (audited)

| Provider | Refresh impl | Token storage | Health visibility (pre) | Health visibility (post) |
|---|---|---|---|---|
| Google | ✅ `connector-token-refresh-google` | `connector_tokens` | ❌ inferred only | ✅ `oauth_refresh_probe_results` |
| Microsoft | ✅ `connector-token-refresh-microsoft` | `connector_tokens` | ❌ inferred only | ✅ `oauth_refresh_probe_results` |
| Slack | ✅ `connector-token-refresh-slack` | `connector_tokens` | ❌ inferred only | ✅ `oauth_refresh_probe_results` |

## Gaps closed by probe automation

1. ❌→✅ No scheduled live verification → `oauth-refresh-probe` edge fn + hourly `pg_cron`
2. ❌→✅ No durable receipts → `oauth_refresh_probe_results` (RLS, append-only)
3. ❌→✅ No degraded-state classification → 5-state model: healthy / degraded / failing / reauth_required / blocked
4. ❌→✅ No operator board → `OAuthRefreshHealthBoard` in `IntegrationsHome`
5. ❌→✅ No reauth UX → `connected-services` page surfaces `reauth_required` state

## Existing tables consulted (no duplication)
- `connector_tokens` (token storage — unchanged)
- `connector_sync_state` (sync metadata — unchanged)
- New: `oauth_refresh_probe_results` (probe receipts only)
