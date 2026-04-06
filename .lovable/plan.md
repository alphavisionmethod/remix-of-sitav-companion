

# Customer Journey — Exact Schema Alignment + Views + Remaining Gaps

## Current State Analysis

**What exists and works:**
- `customer_journeys` table (flat, user-scoped with embedded JSON steps) — serves as registry
- `customer_journey_runs` (historical runs with 25 columns)
- `customer_journey_steps` (step results linked to runs)
- `customer_journey_blockers` (legacy blocker table)
- 6 new tables from last migration: `ui_action_inventory`, `journey_step_results`, `launch_blocker_scores`, `customer_journey_mode_comparisons`, `verification_evidence_assets`, `route_verification_coverage`
- 8 CJ admin pages (CJ01-CJ08), all functional
- 10 Playwright P0 test files in `tests/e2e/customer-journey/`
- CI workflow in `.github/workflows/e2e.yml`
- Blocker scoring engine, evidence hooks, coverage hooks, scoring hooks
- Journey reporter for Playwright

**What's missing vs the spec:**
1. **3 tables the spec requires but don't exist**: `customer_journey_registry` (the spec wants a normalized registry separate from `customer_journeys`), `customer_journey_status` (rolled-up current truth), `journey_verification_runs` (the spec's normalized run table — current `customer_journey_runs` exists but has a different schema)
2. **5 database views**: `v_customer_journey_summary`, `v_customer_journey_blockers`, `v_customer_journey_mode_deltas`, `v_route_verification_summary`, `v_customer_journey_recent_failures` — none exist
3. **Schema gaps on existing tables**: `ui_action_inventory` missing `owner_team`; `verification_evidence_assets` missing `metadata` jsonb column; `route_verification_coverage` missing `p1_verified_actions`; `launch_blocker_scores` missing `journey_id` FK (uses `journey_key` text instead)
4. **`journey_verification_runs` doesn't exist** — the spec wants `run_identifier`, `commit_sha`, `branch_name`, `environment`, `verification_type` columns for CI ingestion
5. **Hooks not wired to new normalized tables** — current hooks query `customer_journeys` and `customer_journey_runs`, not the spec's `customer_journey_registry` / `journey_verification_runs`
6. **No DB ingestion script** — the Playwright reporter outputs JSON but nothing ingests it into DB

## Plan

### Phase 1 — Database Migration

Create the 3 missing tables + 5 views + add missing columns to existing tables.

**New tables:**

| Table | Purpose |
|---|---|
| `customer_journey_registry` | Normalized canonical journey registry (no user_id, shared across system). Columns per spec: journey_key, display_name, persona, surface_class, domain_family, route_key, priority_class, launch_importance, expected_outcome, supported_modes, launch_honesty_class, owner_team, is_active |
| `customer_journey_status` | Rolled-up current truth per journey. FK to registry + last_verified_run_id, current_status, launch_impact, proof_confidence, actual_outcome_summary, recommended_fix, owner_team |
| `journey_verification_runs` | Normalized run table for CI ingestion. FK to registry, columns: mode, environment, verification_type, status, proof_confidence, steps_passed/failed/skipped, launch_impact, summary, evidence_bundle_ref, run_identifier, commit_sha, branch_name, started_at, completed_at |

**Alter existing tables:**
- `ui_action_inventory`: add `owner_team text null`
- `verification_evidence_assets`: add `metadata jsonb not null default '{}'::jsonb`
- `launch_blocker_scores`: add `journey_id uuid null references customer_journey_registry(id) on delete set null`

**5 views:**
- `v_customer_journey_summary` — registry + status + latest run metadata
- `v_customer_journey_blockers` — unresolved launch/pilot/claim blockers with journey metadata
- `v_customer_journey_mode_deltas` — mode comparisons with journey display names
- `v_route_verification_summary` — coverage aggregated by surface_class
- `v_customer_journey_recent_failures` — recent failed/partial runs with journey context

### Phase 2 — Journey Registry Seed Hook

**New file: `src/lib/customer-journey/journey-registry-seeder.ts`**

Seed `customer_journey_registry` and `customer_journey_steps` (the new normalized table linked by FK) from `CUSTOMER_JOURNEY_REGISTRY`. Also seed `customer_journey_status` with initial "unverified" state.

**New hook: `useSeedJourneyRegistry()`** — inserts into the 3 normalized tables.

### Phase 3 — Verification Run Ingestion Hook

**New file: `src/lib/customer-journey/journey-ingestion-hooks.ts`**

- `useRecordVerificationRun()` — insert into `journey_verification_runs` with CI metadata (commit_sha, branch, environment)
- `useUpdateJourneyStatus()` — update `customer_journey_status` from a completed run
- `useIngestPlaywrightResults()` — takes the JSON output from journey-reporter and creates runs + step results + auto-computes blocker scores

### Phase 4 — Update Admin Pages to Use Views

- CJ01: add query from `v_customer_journey_summary` for richer executive stats
- CJ04: query `v_customer_journey_blockers` view for pre-joined blocker data
- CJ05: query `v_customer_journey_mode_deltas` for display
- CJ08: query `v_route_verification_summary` for surface-level aggregation

### Phase 5 — Playwright Result Ingestion Script

**New file: `scripts/ingest-journey-results.ts`**

Node script that:
1. Reads `test-results/journey-reports/*.json`
2. Matches journey_key to `customer_journey_registry`
3. Inserts `journey_verification_runs` + `journey_step_results`
4. Calls blocker scoring engine for failed runs
5. Updates `customer_journey_status`

### Phase 6 — CI Workflow Enhancement

Update `.github/workflows/e2e.yml`:
- Add post-test step that runs `scripts/ingest-journey-results.ts` to push results to DB
- Add Supabase service role key secret for ingestion
- Add commit SHA and branch name as env vars for traceability

## Files Changed

| File | Change |
|---|---|
| **Migration SQL** | 3 new tables + 3 ALTER TABLE + 5 views |
| `src/lib/customer-journey/journey-registry-seeder.ts` | **New** — seed normalized registry + steps + status |
| `src/lib/customer-journey/journey-ingestion-hooks.ts` | **New** — verification run recording + Playwright result ingestion |
| `src/lib/customer-journey/journey-hooks.ts` | Add `useSeedJourneyRegistry()`, keep existing hooks for backward compat |
| `scripts/ingest-journey-results.ts` | **New** — CLI script for CI DB ingestion |
| `src/pages/admin/customer-journey/CJ01ExecutiveReport.tsx` | Query `v_customer_journey_summary` |
| `src/pages/admin/customer-journey/CJ04LaunchBlockerView.tsx` | Query `v_customer_journey_blockers` |
| `src/pages/admin/customer-journey/CJ05DemoVsRealComparison.tsx` | Query `v_customer_journey_mode_deltas` |
| `src/pages/admin/customer-journey/CJ08RouteActionCoverage.tsx` | Query `v_route_verification_summary` |
| `.github/workflows/e2e.yml` | Add ingestion step + env vars |

## Database migration required
3 new tables, 3 ALTER TABLE, 5 views.

