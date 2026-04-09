

# Fix All P1 Items — Rename mock Arrays, Gate Behind isDemoMode, Verify Wiring

## Status Summary

| P1 Item | Current State | Action Needed |
|---------|--------------|---------------|
| Wire 88 pages to isDemoMode | **Only 6 pages remain unwired** — all are auth/landing pages that correctly don't need it | **None** |
| Prefix 151 hardcoded arrays with DEMO_ | **35 `mock*` arrays across 17 files + 7 non-prefixed data arrays across 3 files = 42 total** | **Rename all 42** |
| Wire 24 orphaned tables | **All 24 confirmed wired** in data services | **None** |
| Wire ConstitutionEditor form | **Already fully wired** — loads from DB, persists create/toggle/delete via `constitution_rules` table | **None** |

## What Actually Needs Fixing

**42 hardcoded data arrays** across **19 files** need renaming from `mock*`/generic names to `DEMO_*` to match the codebase convention. All 19 files already have `isDemoMode` wired — the arrays just need the naming convention applied.

### Files and Renames

**17 files with `mock*` prefix (35 arrays):**

1. `src/pages/admin/ComputeGovernanceBoard.tsx` — 6 arrays: `mockTenantSpend`, `mockAgentSpend`, `mockAnomalies`, `mockBudgets`, `mockRoutingEvents`, `mockDeepJobs`
2. `src/pages/admin/IntelligenceEfficiencyBoard.tsx` — 6 arrays: `mockAssets`, `mockDifferentials`, `mockEfficiency`, `mockOutcomes`, `mockPackets`, `mockCrossTenantPatterns`
3. `src/pages/admin/intelligence/AIEfficiencyScoreboard.tsx` — 3: `mockAgents`, `mockWorkflows`, `mockPaths`
4. `src/pages/admin/intelligence/CrossTenantGovernance.tsx` — 1: `mockPatterns`
5. `src/pages/admin/intelligence/DifferentialReasoningExplorer.tsx` — 1: `mockDiffs`
6. `src/pages/admin/intelligence/EscalationControlCenter.tsx` — 1: `mockEscalations`
7. `src/pages/admin/intelligence/IntelligenceAssetLibrary.tsx` — 1: `mockAssets`
8. `src/pages/admin/intelligence/IntelligencePacketInspector.tsx` — 1: `mockPackets`
9. `src/pages/admin/intelligence/IntelligenceReuseOverview.tsx` — 5: `mockReuseData`, `mockAssetClasses`, `mockDomainReuse`, `mockInvalidationFeed`, `mockConfidenceTrend`
10. `src/pages/admin/intelligence/OutcomeEconomicsBoard.tsx` — 2: `mockOutcomes`, `mockReasoningPaths`
11. `src/pages/admin/intelligence/PatternLearningCenter.tsx` — 1: `mockPatterns`
12. `src/pages/admin/intelligence/SmartDigestCenter.tsx` — 1: `mockDigests`
13. `src/pages/admin/intelligence/ZeroWastePromptView.tsx` — 1: `mockProfiles`
14. `src/pages/apps/EmailApp.tsx` — 1: `mockEmails`
15. `src/pages/apps/GalleryApp.tsx` — 1: `mockPhotos`
16. `src/pages/apps/MessengerApp.tsx` — 2: `mockChats`, `mockMessages`
17. `src/pages/apps/VaultApp.tsx` — 1: `mockEntries`

**3 files with generic names (7 arrays):**

18. `src/pages/CustomerDetail.tsx` — 4: `customersData`, `timeline`, `actions`, `documents`
19. `src/pages/ProductivityHub.tsx` — 1: `recentDocs`
20. `src/pages/admin/intelligence/CrossTenantGovernance.tsx` — 2: `restrictedDomains`, `enterpriseExclusions`

### Implementation

For each file:
1. Rename `mock*` → `DEMO_*` (e.g., `mockTenantSpend` → `DEMO_TENANT_SPEND`)
2. Rename generic names → `DEMO_*` (e.g., `timeline` → `DEMO_TIMELINE`)
3. Update all references within the same file
4. No logic changes — these files already have `isDemoMode` wired

### Verification

- Run `grep -rn "^const mock" src/pages` — expect 0 matches (excluding tests)
- Run `npx tsc --noEmit` — expect 0 errors
- All 4 P1 items confirmed resolved

## Technical Details

- **Pattern**: Simple find-and-replace within each file; no cross-file dependencies since these are module-scoped constants
- **Risk**: Zero — purely cosmetic rename, no logic changes
- **Files changed**: 19 files (1 file appears in both lists: CrossTenantGovernance)

