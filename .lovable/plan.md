

# Implementation Truth System — Enhancement Plan

## Audit Summary

All 10 ITC pages exist and are routed. The core DB tables (`implementation_spec_registry`, `implementation_wiring_edges`) are live with RLS. Data hooks and spec seeder are functional. Here is what needs enhancement or is missing:

## Gaps Found

### 1. Missing DB columns the spec requires
The spec demands: `required_shells`, `required_endpoints`, `required_schemas`, `required_docs`, `required_screens`, `required_projections`, `drift_state`, `architecture_score`, `test_score`, `docs_score`, `proof_score`, `policy_score`. The current table only has: `required_routes`, `required_components`, `required_services`, `required_contracts`, `required_events`, `required_tests`, `required_proofs` + 5 scores. The spec asks for 10 scoring dimensions but only 5 exist in DB/hooks/UI.

### 2. Hooks missing the extra fields
`SpecRegistryEntry` type needs expansion to match the new columns. `useContractVerification` infers status from `contract_score` threshold rather than checking actual contract file existence. `useDriftDetection` only checks 4 heuristic rules — needs more checks (route-in-manifest, component-file-exists, contract-file-exists, shell-wrapping, endpoint-existence).

### 3. Seed data incomplete
`use-spec-seed.ts` has 20 specs but is missing several from the prompt: `money-twin`, `financial-stress-radar`, `founder-split-brain-protection`, `customer-journey-twin`, `intelligence-reuse-engine`, `deployment-truth-center`, `proof-coverage-board`. Also none of the seed entries populate the new fields (shells, endpoints, schemas, docs, screens, projections).

### 4. ITC05 Readiness Scorecards only shows 5 dimensions
The spec requires 10: spec, UI, contract, backend/wiring, test, runtime, architecture, proof/trust, docs, policy/production. Only 5 columns exist in DB.

### 5. ITC03 Contract Registry lacks contract types
The spec requires tracking: contract type (api, event, schema, view_model, action_state, proof, policy), frontend consumers, backend implementers, version, schema alignment. Current implementation only tracks name + requiredBy + present/missing status.

### 6. ITC04 Wiring Graph lacks stored wiring edge CRUD UI
Users cannot add/edit wiring edges from the UI — only view synthetic or DB-stored edges.

### 7. Command palette and keyboard shortcuts missing ITC entry
`AdminCommandPalette.tsx` and `AdminKeyboardShortcuts.tsx` have no ITC routes.

### 8. No sidebar entry
ITC is not in any admin sidebar/nav config.

---

## Implementation Plan

### Step 1: DB Migration — Add missing columns

Add to `implementation_spec_registry`:
- `required_shells text[] DEFAULT '{}'`
- `required_endpoints text[] DEFAULT '{}'`
- `required_schemas text[] DEFAULT '{}'`
- `required_docs text[] DEFAULT '{}'`
- `required_screens text[] DEFAULT '{}'`
- `required_projections text[] DEFAULT '{}'`
- `drift_state text DEFAULT 'unknown'`
- `architecture_score int DEFAULT 0`
- `test_score int DEFAULT 0`
- `docs_score int DEFAULT 0`
- `proof_score int DEFAULT 0`
- `policy_score int DEFAULT 0`

### Step 2: Update `use-implementation-truth.ts`

- Expand `SpecRegistryEntry` type with all new fields
- Expand `DEMO_SPECS` with new fields populated
- Expand `useImplementationStats` to use 10-dimension scoring
- Enhance `useDriftDetection` with deeper heuristic checks (route-count mismatch, component-count mismatch, shell-count mismatch, endpoint-count mismatch, projection-count mismatch, proof vs runtime mismatch)
- Enhance `useContractVerification` with contract type tracking

### Step 3: Update `use-spec-seed.ts`

- Add 7 missing spec entries (money-twin, financial-stress-radar, founder-split-brain-protection, customer-journey-twin, intelligence-reuse-engine, deployment-truth-center, proof-coverage-board)
- Populate new fields (shells, endpoints, schemas, docs, screens, projections) for all 27 specs
- Add realistic scores for the 5 new dimensions

### Step 4: Enhance ITC02 Spec Registry

- Show all 10 dimension score bars in the expanded detail view
- Display new artifact sections (shells, endpoints, schemas, docs, screens, projections)
- Show drift_state badge per spec

### Step 5: Enhance ITC03 Contract Verification

- Add contract type column (inferred from name patterns or spec metadata)
- Add frontend/backend consumer columns
- Add orphan contract detection section

### Step 6: Enhance ITC04 Wiring Graph

- Add a "Create Edge" form so operators can manually record wiring edges
- Add edge delete capability
- Show edge evidence and verification timestamp inline

### Step 7: Enhance ITC05 Readiness Scorecards

- Expand from 5 to 10 scoring dimensions: spec, UI, contract, wiring, runtime, architecture, test, docs, proof, policy
- Update Platform Dimension Averages to show all 10

### Step 8: Enhance ITC06 Drift Radar

- Add deeper drift detection rules:
  - "Required shells specified but no shell data"
  - "Required endpoints specified but no backend score"
  - "Spec has projections but runtime score is 0"
  - "Docs required but docs_score is 0"
- Show drift_state from DB per spec in the traceability section

### Step 9: Enhance ITC07 Implementation Map

- Add new artifact sections: shells, endpoints, schemas, docs, screens, projections
- Total artifact count includes new fields

### Step 10: Wire into Command Palette + Keyboard Shortcuts

- Add ITC entries to `AdminCommandPalette.tsx` NAV_ITEMS:
  - "Implementation Truth Center" → `/admin/implementation-truth`
  - Plus sub-page entries for specs, contracts, wiring, readiness, drift, map, architecture, routes, runtime
- Add keyboard shortcut `g t` for Implementation Truth in `AdminKeyboardShortcuts.tsx`

---

## Files Changed

| File | Action |
|------|--------|
| Migration SQL | **New** — ALTER TABLE add 12 columns |
| `src/hooks/use-implementation-truth.ts` | **Edit** — expanded types, 10 dimensions, deeper drift |
| `src/hooks/use-spec-seed.ts` | **Edit** — 7 new specs, all specs get new fields |
| `src/pages/admin/implementation-truth/ITC02SpecRegistry.tsx` | **Edit** — 10 score bars, new artifact sections, drift badge |
| `src/pages/admin/implementation-truth/ITC03ContractVerification.tsx` | **Edit** — type column, consumer columns, orphan detection |
| `src/pages/admin/implementation-truth/ITC04WiringGraph.tsx` | **Edit** — edge CRUD form |
| `src/pages/admin/implementation-truth/ITC05ReadinessScoreboard.tsx` | **Edit** — 10 dimensions |
| `src/pages/admin/implementation-truth/ITC06DriftRadar.tsx` | **Edit** — deeper drift rules, drift_state display |
| `src/pages/admin/implementation-truth/ITC07ImplementationMap.tsx` | **Edit** — new artifact sections |
| `src/components/admin/AdminCommandPalette.tsx` | **Edit** — add ITC nav entries |
| `src/components/admin/AdminKeyboardShortcuts.tsx` | **Edit** — add ITC shortcut |

## What is NOT changed (already correct)
- ITC01 Overview — already shows all 9 sub-page links, stats, drift alerts
- ITC08 Architecture Compliance — already reads generated report, shows pass/fail
- ITC09 Route Inventory — already cross-references route-manifest + reality_classifications
- ITC10 Runtime Evidence — already queries 4 OS tables, shows per-spec evidence
- DB tables structure (only adding columns, not restructuring)
- All 10 routes in App.tsx (already registered)

