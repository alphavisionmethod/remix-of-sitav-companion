

# Implementation Truth System — Final Gap Closure Plan

## Current State: 10 of 14 Screens Built

| Spec Screen | Current Page | Status |
|---|---|---|
| ITS01 Overview | ITC01 | ✅ Complete |
| ITS02 Spec Registry | ITC02 | ✅ Complete (10 dims, 13 artifacts, CRUD, seed) |
| ITS03 Feature Detail / Implementation Map | ITC07 | ✅ Complete (per-spec artifact inventory) |
| ITS04 Feature Verification Manifest Explorer | — | **MISSING** |
| ITS05 Contract Registry | ITC03 | ✅ Complete (types, orphans, shadows, consumers) |
| ITS06 Wiring Graph Explorer | ITC04 | ✅ Complete (CRUD, synthetic chains, edge types) |
| ITS07 Architecture Compliance Board | ITC08 | ✅ Complete (reads generated report) |
| ITS08 Route/Shell/Component Inventory | ITC09 | ✅ Complete (manifest + reality cross-ref) |
| ITS09 Runtime Evidence Center | ITC10 | ✅ Complete (4 OS tables, per-spec mapping) |
| ITS10 Readiness Scorecards | ITC05 | ✅ Complete (10 dimensions, averages) |
| ITS11 Prompt Traceability Explorer | ITC06 (combined) | **Needs separation** — currently merged with drift |
| ITS12 Drift Radar | ITC06 (combined) | **Needs separation** — currently merged with traceability |
| ITS13 Validation Pipeline Monitor | — | **MISSING** |
| ITS14 Launch Truth Gate View | — | **MISSING** |

## What Needs to Be Built

### 1. Split ITC06 into two separate pages

**ITC06 — Drift Radar** (keep at `/admin/implementation-truth/drift`)
- Move ONLY the drift detection content here: drift stats cards, Active Drift Alerts table, DriftHeatmap by category (spec/code, contract/code, docs/runtime, route/manifest, shell/component, runtime claim), severity rail, drift resolution workflow hints
- Add drift category tabs for filtering
- Add drift_state per spec from DB

**ITC11 — Prompt Traceability Explorer** (new at `/admin/implementation-truth/prompts`)
- Move prompt-to-build traceability content here
- Add: prompt source table, prompt-to-feature mapping, coverage heatmap (how many specs per prompt phase are fully implemented), gap-by-prompt panel showing unimplemented features per prompt
- Coverage score per prompt phase

### 2. New: ITC12 — Validation Pipeline Monitor (`/admin/implementation-truth/pipeline`)

Shows static and runtime validation pipeline results:
- Last CI/validation run status (reads `generated/architecture-compliance-report.json` timestamp)
- Manifest validation: checks if route-manifest.json exists and is fresh
- Contract validation: summarizes ITC03 contract present/missing counts
- Route inventory validation: summarizes ITC09 classified/unclassified counts
- Runtime probe validation: summarizes ITC10 live/no-evidence counts
- Failing rule summary from architecture compliance
- Re-run instructions panel
- ValidationRunTimeline showing historical data points

### 3. New: ITC13 — Launch Truth Gate View (`/admin/implementation-truth/launch-gate`)

Shows implementation truth as launch blocker source:
- Features not ready (readiness < 50%)
- Runtime-unverified features (runtime_score = 0)
- Critical contract gaps (contract_score < 30 with required_contracts.length > 0)
- Proof/trust missing edges (proof_score = 0 with required_proofs.length > 0)
- Documentation truth gaps (docs_score < 20 with required_docs.length > 0)
- Ring impact panel showing how many specs per domain are launch-blocking
- Promotion eligibility badge strip per spec
- LaunchGateSummary with go/no-go verdict

### 4. New: ITC14 — Feature Verification Manifest Explorer (`/admin/implementation-truth/manifests`)

Per-feature manifest inspection:
- Select a spec, see its full manifest (all 13 artifact categories as a structured manifest view)
- Last validation assessment: compare required artifacts vs scores to determine pass/fail per area
- Missing expectations list: artifacts with 0 items or scores at 0
- Runtime evidence requirements card: required_proofs + required_events vs runtime_score
- Ownership panel showing owning_module and dependencies

### 5. Update ITC01 Overview

Add 4 new sub-page links to SUB_PAGES array:
- Prompt Traceability → `/admin/implementation-truth/prompts`
- Validation Pipeline → `/admin/implementation-truth/pipeline`
- Launch Truth Gate → `/admin/implementation-truth/launch-gate`
- Feature Manifests → `/admin/implementation-truth/manifests`

Total: 13 sub-page links from overview.

### 6. Wire routes in App.tsx

4 new lazy imports + 4 new Route entries:
- ITC11PromptTraceability
- ITC12ValidationPipeline
- ITC13LaunchTruthGate
- ITC14ManifestExplorer

### 7. Update Command Palette

Add 4 new entries to AdminCommandPalette.tsx for the new pages.

## Files Changed

| File | Action |
|---|---|
| `src/pages/admin/implementation-truth/ITC06DriftRadar.tsx` | **Edit** — remove prompt traceability section, add drift category tabs and drift heatmap |
| `src/pages/admin/implementation-truth/ITC11PromptTraceability.tsx` | **New** — dedicated prompt-to-build traceability explorer |
| `src/pages/admin/implementation-truth/ITC12ValidationPipeline.tsx` | **New** — validation pipeline monitor |
| `src/pages/admin/implementation-truth/ITC13LaunchTruthGate.tsx` | **New** — launch truth gate view |
| `src/pages/admin/implementation-truth/ITC14ManifestExplorer.tsx` | **New** — feature verification manifest explorer |
| `src/pages/admin/implementation-truth/ITC01Overview.tsx` | **Edit** — add 4 new sub-page links |
| `src/App.tsx` | **Edit** — 4 lazy imports + 4 routes |
| `src/components/admin/AdminCommandPalette.tsx` | **Edit** — add 4 nav entries |

## What Does NOT Change

- ITC02 Spec Registry — already has 10 dims, 13 artifacts, CRUD, seed, drift badge
- ITC03 Contract Verification — already has types, orphans, shadows, consumers
- ITC04 Wiring Graph — already has CRUD, synthetic chains, delete, evidence
- ITC05 Readiness Scorecards — already has 10 dimensions, platform averages
- ITC07 Implementation Map — already has 13 artifact sections, search
- ITC08 Architecture Compliance — already reads generated report
- ITC09 Route Inventory — already cross-references manifest + reality
- ITC10 Runtime Evidence — already queries 4 OS tables
- DB schema — no new tables or columns needed
- Hooks — all existing hooks sufficient for the 4 new pages
- Seed data — 27 specs already cover all required entries

## No New DB Tables Needed

All 4 new pages consume existing data:
- ITC11: `useSpecRegistry()` grouped by prompt_origin
- ITC12: fetches generated JSON files + reuses ITC03/ITC09/ITC10 aggregation logic
- ITC13: `useSpecRegistry()` filtered by score thresholds
- ITC14: `useSpecRegistry()` single-spec detail view

