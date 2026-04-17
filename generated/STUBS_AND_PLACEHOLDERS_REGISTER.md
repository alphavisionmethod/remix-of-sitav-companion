# Stub & Placeholder Register

**Generated**: 2026-04-17T22:15:51.049Z
**Scanner**: `scripts/architecture/audits/audit-stubs-placeholders.ts`
**Source files scanned**: 4690
**Total raw hits**: 85
**Intentional (excluded)**: 9
**Actionable hits**: **76**

> This document is **truth-only**. It enumerates every stub, placeholder, mock, or unwired CTA detected in the live codebase. Use it as the input register for the eradication sweep. Resolved entries are removed from this file (never logged here).

---

## Summary by Priority

| Priority | Count | Description |
|---|---:|---|
| **P0** Trust-bearing (Boardroom, Money, Approvals, Auth) | 5 | Must be 100% wired before deploy |
| **P1** Flagship Loop pages | 0 | High-traffic, cross-domain |
| **P2** Domain pages (non-admin) | 12 | User-facing surfaces |
| **P3** Admin pages + components | 30 | Operator surfaces |
| **P4** Lib/hooks/utilities | 29 | Background plumbing |

## Summary by Category

| Category | Count |
|---|---:|
| Inline mock data | 70 |
| Empty handler | 3 |
| Coming-soon toast | 3 |

---

## P0 — Trust-bearing surfaces

| File | Line | Category | Snippet |
|---|---:|---|---|
| `src/components/sita/apps/boardroom/BoardroomApprovalView.tsx` | 28 | Inline mock data | `const MOCK_APPROVALS = [` |
| `src/components/sita/apps/boardroom/BoardroomApprovalView.tsx` | 34 | Inline mock data | `const MOCK_SEALED = [` |
| `src/components/sita/apps/boardroom/BoardroomApprovalView.tsx` | 39 | Inline mock data | `const MOCK_RECEIPTS = [` |
| `src/components/sita/apps/boardroom/BoardroomDiscussionThread.tsx` | 25 | Inline mock data | `const MOCK_DISCUSSIONS: Record<string, DiscussionEntry[]> = {` |
| `src/components/sita/apps/boardroom/BoardroomExecutiveView.tsx` | 120 | Inline mock data | `const mockChain = buildDefaultChain("simulation");` |

## P1 — Flagship Loop pages

_(none)_

## P2 — Domain pages

| File | Line | Category | Snippet |
|---|---:|---|---|
| `src/pages/CommandHistory.tsx` | 22 | Inline mock data | `const MOCK_HISTORY: CommandRecord[] = [` |
| `src/pages/DownloadsCenter.tsx` | 12 | Inline mock data | `const mockDownloads = [` |
| `src/pages/EnvironmentSwitcher.tsx` | 23 | Inline mock data | `const MOCK_ENVIRONMENTS: Environment[] = [` |
| `src/pages/PersonalLifeWorkspace.tsx` | 28 | Inline mock data | `const mockRoutines = [` |
| `src/pages/PersonalLifeWorkspace.tsx` | 36 | Inline mock data | `const mockGoals = [` |
| `src/pages/PersonalLifeWorkspace.tsx` | 43 | Inline mock data | `const mockSlipping = [` |
| `src/pages/PersonalLifeWorkspace.tsx` | 50 | Inline mock data | `const mockBacklog = [` |
| `src/pages/PlanningCanvas.tsx` | 22 | Inline mock data | `const mockCards: CanvasCard[] = [` |
| `src/pages/WeeklyBoardroom.tsx` | 6 | Inline mock data | `const MOCK_WEEK = {` |
| `src/pages/mobile/MobileDeviceTrust.tsx` | 27 | Inline mock data | `const MOCK_DEVICES: DeviceInfo[] = [` |
| `src/pages/settings/DeviceSettings.tsx` | 6 | Inline mock data | `const MOCK_DEVICE = {` |
| `src/pages/settings/TrustedDeviceManager.tsx` | 6 | Inline mock data | `const MOCK_DEVICES = [` |

## P3 — Admin pages & components

