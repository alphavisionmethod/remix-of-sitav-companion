# Connector Nightly Refresh — Verification Model

_Phase 2 model._ Defines the canonical nightly flow executed by `connector-refresh-nightly-verify`.

## Flow

For each provider in `[google, microsoft, slack]`:

### 1. live_refresh
Invokes the existing `oauth-refresh-probe` edge function in-process (no duplicate logic).
- Reads the latest row in `oauth_refresh_probe_results` for that provider written within the last 90 minutes.
- Asserts `status = 'success'` for at least one token of that provider.
- If 0 success rows → provider marked **failed** for the night.

### 2. expiry_pressure_synthetic
Sends a deliberately invalid refresh token (`expired-sentinel-<provider>-<runId>`) to the **real provider endpoint**.
- Expected outcome: HTTP 4xx with `invalid_grant` (Google/Microsoft) or `invalid_auth`/`token_revoked` (Slack).
- Asserts the classifier in `oauth-refresh-probe`'s `classifyLifecycle` would emit `reauth_required` or `revoked`.
- If the classifier would falsely emit `success` for an invalid token → **expiry_pressure_passed = false**.

### 3. state_consistency
Reads `connector_effective_state` view, joined with the latest probe row per token.
- Asserts: NO row exists where `effective_state = 'connected'` AND `oauth_refresh_probe_results.lifecycle_state IN ('failing','reauth_required')` for the same token.
- Any drift here is a **state_consistency = false** failure.

## Run record

Inserts one row in `connector_refresh_nightly_runs`:
```
{
  run_id: "connector-nightly-<ISO>",
  status: 'pass' | 'fail' | 'degraded',
  providers_passed: [...],
  providers_failed: [...],
  providers_reauth_required: [...],
  expiry_pressure_passed: boolean,
  state_consistency_passed: boolean,
  failure_summary: string | null,
  evidence: { perProvider: {...}, expiryPressure: {...}, stateConsistency: {...} }
}
```

The `trg_recompute_connector_refresh_streak` trigger then updates per-provider streak rows.

## Status classification

- **pass** — all 3 providers passed live_refresh AND expiry_pressure_passed AND state_consistency_passed
- **degraded** — ≥1 provider failed but expiry_pressure + state_consistency still passed
- **fail** — expiry_pressure_passed = false OR state_consistency_passed = false

## API spend ceiling

- 3 extra HTTP calls per night (1 per provider for expiry-pressure)
- Live refresh check reads existing hourly probe results (zero extra calls)
- Total nightly cost: ≈ $0 (provider OAuth endpoints are free)
