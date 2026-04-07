
# Phase 1: Behavioral Proof Activation

## Current State

**What exists and is solid:**
- 36 Playwright spec files across auth, route-smoke, journeys, admin, demo-vs-real, degraded, responsive
- 17 customer-journey specs in structured subdirectories with JourneyRecorder + evidence capture
- Helper infrastructure: auth, navigation, assertions, selectors, evidence, journey-recorder
- Journey reporter outputting structured JSON
- DB tables: `customer_journey_registry`, `journey_verification_runs`, `journey_step_results`, `customer_journey_status`
- Ingestion script: `scripts/ingest-journey-results.ts`
- CI workflows: `ci.yml` (has e2e-p0 job), `e2e.yml`, `customer-journey-nightly.yml`, `customer-journey-manual.yml`
- Admin surfaces: FL01 Flagship Loops, V02-V07 verification boards, AIG09 Runtime Verification

**What's missing (the gap):**
- Tests have never actually been run — zero proven passes exist
- CI e2e-p0 job serves the static build (`npx serve dist`) but the app requires Supabase env vars at runtime (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY) — the build step uses dummy values so the app likely fails at runtime
- No `data-testid` attributes on key elements the tests look for (`demo-mode-badge`, `error-state`, `sidebar-nav`, etc.)
- Auth tests require `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` secrets — when missing, most tests skip silently
- No proof classification or failure-to-loop mapping exists
- FL01 board reads from DB but no test results have ever been ingested

## Implementation Plan

### Step 1 — Fix CI Build for Runtime Testability

The `ci.yml` e2e-p0 job builds with dummy Supabase keys, then serves statically. The app needs real (or at least valid-looking) env vars at build time since Vite embeds them.

**Changes to `.github/workflows/ci.yml`** (e2e-p0 job):
- Pass `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from secrets during the build step
- Add `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` env vars to the test run step
- Add journey reporter output and evidence capture to artifacts

### Step 2 — Add Missing data-testid Attributes

Add stable test IDs to these components (minimum set for reliable proof):

| Component | Attribute |
|-----------|-----------|
| `DemoModeBadge.tsx` | `data-testid="demo-mode-badge"` |
| Sidebar nav container | `data-testid="sidebar-nav"` |
| Error boundary / error state | `data-testid="error-state"` |
| Sign out button | `data-testid="sign-out-btn"` |
| Empty state components | `data-testid="empty-state"` |
| Degraded/unavailable banners | `data-testid="degraded-banner"` |

~6 component files touched, 1 line each.

### Step 3 — Make Auth Tests Work Without Credentials

Currently 30+ tests skip when `TEST_USER_EMAIL` is empty. The auth-free tests (5 in `auth.spec.ts`) should always run. For the credential-dependent tests, add a clear annotation so the proof report distinguishes "skipped_not_configured" from "fail".

**Changes to `tests/e2e/helpers/auth.ts`:**
- Add a `skipOrLogin` helper that properly annotates skip reason

### Step 4 — Create Proof Classification System

New file: `tests/e2e/helpers/proof-classifier.ts`

Classifies each test result into:
- `pass_verified` / `fail_behavioral` / `fail_setup` / `fail_env` / `fail_selector` / `fail_auth` / `skipped_not_configured`

And launch impact:
- `launch_blocker` / `pilot_blocker` / `claim_risk` / `non_blocking`

Maps each test to its flagship loop:
```text
Loop 1 — Auth + Dashboard + Pulse
  auth.spec.ts, auth-journeys.spec.ts, sign-in-primary, sign-out-primary, dashboard-load-primary

Loop 2 — Files + AI Assist
  files-journey.spec.ts, files-upload-primary, assistant-chat-primary

Loop 3 — Boardroom + Summary + Decision
  boardroom-journey.spec.ts, boardroom-summary-view-primary, boardroom-demo-vs-real

Loop 4 — Connected Services + Sync
  connectors-journey.spec.ts, connected-services-open-primary, connected-services-demo-vs-real

Loop 5 — Admin Truth + Recommendation + Approval
  admin-boards.spec.ts, verification-boards.spec.ts, ai-team-open-primary, runtime-truth-open-primary, launch-truth-open-primary, customer-journey-report-open-primary, approvals-journey.spec.ts
