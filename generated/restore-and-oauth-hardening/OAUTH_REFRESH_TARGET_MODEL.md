# OAuth Refresh Probe — Target Model

## Probe model

```ts
interface OAuthRefreshProbeResult {
  id: uuid;
  provider: 'google' | 'microsoft' | 'slack';
  user_id: uuid;
  connector_token_id: uuid;
  probed_at: timestamptz;
  result: 'success' | 'transient_failure' | 'reauth_required' | 'permission_drift' | 'revoked' | 'provider_outage';
  latency_ms: int;
  failure_reason: text | null;
  retry_count: int;
  next_probe_at: timestamptz;
  lifecycle_status: 'healthy' | 'degraded' | 'failing' | 'reauth_required' | 'blocked';
  alert_state: 'ok' | 'amber' | 'red';
}
```

## Cadence
- hourly probe via `pg_cron` (calls `oauth-refresh-probe` edge fn)
- per-token cadence configurable in `drill_cadence_registry`

## State transitions

```
healthy → degraded   : 2 consecutive failures
degraded → failing   : 5 consecutive failures
* → reauth_required  : refresh returns invalid_grant
* → blocked          : explicit operator action
```

## Operator visibility
- `OAuthRefreshHealthBoard` in Admin Integrations
- per-user `connected-services` shows lifecycle_status

## Alert routing
- amber: stale > 6h → Slack
- red: failing OR reauth_required > 1h → page on-call
