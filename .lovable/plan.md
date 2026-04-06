

# Customer Journey 100/100 — Full Implementation Plan

## Current State

**What exists:**
- 7 CJ admin pages (CJ01-CJ07) — all DB-backed with React Query hooks
- `customer_journeys` table with 18 columns, `customer_journey_runs`, `customer_journey_steps`, `customer_journey_blockers` tables
- `journey-registry.ts` with 24 journey definitions (auth, core, files, boardroom, AI, connectors, settings, admin, demo, onboarding, search, money, business)
- `journey-hooks.ts` with 7 hooks (queries + seed + record run)
- `surface-registry.ts` with full UI action inventory (~215 lines, P0/P1/P2 entries)
- 19 E2E test files — but most are shallow (auth guard checks, route-load only)
- Existing `verification_surfaces`, `verification_runs`, `verification_evidence`, `verification_blockers` tables

**What's missing (the gap to 100%):**
1. **6 new DB tables**: `ui_action_inventory`, `launch_blocker_scores`, `customer_journey_mode_comparisons`, `verification_evidence_assets`, `route_verification_coverage`, `journey_step_results` — the spec requires these for structured evidence, coverage tracking, mode comparison, and blocker scoring
2. **Real Playwright P0 tests**: Current tests are auth-guard smoke tests. Zero actual clickthrough verification exists
3. **Testability upgrades**: No `data-testid` on most interactive elements
4. **Journey detail view (CJ03)** doesn't show step-level results from DB
5. **Route/action coverage board** not wired to DB coverage table
6. **Launch blocker scoring** is manual — no automated severity computation
7. **Evidence asset storage** not structured
8. **CI integration** config not set up

## Plan

### Phase 1 — Database Migration (6 new tables)

Create migration adding:

| Table | Purpose |
|---|---|
| `ui_action_inventory` | Full inventory of every clickable action (route_key, action_key, action_type, selector_hint, test_id, priority, launch_honesty_class) |
| `journey_step_results` | Per-step results for each verification run (verification_run_id FK, step_order, status, actual_behavior, error_summary, screenshot_ref, duration_ms) |
| `launch_blocker_scores` | Automated blocker scoring (journey_key, blocker_type, severity_score, affects_demo/real/admin/user, resolved) |
| `customer_journey_mode_comparisons` | Demo vs real status per journey (real_status, demo_status, comparison_summary, claim_risk) |
| `verification_evidence_assets` | Screenshots/traces/logs/videos linked to runs (run_id FK, asset_type, asset_ref, label) |
| `route_verification_coverage` | Coverage rollup per route (total_actions, verified_actions, p0/p1 counts, coverage_percent) |

All tables get RLS policies for authenticated users with `user_id` column.

### Phase 2 — Data Services & Hooks

**New file: `src/lib/customer-journey/journey-evidence-hooks.ts`**
- `useStepResults(runId)` — query `journey_step_results`
- `useRecordStepResult()` — insert step result mutation
- `useEvidenceAssets(runId)` — query `verification_evidence_assets`
- `useAddEvidenceAsset()` — insert asset mutation

**New file: `src/lib/customer-journey/journey-scoring-hooks.ts`**
- `useBlockerScores()` — query `launch_blocker_scores`
- `useComputeBlockerScore()` — mutation that auto-classifies severity based on journey priority + status + mode
- `useModeComparisons()` — query `customer_journey_mode_comparisons`
- `useUpdateModeComparison()` — mutation

**New file: `src/lib/customer-journey/journey-coverage-hooks.ts`**
- `useActionInventory()` — query `ui_action_inventory`
- `useSeedActionInventory()` — seed from `SURFACE_REGISTRY`
- `useRouteCoverage()` — query `route_verification_coverage`
- `useUpdateRouteCoverage()` — recompute coverage per route

**Expand `journey-hooks.ts`:**
- `useResolveBlocker()` — resolve a blocker entry
- `useJourneyDetail(journeyKey)` — single journey + latest run + steps

### Phase 3 — Blocker Scoring Engine

**New file: `src/lib/customer-journey/blocker-scoring-engine.ts`**

Automated scoring function that takes a journey run result and computes:
- `blocker_type`: launch_blocker / pilot_blocker / claim_risk / important_non_blocker / non_blocking
- `severity_score`: 0-100 based on: journey priority (P0=high), user harm (broken=critical), mode affected, claim risk, dependency centrality
- Auto-creates `launch_blocker_scores` row
- Updates `customer_journey_mode_comparisons` when runs exist for both modes

### Phase 4 — Upgrade CJ Admin Pages

