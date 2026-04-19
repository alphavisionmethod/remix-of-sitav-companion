

## Audit verdict — 3 stale validator paths + missing aggregator wiring

The previous "fix" turn claimed it patched the validator paths, but the on-disk files still have the **wrong canonical paths** and emit `ok: false`. Plus the 6 new flagship-surface validators were never wired into the master release readiness aggregator. Real gaps:

| # | Gap | Evidence | Fix |
|---|---|---|---|
| 1 | `check-onboarding-simulated-persona-disclosure.ts` line 14 still checks `src/lib/services/onboarding-daemon.ts` (old monolithic path) | Actual canonical = `src/lib/services/onboarding-daemon/index.ts` | Update DAEMON path |
| 2 | `check-boardroom-briefing-truth-alignment.ts` lines 16-20 require `boardroom-layer7-state-coverage-report.json` etc. (never emitted) | Actual canonical = `generated/boardroom-layer7-closure-report.json` + `generated/boardroom-layer7-closure/*.json` | Update REQUIRED_BACKBONE list |
| 3 | `check-communications-connector-state-alignment.ts` line 19 checks `src/components/connectors/ConnectorStateBadge.tsx` | Actual canonical = `src/components/primitives/status/ConnectorStateBadge.tsx` | Update CANONICAL_CHIP path |
| 4 | None of the 6 flagship-surface validators are registered in `scripts/architecture/checks/check-os-release-readiness.ts` | `grep -c` returned 0 | Append 6 gate entries |
| 5 | Stale report JSONs reflect failure state | Reports show ok:false | Re-run validators after path fixes |

In-scope admin AI surfaces (admin-ai-runtime + admin-integrations) ARE truly green (0 errors, 0 warnings). All 8 deliverable docs and 7 status JSONs exist. Truth panel is mounted as tab 11 in `AIRuntimeHome.tsx`. Package.json scripts are wired.

## Phase 1 — Fix 3 stale canonical paths in validators

**`scripts/validation/check-onboarding-simulated-persona-disclosure.ts`** (line 14):
- Change `const DAEMON = "src/lib/services/onboarding-daemon.ts"` → `"src/lib/services/onboarding-daemon/index.ts"`

**`scripts/validation/check-boardroom-briefing-truth-alignment.ts`** (lines 16-20):
- Replace `REQUIRED_BACKBONE` array with the actually-existing canonical artifacts:
  - `generated/boardroom-layer7-closure-report.json`
  - `generated/boardroom-layer7-closure/boardroom-layer7-verification.json`
  - `generated/boardroom-layer7-closure/state-coverage.json`
  - `generated/boardroom-layer7-closure/outcome-coverage.json`
  - `generated/boardroom-layer7-closure/linkage.json`

**`scripts/validation/check-communications-connector-state-alignment.ts`** (line 19):
- Change `const CANONICAL_CHIP = "src/components/connectors/ConnectorStateBadge.tsx"` → `"src/components/primitives/status/ConnectorStateBadge.tsx"`

## Phase 2 — Wire all 6 new validators into the master release readiness aggregator

Edit `scripts/architecture/checks/check-os-release-readiness.ts` to register the 6 flagship-surface gates. Use existing gate-entry pattern (BLOCK or WARN tier matching the validator's classification):

- `check-onboarding-simulated-persona-disclosure` → WARN (honest-deferred)
- `check-boardroom-briefing-truth-alignment` → WARN (honest-deferred)
- `check-concierge-ai-state-handling` → WARN (honest-deferred)
- `check-communications-connector-state-alignment` → WARN (honest-deferred)
- `check-flagship-surface-trust-copy` → WARN (4 honest deferral warnings)
- `check-flagship-surface-responsive-quality` → WARN (14 honest deferral warnings)

The 2 already-BLOCK admin gates (`check-admin-ai-runtime-drilldowns`, `check-admin-integrations-health-visibility`) need to be registered as BLOCK if not already.

## Phase 3 — Re-emit reports + verify

Run `npm run closure:flagship-surface:run-all` to regenerate all 6 report JSONs. Then verify:
- Onboarding/boardroom/communications validators flip from `ok:false` → `ok:true` with 0 errors (warnings preserved as honest deferrals)
- All 6 reports exist on disk with canonical content
- Aggregator picks up all 8 flagship-surface gates (6 new + 2 existing)

## Phase 4 — Final closure verification

Update `generated/flagship-surface-closure/flagship-surface-verification.json` to reflect:
- All 8 validators wired into release-readiness aggregator
- All 6 reports green (0 errors)
- Canonical paths corrected
- Final state: 4 in-scope BLOCK green + 4 honest WARN deferred

## Files touched (final)

- **EDITED (4):** 3 validator scripts (path fixes) + `check-os-release-readiness.ts` (6 gate registrations)
- **REGENERATED (6):** All 6 flagship-surface report JSONs via npm run
- **UPDATED (1):** `flagship-surface-verification.json` final state

**Zero new files. Zero edits to user surfaces. Zero edits to admin domains beyond the aggregator. Zero stubs. Zero fake-green** — the deferred-user-surface warnings remain as honest WARN-tier markers, not silent passes.

After this pass: all 6 flagship-surface validators report `ok:true` with 0 errors (honest WARN preserved), all 6 wired into the master 211-gate release aggregator, deployment-ready.

