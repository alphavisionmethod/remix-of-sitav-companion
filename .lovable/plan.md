

# SITA OS Part VI — Architecture-to-Frontend Integrity & Full Surface Inventory

## Audit Summary

After thorough codebase inspection, the system is **~90% complete** against this checklist. The canonical execution chain, shell surfaces, workspaces, admin/operator surfaces, and design system are mature. Here are the specific gaps:

---

## What Already Exists (Confirmed)

**Sections 1-5 (Architecture Truth Chains):**
- Canonical execution path: `canonical-execution-path.ts` (277 lines) — full 13-stage pipeline with sidecar, admin integration, commercial intelligence chains
- TenantConfig persistence: `enterprise-control-plane/index.ts` — durable with universal-service-persistence
- Route truth: `surface-class-registry.ts`, `route-to-service-inventory.ts`, route_truth_records DB table
- Admin API manifest: referenced in `admin-support-visibility-manifest.json` generation
- Proof-gate chain: fully traced through gateway → brain-core → capability-router → executor-service → receipt-service

**Sections 7-8 (Shell + Workspaces):**
- Setup (OSSetupExperience 998 lines), Lock (EnhancedLockScreen 484 lines), Desktop (DesktopSurface 411 lines), Command (UniversalCommandSurface 815 lines)
- All primary workspaces: Boardroom, CRM/Leads, Business, Finance, Concierge, Household, Calendar, Tasks/Workflows, Communications, Notes, Files (8 sub-pages), Docs/Sheets/Slides, Media, Document Editor, Reporting
- ActivityStream (494 lines) — full timeline/what-changed feed
- NotificationCenter, ProofCenter, TrustCenter, PolicyEditor, PolicySimulatorHub
- WorkflowReplayHub, MissionWorkflowReplayPage, MCReplayRollback

**Sections 9-10 (Trust/Governance + Communication):**
- ApprovalChamber with SimulationPreview, ReviewApprovePattern
- PeopleWorkspace, TeamWorkspace
- CommunicationInbox, CommunicationsPage

**Section 11 (Content Creation):**
- DocumentEditor (rich text), TemplateCenter, SheetsWorkspace, SlidesWorkspace, DocsWorkspace
- MediaWorkspace (gallery/upload/metadata)

**Section 12 (Upload/Import):**
- ImportExportCenter, FileUploader, MobileQuickCapture, SovereignExportPage

---

## Gaps Found (~10%)

### Missing Persistence/Contract Types (Section 1)
1. **ReleaseRecord contract** — `ReleaseSummaryView` exists for read but no durable `ReleaseRecord` entity with promotion history, rollback metadata, audit correlation
2. **Admin route truth manifest contract** — route truth DB table exists but no generated manifest contract type

### Missing Pages (Sections 7-13)
3. **PersonalLifeWorkspace** — no dedicated personal life workspace (LifeDashboard is cross-domain overview, not personal routines/goals/habits)
4. **DownloadsCenter** — no page tracking exports, generated bundles, proof packs
5. **StorageManager** — no file usage/retention/cleanup surface
6. **NetworkUtility** — no connectivity diagnostics surface
7. **PlanningCanvas** — no whiteboard/planning canvas surface (optional but called out)

### Missing Services (Section 1-2)
8. **ReleasePersistenceService** — no service wrapping release record durable operations
9. **AdminRouteTruthService** — no service that validates admin route truth against manifest

### Missing Contract Types (Section 3-4)
10. **VMware evidence chain types** — no `VmwareImportSmokeManifest` contract

---

## Implementation Plan

### New Contract Types (3 files)

**`src/packages/contracts/domain-types/release-record.ts`**
- `ReleaseRecord` with version, channel, ring, status, rollout/rollback metadata, audit correlation, evidence links, promotion history
- `ReleasePromotionEvent`, `ReleaseRollbackEvent`
- `ReleaseEvidenceChain` linking to proof artifacts

**`src/packages/contracts/domain-types/admin-route-truth.ts`**
- `AdminApiManifestEntry` — route key, method, service owner, handler path, version
- `AdminRouteTruthResult` — manifest comparison result (matched/drifted/missing)
- `RouteTruthValidation` — validation output with mismatches

**`src/packages/contracts/domain-types/vmware-evidence.ts`**
- `VmwareImportSmokeManifest`, `VmwareEvidenceGate`, `ApplianceLifecycleRecord`

### New Services (2 files)

**`src/lib/services/release-persistence-service.ts`**
- Wraps release record CRUD with universal-service-persistence
- Methods: `recordRelease`, `promoteRelease`, `rollbackRelease`, `getReleaseHistory`, `getEvidenceForRelease`

**`src/lib/services/admin-route-truth-service.ts`**
- Validates admin routes against manifest
- Methods: `validateRouteTruth`, `getRouteMismatches`, `getManifestStaleness`

### New Pages (5 files)

**`src/pages/PersonalLifeWorkspace.tsx`**
- Tabs: daily, weekly, goals, routines, habits, backlog, reflection
- Personal calendar integration, energy/focus mode, slipping items
- Links to LifeDashboard for cross-domain overview

**`src/pages/DownloadsCenter.tsx`**
- Tracks exports, reports, proof bundles, generated files, audit downloads
- Status tracking (pending/complete/expired), re-download, cleanup

**`src/pages/StorageManager.tsx`**
- File usage by domain, system usage, uploads breakdown
- Archive/cleanup suggestions, retention policies, quota visualization

**`src/pages/NetworkUtility.tsx`**
- Connectivity status, sync health per connector, VPN status if relevant
- Enterprise trust status, diagnostics, latency

**`src/pages/PlanningCanvas.tsx`**
- Lightweight canvas for workflow maps, life planning, strategy
- Drag cards, zones, color coding, link to workspaces

### Files to Edit

- **`src/packages/contracts/domain-types/index.ts`** — export new contract files
- **`src/App.tsx`** — add 5 new routes
- **`src/lib/services/enterprise-control-plane/index.ts`** — integrate ReleasePersistenceService reference

### Technical Details

- All pages follow existing patterns: SitaPageHeader, SitaCard, DemoModeBadge, useDataMode
- Contract types follow existing patterns in `domain-types/` with canonical naming
- Services use `loadServiceState`/`debouncedSaveServiceState` for persistence
- New routes are lazy-loaded and protected

### Total: 10 new files, 3 edited files

### Risk
Low — all additive. Core architecture untouched. Contract types and services wrap existing patterns.

