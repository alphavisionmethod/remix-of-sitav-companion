

# Phase 1: Behavioral Proof Activation — Implementation Plan

## What This Solves

SITA has 36 Playwright specs, strong journey architecture, DB tables for proof storage, CI workflows, and admin boards — but zero proven test passes exist. All proof is inferred. This phase makes the truth executable and visible.

## Implementation Steps

### Step 1 — Add data-testid Attributes (4 files, 1 line each)

- `src/components/sita/DemoModeBadge.tsx` — add `data-testid="demo-mode-badge"` to both the compact span (line 26) and the Badge (line 33)
- `src/components/sita/ErrorBoundary.tsx` — add `data-testid="error-state"` to the error container div (line 39)
- `src/components/sita/AppSidebar.tsx` — add `data-testid="sidebar-nav"` to the Sidebar component (line 191)
- Find and add `data-testid="sign-out-btn"` to the sign-out button in AppSidebar (already referenced in auth helper tests)

### Step 2 — Create Proof Classifier

New file: `tests/e2e/helpers/proof-classifier.ts`

Maps every spec file to its flagship loop and provides failure classification:

```text
Loop 1 (Auth + Dashboard + Pulse):
  auth.spec.ts, auth-journeys.spec.ts, sign-in-primary, sign-out-primary, dashboard-load-primary

Loop 2 (Files + AI Assist):
  files-journey.spec.ts, files-upload-primary, assistant-chat-primary

Loop 3 (Boardroom + Summary + Decision):
  boardroom-journey.spec.ts, boardroom-summary-view-primary, boardroom-demo-vs-real

Loop 4 (Connected Services + Sync):
  connectors-journey.spec.ts, connected-services-open-primary, connected-services-demo-vs-real

Loop 5 (Admin Truth + Recommendation + Approval):
  admin-boards.spec.ts, verification-boards.spec.ts, approvals-journey.spec.ts,
  ai-team-open-primary, runtime-truth-open-primary, launch-truth-open-primary,
  customer-journey-report-open-primary
```

Classification categories: `pass_verified`, `fail_behavioral`, `fail_setup`, `fail_env`, `fail_selector`, `fail_auth`, `skipped_not_configured`

Launch impact: `launch_blocker`, `pilot_blocker`, `claim_risk`, `non_blocking`

### Step 3 — Enhanced Journey Reporter

Update `tests/e2e/reporters/journey-reporter.ts` to:
- Use the proof classifier to categorize each failure
- Map tests to flagship loops
- Output `flagship-loop-proof-summary.json` alongside journey results
- Generate markdown summary for CI step summary

### Step 4 — Fix CI e2e-p0 Environment Variables

Update `.github/workflows/ci.yml` e2e-p0 job:
- Pass `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from secrets during build
- Add `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` to test run step
- Add journey report artifacts to upload

### Step 5 — Create Playwright Proof PR Workflow

New file: `.github/workflows/playwright-proof-pr.yml`
- Triggers on PR to main + push to main/develop
- Builds with real Supabase env vars
- Runs full 36-spec suite
- Captures HTML report, screenshots, traces, videos on failure
- Generates flagship loop proof summary
- Posts proof summary to PR as step summary
- Fails on P0 launch-critical regressions only

### Step 6 — Create Playwright Proof Nightly Workflow

New file: `.github/workflows/playwright-proof-nightly.yml`
- Runs twice daily (6am/6pm UTC)
- Full suite with richer artifact capture
- Ingests results to DB via `ingest-journey-results.ts`
- Generates trend-aware summary

### Step 7 — Wire FL01 Flagship Loops Board to Real Proof Data

Update `src/pages/admin/FL01FlagshipLoopsExecutive.tsx`:
- Query `journey_verification_runs` for latest proof state per loop
- Show real pass/fail/skip counts from CI evidence
- Display "last proven" timestamp and commit SHA
- Show proof confidence as `verified_e2e` vs `inferred`

### Step 8 — Wire V06 Evidence Explorer + V07 Launch Blockers

- V06: List all verification runs from `journey_verification_runs` with step-level results, failure classification badges, flagship loop grouping
- V07: Pull from `customer_journey_status` where broken, map to flagship loops, show fix recommendations

## Files Summary

| File | Action |
|------|--------|
| `src/components/sita/DemoModeBadge.tsx` | Add data-testid |
| `src/components/sita/ErrorBoundary.tsx` | Add data-testid |
| `src/components/sita/AppSidebar.tsx` | Add data-testid (sidebar + sign-out) |
| `tests/e2e/helpers/proof-classifier.ts` | Create |
| `tests/e2e/reporters/journey-reporter.ts` | Enhance with classification + loop summary |
| `.github/workflows/ci.yml` | Fix e2e-p0 env vars |
| `.github/workflows/playwright-proof-pr.yml` | Create |
| `.github/workflows/playwright-proof-nightly.yml` | Create |
| `src/pages/admin/FL01FlagshipLoopsExecutive.tsx` | Wire real proof data |
| `src/pages/admin/verification/V06EvidenceExplorer.tsx` | Wire real run data |
| `src/pages/admin/verification/V07LaunchBlockers.tsx` | Wire proof-based blockers |

## No Database Changes Required

All tables exist: `customer_journey_registry`, `journey_verification_runs`, `journey_step_results`, `customer_journey_status`, `launch_blocker_scores`.

## Success Criteria

1. 36 Playwright specs execute in CI (not just exist)
2. Auth-free tests (5 in auth.spec.ts) pass in CI
3. Artifacts uploaded: HTML report + screenshots + traces
4. Flagship loop proof summary generated per CI run
5. FL01 admin board shows real proof state from DB
6. Failures classified by type and launch impact
7. Launch blockers derived from actual test outcomes
