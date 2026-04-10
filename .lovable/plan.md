

# Platform Law — 10-Screen Spec Implementation Plan

## Gap Analysis: Spec (PLT01-10) vs Current (PLE01-07)

| Spec Screen | Current Page | Status | Action |
|---|---|---|---|
| PLT01 Overview | PLE01 | ⚠️ Missing: DomainComplianceHeatmap, LaunchBlockerPanel, top offender domains, noncompliant features | Enhance |
| PLT02 Law Pack Explorer | PLE02 | ⚠️ Missing: VersionTimeline | Minor enhance |
| PLT03 Manifest Coverage Board | PLE05 | ⚠️ Missing: DomainCoverageChart, CoverageTrendPanel, MissingManifestLane as dedicated sections | Enhance |
| PLT04 Validation Run Center | PLE04 | ⚠️ Missing: FailureBreakdownChart, ViolationDrawer with per-violation detail, ReRunBar | Enhance |
| PLT05 Violation Triage Board | ❌ Missing | Partially covered by violations table in PLE07, but needs dedicated page | **Create new** |
| PLT06 Feature Compliance Detail | ❌ Missing | No per-feature deep compliance view exists | **Create new** |
| PLT07 Generator Compliance | PLE03 | ⚠️ Missing: ArtifactMatrix, DriftWarnings, adoption rate | Enhance |
| PLT08 Launch Enforcement Board | ❌ Missing | Launch gates exist in manifest enforcer tab, but no dedicated blocking/ring view | **Create new** |
| PLT09 Ownership Board | PLE06 | ⚠️ Missing: OwnerScorecards, NoOwnerWarningLane, EscalationGraph, MTTR | Enhance |
| PLT10 Drift Enforcement Radar | ❌ Missing | Drift shown in PLE01/PLE07 but no dedicated radar | **Create new** |

## Registry Additions Needed

The registry needs new data + helpers for:
- **Enforcement architecture model** (5 layers A-E with probe classes, escalation strategy)
- **PR template** and **feature generator template** as typed records
- **Probe class definitions** with output expectations
- **Domain compliance scores** (aggregated from existing data)
- **Waiver records** for violation triage
- **Feature-level compliance aggregation** helper functions
- **Escalation state tracking** (persist time, MTTR estimates)

## Files to Create (4 new pages)

| File | Spec | Purpose |
|---|---|---|
| `src/pages/admin/platform-law/PLT05ViolationTriage.tsx` | PLT05 | Operational triage: open violations, blockers, owners, age, waivers, repeat violators |
| `src/pages/admin/platform-law/PLT06FeatureCompliance.tsx` | PLT06 | Per-feature deep view: manifests, contracts, routes, shell, interactions, journeys, tests, runtime evidence, readiness, violations |
| `src/pages/admin/platform-law/PLT08LaunchEnforcement.tsx` | PLT08 | Launch blockers: failing journeys, missing evidence, contract drift, ring impact, release eligibility |
| `src/pages/admin/platform-law/PLT10DriftRadar.tsx` | PLT10 | Full drift radar: heatmap by category, timeline, aging, resolution flow |

## Files to Edit

### 1. `src/lib/platform-law/platform-law-registry.ts`
- Add `ProbeClassDefinition` type + `PROBE_CLASSES[]` seed (8 probe types: page, journey, write-flow, approval, command-palette, money-safe, admin-critical, deployment-gate)
- Add `EnforcementArchitectureLayer` type + `ENFORCEMENT_ARCHITECTURE[]` seed (5 layers A-E: Local, PR/CI, Nightly, Runtime, Release)
- Add `PRTemplateField` type + `PR_TEMPLATE[]` seed (all required fields/checklist items)
- Add `FeatureGeneratorTemplate` type + `FEATURE_GENERATOR_TEMPLATE[]` seed
- Add `WaiverRecord` type + `WAIVERS[]` seed (~4 records)
- Add helper: `getViolationsByOwner()`, `getViolationsByFeature()`, `getViolationAge()`, `getRepeatViolators()`, `getDriftByCategory()`, `getDriftTimeline()`, `getFeatureComplianceScore()`, `getDomainComplianceScores()`, `getLaunchBlockers()`, `getNoOwnerGaps()`, `getOwnerMTTR()`

### 2. `src/pages/admin/platform-law/PLE01Overview.tsx` (→ PLT01)
- Add DomainComplianceHeatmap (grid of domain scores by color)
- Add LaunchBlockerPanel (features blocked from release)
- Add top offender domains strip
- Add noncompliant new features lane

### 3. `src/pages/admin/platform-law/PLE02LawRegistry.tsx` (→ PLT02)
- Add VersionTimeline in detail drawer (showing law version history)

### 4. `src/pages/admin/platform-law/PLE04CIGateMonitor.tsx` (→ PLT04)
- Add FailureBreakdownChart (violations by severity visual)
- Add ViolationDrawer (click a run → see its violations)
- Add ReRunBar (simulated re-run action)

### 5. `src/pages/admin/platform-law/PLE05ManifestEnforcer.tsx` (→ PLT03)
- Add DomainCoverageChart (coverage bars by domain)
- Add CoverageTrendPanel (trend indicators)
- Add MissingManifestLane (features missing each manifest class)

### 6. `src/pages/admin/platform-law/PLE03ScaffoldRegistry.tsx` (→ PLT07)
- Add ArtifactMatrix (which generators produce which artifact types)
- Add DriftWarnings (templates out of date)
- Add adoption rate KPI

### 7. `src/pages/admin/platform-law/PLE06OwnershipBoard.tsx` (→ PLT09)
- Add OwnerScorecards (detailed per-owner compliance cards)
- Add NoOwnerWarningLane (areas with no assigned owner)
- Add EscalationGraph (visual escalation path)
- Add MTTR metric

### 8. `src/App.tsx`
- Add 4 lazy imports + 4 routes under `/admin/platform-law/violations`, `/admin/platform-law/feature-compliance`, `/admin/platform-law/launch-enforcement`, `/admin/platform-law/drift-radar`

### 9. `src/components/admin/AdminCommandPalette.tsx`
- Add 4 new navigation entries

### 10. `src/pages/admin/platform-law/PLE01Overview.tsx`
- Update subPages nav to include all 10 screens

## Technical Approach

- All data in-memory from registry — no DB tables
- Each new page 200-300 lines, fully advanced with KPI bands, tables, filters, detail drawers
- Existing pages enhanced in-place — no duplication
- All spec components mapped to real implementations (no stubs)
- Dark theme, premium styling matching existing ITC/JVC/PLE pages
- Mobile-responsive grids
- Cross-links between all pages and to ITC/JVC truth systems
- Every helper function fully implemented with real logic against seeded data