| File | Line | Category | Snippet |
|---|---:|---|---|
| `src/components/business/adaptive/ProfileEvolutionTimeline.tsx` | 29 | Inline mock data | `const MOCK_TIMELINE = [` |
| `src/components/business/advisor-board/WeeklyExecutiveReport.tsx` | 36 | Inline mock data | `const MOCK_REPORT: WeeklyReport = {` |
| `src/components/business/crm/CRMContactDetail.tsx` | 489 | Empty handler | `<Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => {}}>` |
| `src/components/business/crm/CRMContactDetail.tsx` | 492 | Empty handler | `<Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => {}}>` |
| `src/components/sita/AISpendIndicator.tsx` | 13 | Inline mock data | `const MOCK_SPEND = {` |
| `src/components/sita/AgentAuditLog.tsx` | 49 | Inline mock data | `const MOCK_AUDIT: AuditEntry[] = [` |
| `src/components/sita/BCPDRDashboard.tsx` | 82 | Inline mock data | `const MOCK_OBJECTIVES: RecoveryObjective[] = [` |
| `src/components/sita/BCPDRDashboard.tsx` | 95 | Inline mock data | `const MOCK_FAILOVER: FailoverProcedure[] = [` |
| `src/components/sita/BCPDRDashboard.tsx` | 155 | Inline mock data | `const MOCK_DR_TESTS: DRTest[] = [` |
| `src/components/sita/BCPDRDashboard.tsx` | 190 | Inline mock data | `const MOCK_METRICS: BCPMetrics = {` |
| `src/components/sita/CABWorkflow.tsx` | 74 | Inline mock data | `const MOCK_CHANGES: ChangeRequest[] = [` |
| `src/components/sita/ComplianceDashboard.tsx` | 54 | Inline mock data | `const MOCK_CONTROLS: ComplianceControl[] = [` |
| `src/components/sita/ComplianceDashboard.tsx` | 71 | Inline mock data | `const MOCK_SLAS: SLAMetric[] = [` |
| `src/components/sita/ComplianceDashboard.tsx` | 82 | Inline mock data | `const MOCK_RISKS: RiskItem[] = [` |
| `src/components/sita/PredictiveAnalysisDashboard.tsx` | 63 | Inline mock data | `const MOCK_PREDICTIONS: PredictionSignal[] = [` |
| `src/components/sita/PredictiveAnalysisDashboard.tsx` | 120 | Inline mock data | `const MOCK_ANOMALIES: AnomalyEvent[] = [` |
| `src/components/sita/UniversalTimeline.tsx` | 16 | Inline mock data | `const MOCK_TIMELINE: TimelineEntry[] = [` |
| `src/components/sita/onboarding/AccountEnvironmentStep.tsx` | 23 | Inline mock data | `const MOCK_RESTORE = {` |
| `src/components/sita/onboarding/NetworkSetupStep.tsx` | 22 | Inline mock data | `const MOCK_NETWORKS: Network[] = [` |
| `src/components/sita/shell/FilePickerService.tsx` | 245 | Empty handler | `onClick={() => {}}` |
| `src/components/sita/shell/SurfaceContextMenu.tsx` | 75 | Coming-soon toast | `onNewFolder: () => toast.message("New Folder", { description: "Coming soon." }),` |
| `src/components/sita/shell/SurfaceContextMenu.tsx` | 76 | Coming-soon toast | `onNewFile: (k) => toast.message(`New ${k}`, { description: "Coming soon." }),` |
| `src/components/sita/shell/SurfaceContextMenu.tsx` | 167 | Coming-soon toast | `(() => toast.message("Widget settings", { description: "Coming soon." })),` |
| `src/components/sita/shell/windows/CodeEditorWindow.tsx` | 21 | Inline mock data | `const MOCK_FILES: FileNode[] = [` |
| `src/components/sita/shell/windows/MailClientWindow.tsx` | 29 | Inline mock data | `const MOCK_EMAILS: Email[] = [` |
| `src/components/sita/shell/windows/MusicPlayerWindow.tsx` | 23 | Inline mock data | `const MOCK_TRACKS: Track[] = [` |
| `src/components/sita/shell/windows/PhotoViewerWindow.tsx` | 23 | Inline mock data | `const MOCK_PHOTOS: Photo[] = [` |
| `src/pages/admin/AuditComplianceWorkspace.tsx` | 30 | Inline mock data | `const MOCK_AUDIT_RECORDS: AuditRecord[] = [` |
| `src/pages/admin/reality-audit/RCP03FeatureDetail.tsx` | 43 | Inline mock data | `const mockReplacements = useMemo(() => featureId ? getMockReplacementsForFeature(featureId` |
| `src/pages/admin/reality-audit/RCP07RouteHeatmap.tsx` | 56 | Inline mock data | `const mockCount = routes.filter(r => r.hasMock).length;` |

## P4 — Lib / hooks / utilities