| Page | Current | Upgrade |
|---|---|---|
| **CJ03 JourneyDetailView** | Shows run list only | Add step-level results table, evidence viewer, failure diagnosis panel, recommended fix |
| **CJ05 DemoVsRealComparison** | Derives from runs client-side | Also persist to `customer_journey_mode_comparisons`, show claim_risk flags prominently |
| **CJ04 LaunchBlockerView** | Lists blockers | Add severity scores, resolve action, auto-computed blocker classification |

**New page: `CJ08RouteActionCoverage.tsx`**
- Shows `route_verification_coverage` data
- Action inventory browser with filter by domain/priority
- Gap analysis: routes with 0% coverage highlighted
- Seed from `SURFACE_REGISTRY` button

### Phase 5 — Testability Upgrades to Frontend

Add `data-testid` attributes to critical interactive elements across ~15 key pages:
- Login/signup forms and submit buttons
- Sidebar navigation links
- Files page upload button, file list
- Boardroom refresh button, content area
- Advisor chat input, send button
- Approvals action buttons
- Settings save button
- Admin truth boards
- Demo mode badge/indicator
- Loading/error/empty state containers

### Phase 6 — Playwright P0 Test Suite

**New folder structure:**
```text
tests/e2e/
  helpers/
    auth.ts          — login/logout helpers
    selectors.ts     — centralized selector constants
    reporter.ts      — structured result export for DB ingestion
  customer-journey/
    auth.spec.ts     — sign_in, sign_out, session_persistence
    dashboard.spec.ts — dashboard load, widget rendering
    files.spec.ts    — browse, upload, file appears
    boardroom.spec.ts — load, refresh
    assistant.spec.ts — open, send message, degraded state
    approvals.spec.ts — open, decision flow
    connectors.spec.ts — open, status check
    settings.spec.ts  — account open, edit
    admin.spec.ts     — truth board, CJ report, launch readiness
    demo-vs-real.spec.ts — boardroom, assistant, connectors comparison
```

Each test:
- Uses auth helper for login
- Captures screenshot on failure
- Exports structured result (journey_key, steps_passed, steps_failed, status)
- Tagged with priority (P0/P1)

**Reporter** (`tests/e2e/reporters/journey-reporter.ts`):
- Custom Playwright reporter that outputs JSON results
- Can be ingested into `customer_journey_runs` + `journey_step_results` tables

### Phase 7 — CI Integration

**Update `playwright.config.ts`:**
- Add `customer-journey` project for P0 suite
- Configure reporter to output JSON artifacts
- Add GitHub Actions workflow snippet (`.github/workflows/e2e.yml`) for PR-triggered P0 runs

### Phase 8 — Seed Data

Extend `ecosystem-master-seeder.ts`:
- Seed `ui_action_inventory` from `SURFACE_REGISTRY` (~60 actions)
- Seed initial `route_verification_coverage` rows for all registered routes
- Seed `customer_journey_mode_comparisons` with initial "no_data" state

## Files Changed

| File | Change |
|---|---|
| **Migration SQL** | 6 new tables + RLS + indexes |
| `src/lib/customer-journey/journey-evidence-hooks.ts` | **New** — 4 hooks |
| `src/lib/customer-journey/journey-scoring-hooks.ts` | **New** — 4 hooks |
| `src/lib/customer-journey/journey-coverage-hooks.ts` | **New** — 4 hooks |
| `src/lib/customer-journey/blocker-scoring-engine.ts` | **New** — auto-classification logic |
| `src/lib/customer-journey/journey-hooks.ts` | Add `useResolveBlocker`, `useJourneyDetail` |
| `src/pages/admin/customer-journey/CJ03JourneyDetailView.tsx` | Step results + evidence viewer |
| `src/pages/admin/customer-journey/CJ04LaunchBlockerView.tsx` | Severity scores + resolve action |
| `src/pages/admin/customer-journey/CJ05DemoVsRealComparison.tsx` | Persist comparisons + claim risk |
| `src/pages/admin/customer-journey/CJ08RouteActionCoverage.tsx` | **New** — coverage board |
| `tests/e2e/helpers/auth.ts` | **New** — login helper |
| `tests/e2e/helpers/selectors.ts` | **New** — selector constants |
| `tests/e2e/reporters/journey-reporter.ts` | **New** — structured output |
| `tests/e2e/customer-journey/*.spec.ts` | **New** — 10 P0 test files |
| `playwright.config.ts` | Add customer-journey project |
| `src/lib/seed/ecosystem-master-seeder.ts` | Seed action inventory + coverage |
| ~15 frontend pages | Add `data-testid` attributes |

## Database migration required
6 new tables with RLS policies.

