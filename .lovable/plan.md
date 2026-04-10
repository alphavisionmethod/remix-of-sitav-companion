

# Platform Law Schema Enhancement — Full 14-Type Implementation

## Gap Analysis

The spec defines **14 canonical schema types (A–N)**. Currently implemented: **5 simplified types**. Here's the gap:

| Spec Type | Current State | Action |
|---|---|---|
| A. platformLawPack | ❌ Missing — laws exist but no versioned pack grouping | Create type + seed 4 packs |
| B. platformLawRule | ⚠️ Partial — `PlatformLaw` exists but missing `ruleType`, `scopeType`, `machineCheckable`, `remediationGuidance`, `active`, `createdAt` | Extend existing type |
| C. featureManifestRecord | ❌ Missing — only simplified `ManifestRequirement` exists | Create type + seed ~12 records |
| D. interactionManifestRecord | ❌ Missing entirely | Create type + seed ~15 records |
| E. journeyManifestRecord | ❌ Missing entirely | Create type + seed ~10 records |
| F. contractManifestRecord | ❌ Missing entirely | Create type + seed ~10 records |
| G. runtimeEvidenceManifestRecord | ❌ Missing entirely | Create type + seed ~8 records |
| H. readinessManifestRecord | ❌ Missing entirely | Create type + seed ~8 records |
| I. launchGateManifestRecord | ❌ Missing entirely | Create type + seed ~5 records |
| J. validationRunRecord | ❌ Missing entirely | Create type + seed ~6 records |
| K. validationViolationRecord | ❌ Missing entirely | Create type + seed ~10 records |
| L. complianceOwnershipRecord | ⚠️ Partial — `OwnershipEntry` exists but missing `secondaryOwner`, `team`, `escalationPath` | Extend existing type |
| M. generatorTemplateRecord | ⚠️ Partial — `ScaffoldEntry` exists but missing `includesManifests`, `includesContracts`, etc. boolean flags | Extend existing type |
| N. driftEnforcementRecord | ❌ Missing entirely | Create type + seed ~8 records |

**Current:** 5 types, ~518 lines
**Target:** 14 types, all with full field coverage + seeded data + helper functions

## Files to Edit

### 1. `src/lib/platform-law/platform-law-registry.ts`
- Add 9 new types: `PlatformLawPack`, `FeatureManifestRecord`, `InteractionManifestRecord`, `JourneyManifestRecord`, `ContractManifestRecord`, `RuntimeEvidenceManifestRecord`, `ReadinessManifestRecord`, `LaunchGateManifestRecord`, `ValidationRunRecord`, `ValidationViolationRecord`, `DriftEnforcementRecord`
- Extend 3 existing types: `PlatformLaw` → add `ruleType`, `scopeType`, `machineCheckable`, `remediationGuidance`, `active`, `createdAt`; `OwnershipEntry` → add `secondaryOwner`, `team`, `escalationPath`; `ScaffoldEntry` → add boolean flags for includes*
- Seed data arrays for each new type
- Add helper/aggregation functions for each new type

### 2. `src/pages/admin/platform-law/PLE02LawRegistry.tsx`
- Show law pack grouping, filter by pack, show `ruleType` and `scopeType` columns
- Display `machineCheckable` indicator and `remediationGuidance` in detail drawer

### 3. `src/pages/admin/platform-law/PLE03ScaffoldRegistry.tsx`
- Show new boolean flags (includesManifests, includesContracts, includesTests, etc.) as checklist badges in detail drawer

### 4. `src/pages/admin/platform-law/PLE05ManifestEnforcer.tsx`
- Add tabs/sections for Feature, Interaction, Journey, Contract, RuntimeEvidence, Readiness, LaunchGate manifests
- Show rich detail drawers with all ref arrays

### 5. `src/pages/admin/platform-law/PLE06OwnershipBoard.tsx`
- Show `team`, `secondaryOwner`, `escalationPath` in detail view

### 6. `src/pages/admin/platform-law/PLE07ComplianceDashboard.tsx`
- Wire validation runs and violations into the layer detail
- Show drift enforcement records in a drift section
- Show recent validation runs with blocker/warning counts

### 7. `src/pages/admin/platform-law/PLE01Overview.tsx`
- Add law pack summary strip
- Add recent validation runs panel
- Add drift alert count to KPI band

### 8. `src/pages/admin/platform-law/PLE04CIGateMonitor.tsx`
- Wire validation run records to show actual run history per gate

## Technical Approach

- All data remains in-memory (no DB tables) — consistent with existing pattern
- Each new type gets its own exported const array + 2-3 helper functions
- Existing pages enhanced with tabs/sections, not replaced
- All new fields match the spec exactly (every field from A–N is present)
- Seeded data reflects realistic SITA OS domains (money-office, admin, engineering, etc.)
- No duplicate pages or routes created — only enriching existing ones

