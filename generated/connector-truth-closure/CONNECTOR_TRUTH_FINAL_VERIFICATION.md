# Connector Truth — Final Verification

_Phase 5 final closure document._

## Acceptance criteria mapping (PART 8)

| # | Criterion | Mechanism | Status |
|---|-----------|-----------|--------|
| 1 | Nightly real token refresh runs for Google/Microsoft/Slack | `connector-refresh-nightly-verify` edge function + pg_cron `02:30 UTC` | ✅ Implemented |
| 2 | Real connector refresh path (no synthetic bypass) | Verifier reads existing `oauth_refresh_probe_results` + invokes real provider endpoints for expiry-pressure | ✅ Implemented |
| 3 | Durable receipts/logs | `oauth_refresh_probe_results` (per-probe) + `connector_refresh_nightly_runs` (per-night) | ✅ Implemented |
| 4 | Canonical health states | 6-state grammar (`connector-state-grammar.ts`) rendered via `ConnectorStateBadge` | ✅ Implemented |
| 5 | Expiry-pressure proven | Sentinel invalid token sent to real provider endpoint each night → classifier asserted to emit `reauth_required` | ✅ Implemented |
| 6 | Reauth UX validated | `ReauthCTAButton` + `IntegrationReceiptDrawer` on `OAuthRefreshHealthBoard` | ✅ Implemented |
| 7 | Long-tail providers manual everywhere | `check-long-tail-provider-classification.ts` BLOCK gate | ✅ Implemented |
| 8 | No ambiguous "connected" state | `check-no-ambiguous-connected-state.ts` BLOCK gate | ✅ Implemented |
| 9 | 7-day evidence surfaced | `connector_refresh_streak_state` + `ConnectorTruthSummaryPanel` + `connector-refresh-streak-status.json` | ✅ Implemented |
| 10 | Generated reports show hard pass/fail | 4 JSON artifacts emitted by `emit-connector-truth-artifacts.ts` | ✅ Implemented |
| 11 | No duplicate monitoring | Reuses `oauth-refresh-probe`, `oauth_refresh_probe_results`, `connector_effective_state`, `ConnectorStateBadge`, `OAuthRefreshHealthBoard`, `IntegrationStreakPanel`, `IntegrationReceiptDrawer` | ✅ Verified |
| 12 | Production-grade and integrated | 7 BLOCK gates in `check-os-release-readiness.ts` + CI workflow | ✅ Verified |

## Operational cadence

| Job                                       | Schedule        | Owner                                |
| ----------------------------------------- | --------------- | ------------------------------------ |
| `oauth-refresh-probe` (hourly)            | `0 * * * *`     | `oauth-refresh-probe-hourly` pg_cron |
| `connector-refresh-nightly-verify`        | `30 2 * * *`    | `sita-connector-refresh-nightly-verify` pg_cron |
| CI: `connector-truth-nightly.yml`         | `30 3 * * *`    | GitHub Actions (1h after pg_cron)    |

## Streak progression to "proven"

- Day 1 nightly verify pass → `current_streak_days = 1` → classification `yellow`
- Day 7 nightly verify pass → `current_streak_days = 7` → classification `green` ⇒ **proven**
- Any failure → `current_streak_days = 0` → classification `red` (or `yellow` after next pass)

## Files generated

- 9 markdown audit/model docs in `generated/connector-truth-closure/`
- 4 JSON status artifacts (regenerated nightly): `connector-provider-status.json`, `connector-refresh-streak-status.json`, `connector-reauth-status.json`, `connector-truth-verification.json`

## What this closure does NOT do

- Does not duplicate the hourly probe (it reuses it)
- Does not replace the canonical control surface (`/admin/integrations` stays canonical; AI Engineer panel is a read-only summary)
- Does not promote any long-tail provider to "live OAuth"
- Does not fabricate streak evidence (streak resets on any real failure)
