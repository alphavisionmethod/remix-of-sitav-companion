# Connector Expiry-Pressure Test Model

_Phase 2 model._ Defines how the nightly verifier behaviorally proves the refresh classifier handles hostile / expired token input correctly.

## Why

A connector that "passes refresh" with healthy tokens is necessary but not sufficient. We must also prove that **invalid / expired tokens are correctly classified as `reauth_required`** — otherwise the system could silently mask broken refresh as healthy.

## Scenarios proven each night

### S1 — Invalid Google refresh token
- Input: `expired-sentinel-google-<runId>` posted to `https://oauth2.googleapis.com/token`
- Expected: HTTP 400 with `error=invalid_grant`
- Pass: classifier maps to `reauth_required`
- Fail: classifier returns `success` or `transient`

### S2 — Invalid Microsoft refresh token
- Input: invalid sentinel posted to `https://login.microsoftonline.com/common/oauth2/v2.0/token`
- Expected: HTTP 400 with `AADSTS70008` or `invalid_grant`
- Pass: classifier maps to `reauth_required`

### S3 — Invalid Slack token
- Input: `Bearer expired-sentinel-slack-<runId>` to `https://slack.com/api/auth.test`
- Expected: `ok=false, error=invalid_auth` or `not_authed`
- Pass: classifier maps to `reauth_required`

## Safety

- Sentinel tokens are clearly fake (`expired-sentinel-*`) — no risk of touching real user data.
- Each provider receives **exactly 1 sentinel call per night** — no rate-limit risk.
- No real account is locked out — providers reject the sentinel in <100 ms with no side-effect.

## Recorded as

`connector_refresh_nightly_runs.expiry_pressure_passed = boolean` plus full per-scenario detail in `evidence.expiryPressure`.

## Failure handling

Any S1/S2/S3 failure → entire nightly run status = `fail` → streak resets for affected providers → operator alert visible in `ConnectorTruthSummaryPanel` and `OAuthRefreshHealthBoard`.