```

### Step 5 — Enhanced Journey Reporter with Proof Classification

Update `tests/e2e/reporters/journey-reporter.ts` to:
- Classify failures using the proof classifier
- Map tests to flagship loops
- Output a `flagship-loop-proof-summary.json` alongside the journey results
- Generate a markdown summary for CI step summary

### Step 6 — Create Playwright Proof PR Workflow

New file: `.github/workflows/playwright-proof-pr.yml`

- Triggers on PR to main + push to main/develop
- Builds with real Supabase env vars
- Runs full 36-spec suite
- Captures: HTML report, screenshots, traces, videos on failure
- Generates flagship loop proof summary
- Posts proof summary to PR as step summary
- Uploads all artifacts (30-day retention)
- Fails on P0 launch-critical regressions only

### Step 7 — Create Playwright Proof Nightly Workflow

New file: `.github/workflows/playwright-proof-nightly.yml`

- Runs twice daily (6am/6pm UTC)
- Full suite with richer artifact capture
- Ingests results to DB via `ingest-journey-results.ts`
- Generates trend-aware summary
- Produces flagship loop proof dashboard data

### Step 8 — Wire Proof Results to Admin FL01 Board

Update `src/pages/admin/FL01FlagshipLoopsExecutive.tsx` to:
- Query `journey_verification_runs` for latest proof state per loop
- Show real pass/fail/skip counts from CI evidence
- Display "last proven" timestamp and commit
- Show proof confidence as `verified_e2e` (from CI) vs `inferred` (no runs)
- Add "Proof Evidence" section linking to latest artifacts

### Step 9 — Create Proof Evidence Explorer

New page: `src/pages/admin/verification/V06EvidenceExplorer.tsx` (update if exists)

- Lists all verification runs from `journey_verification_runs`
- Shows step-level results from `journey_step_results`
- Failure classification badges
- Flagship loop grouping
- Links to screenshots/traces (stored as artifact references)

### Step 10 — Launch Blocker Board Wiring

Update V07 Launch Blockers board to:
- Pull from `customer_journey_status` where `current_status = 'broken'`
- Map to flagship loops
- Show immediate fix recommendations based on failure classification

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `tests/e2e/helpers/proof-classifier.ts` | Create | Failure classification + loop mapping |
| `tests/e2e/reporters/journey-reporter.ts` | Modify | Add proof classification + loop summary |
| `.github/workflows/playwright-proof-pr.yml` | Create | PR proof workflow |
| `.github/workflows/playwright-proof-nightly.yml` | Create | Nightly proof workflow |
| `.github/workflows/ci.yml` | Modify | Fix env vars for e2e-p0 job |
| `src/components/sita/DemoModeBadge.tsx` | Modify | Add data-testid |
| `src/components/layout/AppSidebar.tsx` | Modify | Add data-testid to nav |
| `src/components/ErrorBoundary.tsx` | Modify | Add data-testid |
| `src/pages/admin/FL01FlagshipLoopsExecutive.tsx` | Modify | Wire real proof data |
| `src/pages/admin/verification/V06EvidenceExplorer.tsx` | Modify | Wire real run data |
| `src/pages/admin/verification/V07LaunchBlockers.tsx` | Modify | Wire proof-based blockers |

## No New Database Changes

All required tables already exist: `customer_journey_registry`, `journey_verification_runs`, `journey_step_results`, `customer_journey_status`, `launch_blocker_scores`.

## Success Criteria

1. The 36 Playwright specs execute in CI (not just exist)
2. Auth-free tests (auth.spec.ts = 5 tests) pass in CI
3. Auth-dependent tests properly annotate skip vs fail
4. Artifacts uploaded: HTML report + screenshots + traces
5. Flagship loop proof summary generated per CI run
6. FL01 admin board shows real proof state from DB
7. Failures classified by type and launch impact
8. Launch blockers derived from actual test outcomes, not inference

## What This Does NOT Do

- Does not write new tests (runs the existing 36)
- Does not redesign product UI
- Does not solve AI runtime gaps
- Does not add new route families
- Does not expand product breadth

This phase converts structural proof architecture into live executed proof with artifacts, evidence, and launch-honest reporting.
