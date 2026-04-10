

# Reality Conversion Program — Full 12-Screen Implementation

## Current State: 5 pages exist → Spec requires 12

| Spec Screen | Current Page | Status |
|---|---|---|
| RCP01 Overview | ❌ Missing | No executive overview with all KPIs aggregated |
| RCP02 Classification Matrix | ✅ RealityClassificationMatrix | Missing: confidence field, DomainHeatmap, scope filters, transition readiness |
| RCP03 Feature Reality Detail | ❌ Missing | No deep-dive per-feature page with evidence, mock usage, transition checklist |
| RCP04 Mock Replacement Board | ⚠️ MockReplacementProgram | Missing: many spec fields (mockType, owner, blockers, migrationStatus lifecycle, validationEvidence) |
| RCP05 Mock Source Inventory | ❌ Missing | No mock file/source inventory with import graph |
| RCP06 Simulated Core Services | ⚠️ CoreServicePersistence | Missing: usage domains detail, state loss severity, dependency map |
| RCP07 Route Reality Heatmap | ❌ Missing | No visual route heatmap |
| RCP08 Contract & Backend Readiness | ❌ Missing | No contract/endpoint/schema readiness board |
| RCP09 Launch Honesty Board | ⚠️ LaunchHonestyBoard | Missing: claim severity, domain truth breakdown, promotion risk matrix |
| RCP10 Migration Wave Planner | ❌ Missing | No wave planning with dependency timeline |
| RCP11 Reality Progress Timeline | ❌ Missing | No conversion progress tracking |
| RCP12 Runtime Reality Validation | ⚠️ RuntimeTruthGate | Missing: post-migration verification, drift, mutation cards |

**Registry gaps:** `FeatureRealityRecord` missing `confidence`, `scopeLevel`, `components`, `services`, `backingSourceTypes`, `nextRequiredTransition`, `transitionBlockers`. `MockReplacementRecord` missing `mockType`, `owner`, `blockers[]`, `migrationStatus` lifecycle, `validationEvidence[]`, `truthSeverity`. No mock source inventory data. No migration wave data. No progress timeline data. No contract readiness data.

## Plan

### 1. Massively expand `src/lib/reality-audit/reality-audit-registry.ts`

**Extend existing types:**
- `FeatureRealityRecord` → add `confidence`, `scopeLevel`, `components[]`, `services[]`, `backingSourceTypes[]`, `nextRequiredTransition`, `transitionBlockers[]`, `owner`
- `MockReplacementRecord` → add `mockType`, `owner`, `blockers[]`, `migrationStatus` (identified→planned→in_progress→blocked→completed→validated), `validationEvidence[]`, `truthSeverity`, `expectedContracts[]`, `persistenceTarget`
- Update all seed data to include new fields

**New types + seeds:**
- `MockSourceRecord` — mock file/source with importing pages, domain, criticality, allowed/forbidden (~15 records)
- `ContractReadinessRecord` — expected contract, existence, endpoint, edge fn, schema, query readiness (~12 records)  
- `MigrationWaveRecord` — wave ID, priority, domain group, features[], owner, effort, readiness gain (~4 waves)
- `RealityTransitionRecord` — feature, from state, to state, date, evidence (seed ~5 historical transitions)

**New helpers:**
- `getMockSourceInventory()`, `getContractReadiness()`, `getMigrationWaves()`, `getRouteHeatmapData()`, `getDomainRealityRollups()`, `getFeatureTransitionChecklist()`, `getProgressTimeline()`, `getPostMigrationValidation()`

### 2. Create 7 new pages

| File | Spec |
|---|---|
| `RCP01Overview.tsx` | Executive overview: state distribution chart, mock-backed critical lane, migration progress, launch blockers, recent conversions |
| `RCP03FeatureDetail.tsx` | Per-feature deep dive: evidence panel, mock usage, persistence status, interaction/runtime, state transition checklist |
| `RCP05MockSourceInventory.tsx` | Mock file inventory: source table, importing pages, forbidden usage warnings, domain impact |
| `RCP07RouteHeatmap.tsx` | Visual route clusters by domain color-coded by reality state, criticality legend, launch overlay |
| `RCP08ContractReadiness.tsx` | Contract gap matrix, endpoint status, edge fn existence, migration dependency panel |
| `RCP10WavePlanner.tsx` | Migration wave board with dependency timeline, effort vs truth gain, owner assignment |
| `RCP11ProgressTimeline.tsx` | Conversion progress: state transitions over time, mock reduction, proven growth, milestones |

### 3. Enhance 4 existing pages

- **RealityClassificationMatrix (RCP02)**: Add confidence badges, scope filters, domain heatmap section, transition readiness drawer
- **MockReplacementProgram (RCP04)**: Add full migration status lifecycle, owner column, blockers drawer, validation checklist panel  
- **CoreServicePersistence (RCP06)**: Add usage domain detail, state loss severity cards, usage dependency map
- **LaunchHonestyBoard (RCP09)**: Add claim severity column, domain truth breakdown section, promotion risk matrix
- **RuntimeTruthGate (RCP12)**: Add post-migration verification feed, mutation persistence cards, drift detection

### 4. Wire routes + navigation

- Add 7 lazy imports + 7 routes in `App.tsx`
- Add 7 command palette entries in `AdminCommandPalette.tsx`
- Add sub-page navigation across all 12 RCP screens

### Technical approach
- All in-memory data, consistent with existing pattern
- Each new page 150-300 lines with KPI bands, tables, filters, detail drawers
- Existing pages enhanced in-place
- Dark theme, premium styling matching existing pages
- Cross-links between all 12 screens

