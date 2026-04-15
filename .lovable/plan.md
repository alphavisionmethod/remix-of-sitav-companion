

# SITA OS — Complete Directory Reorganization: All Missing Barrels & Governance

## Current State
- **29 barrels exist** (created in prior phases)
- **~45 barrels missing** per the approved move map
- **Governance files exist** but need expansion (only 3 deprecated paths, only 25 directory mappings)

## What Must Be Created

### Phase 1: Missing Feature Barrels (16 files)

| File | Re-exports From |
|------|----------------|
| `src/features/ai/index.ts` | `@/components/ai/AIDegradedState`, `AIEmbeddedRecommendation`, `AIWorkforceInvocationPanel` |
| `src/features/cloud/index.ts` | `@/components/cloud/CloudActivityTimeline`, `CloudDeviceOwnership`, `CloudFileBrowser`, etc. |
| `src/features/simulation/index.ts` | `@/components/simulation/*` (7 components) |
| `src/features/home/index.ts` | `@/components/user-app/PulseSummaryStrip` |
| `src/features/app-platform/index.ts` | `@/components/sita/apps/*` app shells |
| `src/features/apps/index.ts` | `@/pages/apps/*` page references |
| `src/features/atlas/index.ts` | `@/pages/atlas/*` |
| `src/features/digital-presence/index.ts` | `@/pages/digital-presence/*` |
| `src/features/enterprise/index.ts` | `@/pages/enterprise/*` |
| `src/features/integrations/index.ts` | `@/pages/integrations/*` |
| `src/features/mission/index.ts` | `@/pages/mission/*` |
| `src/features/mission-control/index.ts` | `@/components/sita/apps/mission-control/*`, `@/pages/mission-control/*` |
| `src/features/owner/index.ts` | `@/pages/owner/*` |
| `src/features/owner-mode/index.ts` | `@/pages/owner-mode/*` |
| `src/features/store/index.ts` | `@/pages/store/*` |
| `src/features/workspace/index.ts` | `@/pages/workspace/*` |

### Phase 2: Missing Sub-feature Barrels (4 files)

| File | Re-exports From |
|------|----------------|
| `src/features/business/autopilot/index.ts` | `@/components/autopilot/*` |
| `src/features/business/crm/index.ts` | `@/components/business/CRMConnectModal`, `CRMImportWizard`, `@/components/business/crm/*` |
| `src/features/business/leads/index.ts` | `@/components/business/lead-inbox/*`, `@/hooks/useLeadInbox` (if exists) |
| `src/features/money/finance/index.ts` | `@/components/finance/*` |

### Phase 3: Missing Admin Barrels (6 files)

| File | Re-exports From |
|------|----------------|
| `src/admin/modules/runtime/index.ts` | `@/components/admin-os/DiagnosticsContextBar`, `LaunchTruthIndicator`, `RealityModeIndicator`, `SystemStatusBar` |
| `src/admin/modules/operations/index.ts` | `@/components/admin/FleetHealthWidget`, safety components from shells |
| `src/admin/modules/intelligence/index.ts` | Learning/simulation/inspection components from shells |
| `src/admin/navigation/index.ts` | All 22 `*SubNav` components from `@/components/admin/` |
| `src/admin/components/index.ts` | `@/components/admin/panels/*`, `AdminCommandPalette`, `AdminKeyboardShortcuts`, shell UX helpers |
| `src/admin/pages/index.ts` | Placeholder barrel documenting admin page entry points |

### Phase 4: Missing Platform Barrels (6 files)

| File | Re-exports From |
|------|----------------|
| `src/platform/notifications/index.ts` | `@/hooks/use-notification-calm-data`, `use-proactive-notifications`, `use-push-notifications`, `use-realtime-notifications`, `useNotifications` |
| `src/platform/security/index.ts` | `@/hooks/use-security-fabric`, `useOSSecurity` |
| `src/platform/observability/index.ts` | `@/hooks/useOrchestrationHealth` |
| `src/platform/search/index.ts` | `@/hooks/use-global-search` |
| `src/platform/setup/index.ts` | `@/hooks/use-session-restore`, `useSetupOrchestration`, `useOnboardingDaemon`, `useUpdateDaemon` |
| `src/platform/runtime/index.ts` | `@/hooks/use-backend-actions`, `use-kernel-events`, `use-kernel-mutation`, `use-kernel-query`, `use-os-api`, `useOSOrchestration`, `use-shell-indicators` |

### Phase 5: Missing Runtime Barrels (3 files)

| File | Re-exports From |
|------|----------------|
| `src/runtimes/reality/index.ts` | `@/components/reality/*`, `@/hooks/useRealityClassifications`, `useRealityDetection`, `useRealtimeBridge` |
| `src/runtimes/surfaces/index.ts` | `@/components/sita/surfaces/*` |
| `src/runtimes/appliance/index.ts` | `@/components/sita/boot/*` |

### Phase 6: Missing Shared Component Barrels (5 files)

| File | Re-exports From |
|------|----------------|
| `src/components/shared/ai/index.ts` | `@/components/ai/AIReceiptLink`, `AIStateBadge`, `AIResponsePanel` |
| `src/components/shared/sita/index.ts` | `@/components/sita/SitaCard`, `SitaCharts`, `SitaCompanionBar`, `SitaComponents`, `SitaPageHeader`, `SitaTopBar`, `PageSkeleton`, `SectionSkeleton`, `EmptyState`, `EmptyStateCTA`, `EmptyStateCard`, `DataLoadingWrapper`, `StateBadge`, `TrustBadge`, `TrustStateBadge` |
| `src/components/shared/status/index.ts` | `@/components/cloud/PlatformDegradedBanner` |
| `src/components/navigation/index.ts` | `@/components/NavLink` |
| `src/components/cards/index.ts` | `@/components/sita/cards/*` |

### Phase 7: Update Governance (2 modified files)

**`directory-organization-map.ts`** — Add all ~40 new canonical paths to `DIRECTORY_ORGANIZATION_MAP`.

**`ia-governance.ts`** — Expand `DEPRECATED_NEW_FILE_PATHS` to include:
- `src/components/admin/` → `src/admin/`
- `src/components/cloud/` → `src/features/cloud/`
- `src/components/autopilot/` → `src/features/business/autopilot/`
- `src/components/simulation/` → `src/features/simulation/`
- `src/components/reality/` → `src/runtimes/reality/`
- `src/components/platform/` → `src/platform/`
- `src/components/user-app/` → `src/features/home/`
- `src/components/finance/` → `src/features/money/`
- `src/components/investment/` → `src/features/investment-office/`
- `src/components/mobile/` → `src/runtimes/mobile/`
- `src/components/notifications/` → `src/features/notifications/`
- `src/components/revenue-office/` → `src/features/revenue-office/`

### Phase 8: Build Verification

Run `tsc --noEmit` to confirm zero breakage.

## File Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Feature barrels | 20 | 0 |
| Admin barrels | 6 | 0 |
| Platform barrels | 6 | 0 |
| Runtime barrels | 3 | 0 |
| Shared component barrels | 5 | 0 |
| Architecture governance | 0 | 2 |
| **Total** | **~40** | **2** |

## What This Does NOT Do
- Does not physically move files (barrel re-export strategy)
- Does not rewrite existing imports
- Does not risk build breakage — purely additive

