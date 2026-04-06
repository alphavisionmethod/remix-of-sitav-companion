

# Parts 3–5: Admin OS Dashboards + Journey Seeds + CI Gating — Gap Analysis & Plan

## What Already Exists

### Admin OS Pages (Part 3)
All 8 pages exist (CJ01–CJ08), but the prompt remaps them differently. Current mapping vs prompt:

| Prompt Board | Current File | Status |
|---|---|---|
| CJ01 Executive Report | CJ01ExecutiveReport.tsx (213 lines) | **Exists but missing**: proof confidence distribution chart, real vs demo mismatch count, last full verification run timestamp, surface class breakdown |
| CJ02 Journey Truth Matrix | CJ02JourneyTruthMatrix.tsx (90 lines) | **Shallow**: no filters by domain/status/impact/surface/owner, no proof confidence column, no owner team column, no mode coverage column. Just a basic search input |
| CJ03 Journey Detail View | CJ03JourneyDetailView.tsx (185 lines) | **Exists with depth**: step results, evidence, runs. Missing: recommended fix display (field exists but only in runs), likely root cause layer, remediation notes |
| CJ04 Demo vs Real | CJ05DemoVsRealComparison.tsx (181 lines) | **Prompt says CJ04**, current is CJ05. Content is solid but missing: internal_test status column, recommended next action |
| CJ05 Launch Blocker Board | CJ04LaunchBlockerView.tsx (192 lines) | **Prompt says CJ05**, current is CJ04. Missing: war-room feel, age column, affected persona/mode columns |
| CJ06 Route & Action Coverage | CJ08RouteActionCoverage.tsx (168 lines) | **Prompt says CJ06**, current is CJ08. Missing: domain heatmap, weak coverage identification |
| CJ07 Recent Verification Runs | None | **Missing entirely** — prompt wants a dedicated runs feed |

Current CJ06 (BrokenClicksExplorer) and CJ07 (OwnerRemediationView) are not in the prompt's required list but are useful. We keep them.

### Journey Seeds (Part 4)
The registry at `journey-registry.ts` has 24 journeys with all P0 journeys already defined (auth.sign_in, auth.sign_up, auth.logout, files, assistant, boardroom, connectors, settings, admin routes). The seeder at `journey-registry-seeder.ts` maps them to DB. **Mostly complete** — just needs alignment with the exact journey keys/metadata from the prompt (e.g., `auth.sign_in_primary` vs `auth.sign_in`).

### CI Workflows (Part 5)
- `e2e.yml`: Exists with P0 tests + DB ingestion. Missing: nightly schedule, manual dispatch.
- `ci.yml`: Full pipeline exists with E2E step. Missing: journey-specific summary output, explicit P0 gating rules.
- No `customer-journey-nightly.yml` or `customer-journey-manual.yml`.

### Playwright (Part 2 — already done)
16 spec files, 8 helpers, 7 selectors — all implemented in previous message.

## Plan

### Phase 1 — Upgrade CJ02 Journey Truth Matrix (major gap)

Add multi-filter dropdowns (domain, status, launch impact, surface, owner), add columns for proof confidence, owner team, mode coverage. Use `v_customer_journey_summary` view instead of raw `useCustomerJourneys`.

### Phase 2 — Add CJ07 Recent Verification Runs Feed (new page)

Create a dedicated feed page showing: run time, journey key, mode, status, environment, evidence availability, commit SHA, summary. Query `useRecentFailures` + `journey_verification_runs`.

### Phase 3 — Upgrade CJ01 Executive Report

Add: proof confidence distribution (bar showing verified_e2e / verified_interaction / unverified counts), real vs demo mismatch count card, last full verification run timestamp, status by surface class breakdown.

### Phase 4 — Upgrade CJ04 (Launch Blockers) and CJ05 (Demo vs Real)

**CJ04** (currently LaunchBlockerView): Add age column (days since created), affected persona, affected modes, war-room visual intensity (red gradient background for critical).

**CJ05** (currently DemoVsRealComparison): Add internal_test status column, recommended next action column.

### Phase 5 — Upgrade CJ06 (Route Coverage) and CJ03 (Detail)

**CJ08→CJ06**: Add domain coverage heatmap grid, weak coverage identification (<30% threshold).

**CJ03**: Add root_cause_layer display, remediation notes field.

### Phase 6 — CI Workflows

**`customer-journey-nightly.yml`**: Scheduled 2x/day, runs full P0+P1+demo-vs-real suite, ingests results, uploads artifacts.

**`customer-journey-manual.yml`**: Manual dispatch with inputs for environment, mode, journey subset, headed/headless.

**Update `e2e.yml`**: Add markdown summary step, explicit P0 fail-on-critical gating, use `customer-journey` project.

### Phase 7 — Journey Registry Alignment

Update `journey-registry.ts` entries to match exact prompt keys where different (add `_primary` suffix variants). Add `surfaceClass` field to `JourneyDefinition` interface. Ensure seeder maps these correctly.

## Files Changed

| File | Action |
|---|---|
| `src/pages/admin/customer-journey/CJ02JourneyTruthMatrix.tsx` | Major rewrite — add filters, columns |
| `src/pages/admin/customer-journey/CJ07RecentVerificationRuns.tsx` | **New** — runs feed |
| `src/pages/admin/customer-journey/CJ01ExecutiveReport.tsx` | Add proof confidence, mismatch count, surface breakdown |
| `src/pages/admin/customer-journey/CJ04LaunchBlockerView.tsx` | Add age, persona, modes, war-room styling |
| `src/pages/admin/customer-journey/CJ05DemoVsRealComparison.tsx` | Add internal_test, next action |
| `src/pages/admin/customer-journey/CJ08RouteActionCoverage.tsx` | Add heatmap, weak coverage |
| `src/pages/admin/customer-journey/CJ03JourneyDetailView.tsx` | Add root cause, remediation notes |
| `.github/workflows/customer-journey-nightly.yml` | **New** |
| `.github/workflows/customer-journey-manual.yml` | **New** |
| `.github/workflows/e2e.yml` | Add summary, gating, project flag |
| `src/lib/customer-journey/journey-registry.ts` | Add surfaceClass, align keys |
| App router | Add route for CJ07 |

## No database migration needed
All views and tables already exist. Pure frontend + CI changes.

