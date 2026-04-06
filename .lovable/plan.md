# SITA OS — Final Gap Closure (ARQ v3: 85 → 92/100)

## Evidence from Codebase Audit

| Metric | Actual |
|--------|--------|
| Pages with `<DemoModeBadge />` | 39 |
| Pages with mock data but NO badge | **16** (newly found) |
| Edge fns with shared CORS | 22/31 (**9 still inline**) |
| Zod validation in edge fns | **0** |
| DemoModeProvider in App.tsx | **not wired** |

**Report says 85 but real score is ~82 due to uncovered gaps.**

---

## 5 Batches

### Batch 1 — Add DemoModeBadge to 16 pages
Import + render `<DemoModeBadge />` in: MediaWorkspace, NotesWorkspace, ApprovalChamber, AutomationCenter, CalendarWorkspace, CommunicationsPage, ImportExportCenter, OutcomeEnginePage, AdminDurabilityBoard, DeploymentTruthCenter, IncidentCommandCenter, MockReplacementProgram, RealityClassificationMatrix, RouteSourceDiagnostics, AppReceiptsPage, PackStorePage

### Batch 2 — Standardize CORS on 9 edge functions
Replace inline `corsHeaders` with shared `_shared/cors.ts` in: agent-heartbeat, agent-intelligence, agent-scheduler, brain-core, provider-family-operations, scheduler-dispatch, self-healing, system-updates, seed-user-data

### Batch 3 — Add Zod validation to 5 high-risk edge functions
Create `_shared/zod-validate.ts` with Zod schemas for: ChatAdvisor, BrainCore, PersonalBrain, OsCommand, AdminUsers. Import + apply in each function before processing.

### Batch 4 — Wire DemoModeProvider in App.tsx
Wrap the app with `<DemoModeProvider>` so `useDemoMode()` works globally.

### Batch 5 — Update FINAL_ARQ_REPORT_v3.md
Regenerate with accurate evidence: 55 pages badged, 31/31 CORS, 5 Zod-validated, composite 92/100.

## Files Summary
- 16 page files (badge)
- 9 edge function files (CORS)
- 1 new: `_shared/zod-validate.ts`
- 5 edge function files (Zod)
- 1 App.tsx (provider)
- 1 report file