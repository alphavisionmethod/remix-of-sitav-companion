# SITA OS — Final Gap Closure Plan (ARQ v3: 85 → 92/100)

## Current Evidence-Based State

| Metric | Actual Count |
|--------|-------------|
| DemoModeBadge rendered in JSX | 39 pages |
| Pages with mock data but **NO badge** | **16 pages** (newly discovered) |
| Edge functions with shared CORS | 22/31 |
| Edge functions **without** shared CORS | **9** (agent-heartbeat, agent-intelligence, agent-scheduler, brain-core, provider-family-operations, scheduler-dispatch, seed-user-data, self-healing, system-updates) |
| Rate limiting active | 8 functions |
| EdgeLogger active | 8 functions |
| Zod validation | **0 functions** |
| Ecosystem admin pages wired to CAI hooks | **0/27** |
| CI pipeline | Present |
| E2E tests | 7 specs |

**Report claims 85/100 but 16 pages still lack DemoModeBadge and brain-core still uses inline CORS. Real score: ~82.**

---

## Remaining Gaps (6 items)

### GAP 1 — 16 pages with mock data but no DemoModeBadge
MediaWorkspace, NotesWorkspace, ApprovalChamber, AutomationCenter, CalendarWorkspace, CommunicationsPage, ImportExportCenter, OutcomeEnginePage, AdminDurabilityBoard, DeploymentTruthCenter, IncidentCommandCenter, MockReplacementProgram, RealityClassificationMatrix, RouteSourceDiagnostics, AppReceiptsPage, PackStorePage

### GAP 2 — 9 edge functions without shared CORS
agent-heartbeat, agent-intelligence, agent-scheduler, brain-core, provider-family-operations, scheduler-dispatch, seed-user-data, self-healing, system-updates

### GAP 3 — Zero Zod validation anywhere
No edge function uses Zod schemas. Add to 5 highest-risk: chat-advisor, brain-core, personal-brain, os-command, admin-users

### GAP 4 — 27 ecosystem admin pages not wired to CAI hooks
APL (6), AND (5), HRS (6), NRC (6), NSS (4) — all show empty tables with no CRUD

### GAP 5 — DemoModeProvider not wired in App.tsx
Only 4 files reference it. Needs to wrap the app so `useDemoMode()` works everywhere.

### GAP 6 — Report outdated
Needs to reflect all fixes with accurate evidence counts.

---

## Implementation Plan — 5 Batches

### Batch 1 — Add DemoModeBadge to 16 remaining pages
Import and render `<DemoModeBadge />` in each of the 16 identified pages. These all use inline MOCK_ arrays or import from mock-data files.

**16 files modified**

### Batch 2 — Standardize CORS on 9 remaining edge functions
Replace inline `corsHeaders` with `import { handleCors, corsHeaders } from "../_shared/cors.ts"` in: agent-heartbeat, agent-intelligence, agent-scheduler, brain-core, provider-family-operations, scheduler-dispatch, seed-user-data (already uses SDK cors — standardize), self-healing, system-updates

**9 files modified**

### Batch 3 — Add Zod validation to 5 high-risk edge functions
Install Zod via esm.sh import and add request body schemas to: chat-advisor, brain-core, personal-brain, os-command, admin-users. Each gets a `z.object()` schema validated before processing.

**5 files modified**

### Batch 4 — Wire 5 representative ecosystem admin pages to CAI hooks
Pick one per family (APL01, AND01, HRS01, NRC01, NSS01) and replace empty table data with `useCaiQuery()` hooks from `use-cai-data.ts`. Add "Seed Defaults" button calling `ambient-os-operations`.

**5 files modified**

### Batch 5 — Wire DemoModeProvider in App.tsx + Update Report
- Wrap app with `<DemoModeProvider>` in App.tsx
- Regenerate `infra/docs/FINAL_ARQ_REPORT_v3.md` with updated evidence and score: **92/100**

**2 files modified**

---

## Expected Score Impact

| Dimension | Current | After |
|-----------|---------|-------|
| Runtime | 78 | 82 |
| AI | 82 | 86 |
| Connector | 58 | 58 |
| Demo | 85 (actual) | 98 |
| Device | 50 | 50 |
| Observability | 90 | 92 |
| Economic | 78 | 80 |
| UX | 75 | 76 |
| Security | 82 (actual) | 90 |
| Launch | 72 | 78 |
| **Composite** | **~82** | **~92** |

## Files Summary
- 16 page files (DemoModeBadge)
- 9 edge function files (CORS)
- 5 edge function files (Zod)
- 5 ecosystem admin pages (CAI wiring)
- 1 App.tsx (DemoModeProvider)
- 1 report file update