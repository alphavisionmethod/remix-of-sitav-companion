# Connector Health State Model

_Phase 2 model._ References the canonical 6-state grammar in `src/lib/connectors/connector-state-grammar.ts`.

## Canonical states (rendered by `ConnectorStateBadge`)

| State                | Meaning                                      | Tone     |
| -------------------- | -------------------------------------------- | -------- |
| `connected`          | Live OAuth, refresh succeeded recently       | success  |
| `degraded`           | Refresh intermittent or partial drift        | warning  |
| `reauth_required`    | User must reconnect (revoked / invalid_grant)| critical |
| `failing`            | Repeated hard failure                         | critical |
| `manual`             | API-key / non-refreshable / long-tail         | neutral  |
| `demo_simulated`     | Demo mode only                                | info     |

## State transitions (driven by real refresh outcomes)

```
oauth-refresh-probe outcome → lifecycle_state in oauth_refresh_probe_results:

  ok=true                           → 'healthy'   → effective_state='connected'
  ok=false, retry_count<3, transient→ 'degraded'  → effective_state='degraded'
  ok=false, retry_count>=3          → 'failing'   → effective_state='failing'
  ok=false, invalid_grant/revoked   → 'reauth_required' → effective_state='reauth_required'
  ok=false, AADSTS65001 (perm drift)→ 'degraded'  → effective_state='degraded' (reauth=true)
  ok=false, missing oauth secrets   → 'blocked'   → effective_state='manual' (config issue)
```

## Surfaces consuming the state

- `OAuthRefreshHealthBoard` (canonical admin board)
- `IntegrationsHome` connector chips
- `ConnectorTruthSummaryPanel` (NEW — read-only panel for AI Engineer team in `/admin/ai-runtime`)
- `IntegrationStreakPanel` (per-day worst-of-N rendering)

## Stale data handling

- A probe row older than 24h with no newer success → state degrades automatically via the `connector_effective_state` view's join logic.
- The nightly verifier's `state_consistency` check fails the night if any token still surfaces as `connected` despite a recent `failing` probe.

## No ambiguous state allowed

The `check-no-ambiguous-connected-state.ts` gate fails CI if any connector UI surface hard-codes the string "Connected" without going through `ConnectorStateBadge`.