| File | Line | Category | Snippet |
|---|---:|---|---|
| `src/hooks/use-boardroom-data.ts` | 44 | Inline mock data | `const mockNotifications = [` |
| `src/hooks/use-boardroom-data.ts` | 50 | Inline mock data | `const mockRecommendations = [` |
| `src/hooks/use-boardroom-data.ts` | 56 | Inline mock data | `const mockPendingApprovals = [` |
| `src/hooks/use-boardroom-data.ts` | 62 | Inline mock data | `const mockBoardroomItems = [` |
| `src/hooks/use-boardroom-data.ts` | 66 | Inline mock data | `const mockDecisionReceipts = [` |
| `src/hooks/use-boardroom-data.ts` | 70 | Inline mock data | `const mockActiveGoals = [` |
| `src/hooks/use-boardroom-data.ts` | 76 | Inline mock data | `const mockOverdueTasks = [` |
| `src/hooks/use-sita-data.ts` | 95 | Inline mock data | `const mockReserves = [` |
| `src/hooks/use-sita-data.ts` | 114 | Inline mock data | `const mockDeals = [` |
| `src/hooks/use-sita-data.ts` | 123 | Inline mock data | `const mockDocs = [` |
| `src/hooks/use-sita-data.ts` | 260 | Inline mock data | `const mockGoals = [` |
| `src/hooks/use-sita-data.ts` | 270 | Inline mock data | `const mockWorkflows = [` |
| `src/hooks/use-sita-data.ts` | 280 | Inline mock data | `const mockPolicies = [` |
| `src/hooks/use-sita-data.ts` | 352 | Inline mock data | `const mockApprovals = [` |
| `src/hooks/use-sita-data.ts` | 413 | Inline mock data | `const mockProof = [` |
| `src/hooks/use-sita-data.ts` | 441 | Inline mock data | `const mockReceipts = [` |
| `src/hooks/use-sita-data.ts` | 451 | Inline mock data | `const mockEnvelopes = [` |
| `src/hooks/use-sita-data.ts` | 460 | Inline mock data | `const mockTrust = [` |
| `src/hooks/use-sita-data.ts` | 470 | Inline mock data | `const mockBudgets = [` |
| `src/hooks/use-sita-data.ts` | 480 | Inline mock data | `const mockDecisions = [` |
| `src/lib/detection/reality-detection-engine.ts` | 300 | Inline mock data | `const mockImports = detectMockImports();` |
| `src/lib/integrations/reality-integration-hub.ts` | 33 | Inline mock data | `const mockPages = new Set((mockReplacements ?? []).map((m: any) => m.page_path));` |
| `src/lib/os-services/automationd.ts` | 109 | Inline mock data | `const MOCK_HISTORY: RuleExecution[] = [` |
| `src/lib/os-services/btd.ts` | 60 | Inline mock data | `const MOCK_DEVICES: BTDevice[] = [` |
| `src/lib/os-services/crashd.ts` | 31 | Inline mock data | `const MOCK_CRASHES: CrashDump[] = [` |
| `src/lib/os-services/powerd.ts` | 83 | Inline mock data | `const MOCK_APP_DRAIN: AppDrainEntry[] = [` |
| `src/lib/os-services/wifid.ts` | 100 | Inline mock data | `const MOCK_NETWORKS: WifiNetwork[] = [` |
| `src/lib/reality-audit/reality-audit-registry.ts` | 491 | Inline mock data | `const mockProgress = getMockReplacementProgress();` |
| `src/lib/reality-audit/reality-audit-registry.ts` | 495 | Inline mock data | `const mockSourceStats = getMockSourceStats();` |

---

## Intentional fallbacks (excluded, for reference)

These hits are **registered, design-system fallbacks** (status grammar, empty-state primitives, OS app placeholders). They MUST NOT be removed.

| File | Line | Category |
|---|---:|---|
| `src/components/sita/__tests__/DemoModeBadge.test.tsx` | 6 | Inline mock data |
| `src/components/sita/shell/windows/CalculatorWindow.tsx` | 184 | Empty handler |
| `src/components/sita/shell/windows/CalculatorWindow.tsx` | 191 | Empty handler |
| `src/components/sita/shell/windows/CalculatorWindow.tsx` | 194 | Empty handler |
| `src/components/sita/shell/windows/__tests__/IntentSuggestionsWidget.test.tsx` | 7 | Inline mock data |
| `src/lib/services/google-provider-family/__tests__/google-provider-family.test.ts` | 101 | Inline mock data |
| `src/test/advisor-council-protocol.test.ts` | 225 | Inline mock data |
| `src/test/lock-screen.test.tsx` | 15 | Inline mock data |
| `src/test/search-fabric.test.ts` | 5 | Inline mock data |

---

## Remediation rules (binding)

1. Every fix routes through `Executor` (HARD RULE — single execution chain).
2. Every state-mutating handler emits a receipt via the appropriate ledger:
   - Trust-bearing → `boardroom_decision_receipts`
   - AI inference → `ai_inference_receipts`
   - Admin actions → `admin_action_audit`
3. No new `as any` (zero tolerance per ISS-020).
4. No new `console.log` in production paths.
5. All AI usage through `invokeAICapability` — never raw provider SDKs.
6. Inline mock data in components/hooks must be replaced by typed hooks calling Supabase tables with RLS.
7. Re-run this audit after each batch; counts must monotonically decrease.
8. Update `generated/FULL_ISSUES_AND_FIXES.md` only after `tsc --noEmit` is green and Phase 32 stays 13/13.

---

_End of register._
