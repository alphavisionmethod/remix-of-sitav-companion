
# SITA OS Part V — Shell/Admin/Mobile/Shared Systems Audit & Implementation Plan

## Current State Assessment

After thorough codebase inspection, the system is **~88% complete** against this checklist. The core architecture is extremely mature. Here's what exists vs what's missing:

### What's Already Implemented (Highlights)

**Section 1 — Admin/Mission Control:** MissionControlPage.tsx (1301 lines) with 22 tabs covering home, AI team, incidents, connectors, recovery, costs, trust, replay, releases, permissions, safe mode, activity feed, self-healing, audit log, compliance, BCP/DR, CAB, platform truth. Plus 200+ dedicated admin pages, MissionOverviewPage, IncidentDetailPage, ConnectorDetailPage, MissionReleaseDetailPage, PolicySimulatorPage, MissionWorkflowReplayPage.

**Section 2 — Mobile:** 9 pages — MobileHome, MobileApprovals, MobileApprovalDetail, MobileProof, MobileReceiptDetail, MobileAlerts, MobileBoardroom, MobileWorkflowDetail, MobileSettings. All with MobileShell wrapper.

**Section 3 — Shared UX:** EmptyState, EmptyStateCard, ContextualEmptyState, EmptyStateCTA components. DataLoadingWrapper for loading states. Shell grammar (114 lines), design tokens in tailwind config, trust-state colors, proof-state visuals.

**Section 4 — Traditional App Replacements:** CRM (LeadsInbox, OpportunitiesCenter, CustomersPage), Calendar (CalendarWorkspace), Tasks (WorkflowsCenter), Notes (NotesWorkspace), Files (FilesCenter + 8 sub-pages), Finance (13 money pages), Household (16 concierge pages), Docs (DocsWorkspace, SheetsWorkspace, SlidesWorkspace), PDF viewer/editor, Approvals (ApprovalChamber with SimulationPreview), Admin console, Notifications (NotificationCenter), Contacts (PeopleWorkspace), Templates (TemplateCenter), ImportExport (ImportExportCenter), Recovery (RecoveryCenter).

**Section 7 — OS Shell:** DesktopSurface (411 lines), EnhancedLockScreen (484 lines), UniversalCommandSurface (815 lines), ShellStatusBar, ShellAmbientBackground, TrustPostureChip, useShellState. CalmFocusMode page with standard/focus/calm modes.

**Section 8 — Global Navigation:** Shell layout with sidebar, top bar with command/search, trust indicators, notifications, approvals, receipts. Profile menu, mode switching.

**Section 9 — Global Search:** SearchPage (491 lines) with cross-domain live search, result grouping, preview pane, filters, result actions, trust-awareness.

---

### Gaps Found (~12% Missing)

#### Mobile Trust Device (Section 2) — 3 missing pages
1. **MobileDeviceTrust.tsx** — enrolled device state, trust health, revoke/re-enroll
2. **MobileEmergencyActions.tsx** — pause automations, emergency deny, device lost mode
3. **MobileQuickCapture.tsx** — file/image handoff to desktop, quick capture into workflows

#### Admin/Operator (Section 1) — 2 missing dedicated pages
4. **EnvironmentAppliancePage.tsx** — VM status, resource usage, backup status, appliance lifecycle (currently only in FleetHealthPage partially)
5. **AuditComplianceWorkspace.tsx** — standalone audit/compliance workspace with proof chain, mutation lineage, downloads (currently only as tab in MissionControl)

#### Shell Integration (Section 8-10) — 3 missing components/pages
6. **CommandHistory.tsx** — command history page/panel (commands exist but no history surface)
7. **IntentRibbon component** — subtle interpretation line showing "searching contacts," "preparing action preview" in command surface
8. **WhyThisResult component** — result reasoning indicator in search results

#### Settings/Environment (Section 27) — 2 missing pages
9. **EnvironmentSwitcherPage.tsx** — environment management, backup/restore center
10. **UpdateCenterPage.tsx** — update channel, available updates, update history

#### Shared UX Patterns (Section 3) — 2 missing components
11. **ReviewApprovePattern component** — reusable review/approve pattern with before/after comparison, proof preview, policy note (ApprovalChamber has this inline but it's not extracted as reusable)
12. **MultiStepCreationFlow component** — reusable multi-step creation shell (individual flows exist but no shared component)

---

## Implementation Plan

### Files to Create (12 files)

**Mobile pages:**
- `src/pages/mobile/MobileDeviceTrust.tsx` — device enrollment, trust health, revoke/re-enroll with biometric guard
- `src/pages/mobile/MobileEmergencyActions.tsx` — pause automations, emergency deny, device lost mode with confirmation dialogs
- `src/pages/mobile/MobileQuickCapture.tsx` — photo/file capture, quick note, handoff to desktop workflows

**Admin pages:**
- `src/pages/admin/EnvironmentAppliancePage.tsx` — VM/resource status, backup state, update channel, lifecycle events
- `src/pages/admin/AuditComplianceWorkspace.tsx` — full audit log viewer with proof chain, mutation lineage, filters, export

**Shell pages:**
- `src/pages/CommandHistory.tsx` — browsable command history with replay, filters
- `src/pages/EnvironmentSwitcher.tsx` — environment management, backup/restore
- `src/pages/UpdateCenter.tsx` — update channel, available updates, history

**Reusable components:**
- `src/components/sita/shell/IntentRibbon.tsx` — interpretation line for command surface
- `src/components/sita/shell/WhyThisResult.tsx` — result reasoning indicator
- `src/components/sita/ReviewApprovePattern.tsx` — reusable before/after + proof + approve/deny pattern
- `src/components/sita/MultiStepCreationFlow.tsx` — shared multi-step creation shell with progress, save/defer, premium feel

### Files to Edit (2 files)

- `src/App.tsx` — add routes for all new pages (~15 new route entries)
- `src/components/sita/shell/UniversalCommandSurface.tsx` — integrate IntentRibbon component

### Technical Details

- All new pages follow existing patterns: SitaPageHeader, SitaCard, DemoModeBadge, useDataMode, useAuth
- Mobile pages use MobileShell wrapper with touch-first design
- Admin pages use standard admin layout with premium card-based UI
- Reusable components export from existing barrel files
- All new routes are protected with ProtectedRoute
- Mobile routes go in Tier 2 (no shell), admin in Tier 4 (admin shell)
- IntentRibbon wires into UniversalCommandSurface's existing search state
- WhyThisResult uses existing search result metadata

### Risk
Low. All changes are additive. No existing files modified except App.tsx (route additions) and UniversalCommandSurface (IntentRibbon integration). All patterns well-established in codebase.
