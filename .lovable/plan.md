

# Platform Law — Missing Component Enhancement

## Gap Summary

All 10 pages exist and are routed. 4 pages (PLT05, PLT06, PLT08, PLT10) are fully spec-complete. 6 pages need enhancements:

| Page | Missing Components |
|---|---|
| PLE01 (PLT01) | DomainComplianceHeatmap, LaunchBlockerPanel, top offender domains, noncompliant features lane |
| PLE02 (PLT02) | VersionTimeline in detail drawer |
| PLE04 (PLT04) | FailureBreakdownChart, ViolationDrawer (click run → violations), ReRunBar |
| PLE05 (PLT03) | DomainCoverageChart, CoverageTrendPanel, MissingManifestLane |
| PLE03 (PLT07) | ArtifactMatrix, DriftWarnings, adoption rate KPI |
| PLE06 (PLT09) | OwnerScorecards, NoOwnerWarningLane, EscalationGraph, MTTR metric |

## Changes

### 1. `PLE01Overview.tsx` — Add 4 sections
- **DomainComplianceHeatmap**: Color-coded grid using `getDomainComplianceScores()` — 6 domains with score/violations/feature count
- **LaunchBlockerPanel**: Card listing blocked P0 features from `getLaunchBlockers()` with reasons
- **Top Offender Domains**: Strip showing domains sorted by violations desc
- **Noncompliant New Features**: Lane of features with compliance score < 50

### 2. `PLE02LawRegistry.tsx` — Add VersionTimeline
- In the detail drawer, add a simulated version history timeline (v1→v2→current) showing law evolution dates

### 3. `PLE04CIGateMonitor.tsx` — Add 3 components
- **FailureBreakdownChart**: Visual severity distribution bars (critical/high/medium/low) from `VALIDATION_VIOLATIONS`
- **ViolationDrawer**: Click a validation run → show its violations filtered by `validationRunId`
- **ReRunBar**: Simulated re-run action bar with button + last run timestamp

### 4. `PLE05ManifestEnforcer.tsx` — Add 3 sections to Coverage tab
- **DomainCoverageChart**: Coverage bars per domain (finance, business, concierge, platform, admin)
- **CoverageTrendPanel**: Trend arrows (up/down/stable) per manifest type
- **MissingManifestLane**: Features missing each manifest class (feature, interaction, journey, runtime, readiness)

### 5. `PLE03ScaffoldRegistry.tsx` — Add 3 components
- **ArtifactMatrix**: Grid showing which generators produce which artifact types (route, contract, manifest, test, probe, etc.)
- **DriftWarnings**: Generators with `complianceCoverage < 80%` flagged as drifted
- **Adoption Rate KPI**: Percentage of active generators vs total

### 6. `PLE06OwnershipBoard.tsx` — Add 4 components
- **OwnerScorecards**: Card-based view per unique owner with aggregated compliance, violations, areas, MTTR
- **NoOwnerWarningLane**: Using `getNoOwnerGaps()` to show unowned areas
- **EscalationGraph**: Visual escalation path (Primary → Secondary → Domain → Launch Blocker)
- **MTTR Metric**: Using `getOwnerMTTR()` to show mean time to resolution per owner

## Technical Details
- All data from existing registry helpers — no new types or seeds needed
- Each page gains 40-80 lines of additional JSX
- No new routes or wiring changes required

