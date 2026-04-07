

# Fix Section 13: Contracts & Packages Audit

## Current State After Investigation

**Good news:**
- **0 broken re-exports** — every `export * from "./..."` resolves to a real file
- **0 TypeScript errors** — the entire contracts layer compiles cleanly
- **266 total imports** from `@/packages/` across hooks, lib, pages, and components
- All 73 barrel files (`index.ts`) resolve correctly

**Actual problems:**
1. **9 packages have zero imports** from any page/component/hook — they're fully orphaned contract types
2. **Several "facade" packages** (approval-contracts, auth-permissions) are thin re-exports of types already available from the canonical source — redundant indirection
3. The contracts layer is underutilized: 30 packages exist but only ~15 are imported by UI code

## Plan

### Group A: Wire 5 substantive zero-import packages into existing pages

These packages have real, useful types that should replace inline type definitions in pages:

| Package | Exports | Wire Into |
|---------|---------|-----------|
| `audit-contracts` (18 exports) | `AuditEntry`, `ComplianceReport`, `ForensicTimeline` | `admin/AuditTrailPage.tsx`, `admin/ComplianceDashboardPage.tsx` — replace inline audit types with contract imports |
| `boardroom-contracts` (16 exports) | `BoardroomSession`, `AdvisorCouncil`, `StrategicIntelligence` | `Boardroom.tsx`, `workspace/PrincipalWorkspace.tsx` — import session/council types |
| `reality-contracts` (38 exports across 37 files) | `RealityLane`, `EvidenceGrade`, `ConfidenceScore` | `ScenarioLabPage.tsx`, `ObservabilityPage.tsx` — import reality/evidence types |
| `enterprise-contracts` (20+ exports) | `TenantFirewallRule`, `ComplianceGate`, `SecurityIncident` | `admin/TenantFirewallPage.tsx`, `admin/ComplianceDashboardPage.tsx` |
| `design-tokens` | `COLORS`, `SPACING`, `springs` | Already re-exported via main barrel; add direct import in `src/components/sita/primitives/` components |

### Group B: Wire 2 utility packages

| Package | Wire Into |
|---------|-----------|
| `microinteraction-engine` | `src/components/sita/primitives/` — import `springs`, `fadeIn`, `scaleUp` presets for animation consistency |
| `moat-contracts` | `investment-office/WatchlistsSignals.tsx` or `admin/StrategyDashboard.tsx` — import competitive analysis types |

### Group C: Delete 2 redundant facade packages

These add zero value — they re-export types from packages that are already directly imported:

| Package | Why Delete |
|---------|-----------|
| `approval-contracts` | Re-exports from `@/packages/contracts/approval/` — consumers already import from `@/packages/contracts` directly (82 imports) |
| `auth-permissions` | Re-exports from `@/packages/auth/` — consumers already import `@/packages/auth` directly (4 imports) |

### Implementation Steps

1. **Delete** `src/packages/approval-contracts/` and `src/packages/auth-permissions/` (2 dirs)
2. **Remove** their entries from `src/packages/index.ts` (they're in the "colliding" comments section — just remove the comments)
3. **Wire audit-contracts** — import `AuditEntry`, `ComplianceReport` types into audit/compliance admin pages
4. **Wire boardroom-contracts** — import `BoardroomSession`, `BoardroomVote` into Boardroom page
5. **Wire reality-contracts** — import `RealityLane`, `ConfidenceScore` into ScenarioLab and Observability pages
6. **Wire enterprise-contracts** — import `TenantFirewallRule`, `ComplianceGate` into admin pages
7. **Wire design-tokens** — import `COLORS` or `springs` in 1-2 primitives components
8. **Wire microinteraction-engine** — import animation presets in primitives
9. **Wire moat-contracts** — import competitive types into investment/strategy pages
10. **Verify**: `npx tsc --noEmit` — 0 errors

## Files Changed
- 2 directories deleted (approval-contracts, auth-permissions)
- ~10 page/component files updated with new type imports
- 1 barrel file updated (src/packages/index.ts)
- Total: ~13 files

