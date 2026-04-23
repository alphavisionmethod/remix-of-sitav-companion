

# Fix Remaining TypeScript Build Errors (Batch 5)

## Problem

~30 files still reference undefined constants/variables from removed seed data. The errors fall into these categories:

1. **Circular self-references** (`const X = X;`, `const stuckWorkflows = stuckWorkflows.length`) — 4 files
2. **`[] as typeof MISSING_VAR`** pattern where the referenced variable was never declared — 6 files
3. **Undefined constants** used directly (e.g., `CATALYST_EVENTS`, `TIMELINE_EVENTS`, `PAGE_TREE`, `INTEGRATION_PROVIDERS`) — 15 files
4. **Missing helper functions** (`getProviderById`, `generateCalendarDemoEvents`) — 4 files

## Fix Strategy

For every file, declare the missing constant as an empty typed array (or stub function) at the top of the file, just before first use. No seed data reintroduction — just empty defaults so the app compiles and renders empty states.

## Files to Fix (grouped by directory)

### `src/pages/atlas/` (2 files)
- **ConnectorControlCenter.tsx** — Add `const connectors: any[] = []; const auditTimeline: any[] = [];` before component
- **OperationsCommandCenter.tsx** — Add `const alerts: any[] = []; const services: any[] = []; const slos: any[] = []; const incidents: any[] = []; const runbooks: any[] = [];`

### `src/pages/boardroom/` (1 file)
- **BoardroomHistory.tsx** — Change `return SESSIONS;` to `return [] as any[];`

### `src/pages/business/` (2 files)
- **RevenueAutopilot.tsx** — Replace `LEAKAGE_INPUT`, `RECOVERED_VALUES`, `RAW_OPPORTUNITIES` with `[] as any[]`
- **RevenueImpactDashboard.tsx** — Fix `const PLAYBOOK_REVENUE = PLAYBOOK_REVENUE;` → `const PLAYBOOK_REVENUE: any[] = [];` and cast `v` in line 350

### `src/pages/concierge/` (5 files)
- **FamilyBoardroom.tsx** — Add `const priorities: any[] = []; const scheduleConflicts: any[] = []; const nextMoves: any[] = []; const carryover: any[] = []; const proofSummary: any[] = [];`
- **FamilyCalendar.tsx** — Add `const events: any[] = []; const conflicts: any[] = []; const prepItems: any[] = []; const transportDuties: any[] = []; const familyMembers: any[] = [];`
- **GroceryPlanning.tsx** — Add `const stores: any[] = []; const recurringSupplies: any[] = [];`
- **MonthGridCalendar.tsx** — Add `function generateCalendarDemoEvents(): any[] { return []; }`
- **TravelPlanning.tsx** — Add `const preTripChecklist: any[] = []; const itinerary: any[] = []; const householdSpillover: any[] = []; const postTripTasks: any[] = [];`

### `src/pages/digital-presence/` (2 files)
- **PresenceTimeMachine.tsx** — Add `const TIMELINE_EVENTS: any[] = [];`
- **WebsiteTwin.tsx** — Add `const PAGE_TREE: any[] = [];`

### `src/pages/enterprise/` (1 file)
- **EnterpriseControlPlane.tsx** — Fix self-references: `const TEAM_MEMBERS = realTeamMembers?.length ? realTeamMembers : [];` and similar for `COMPLIANCE_ITEMS`, `SLA_METRICS`, `DEPLOYMENTS`

### `src/pages/integrations/` (4 files)
- **IntegrationsCatalog.tsx** — Add `const INTEGRATION_PROVIDERS: any[] = []; const PROVIDER_CATEGORIES: any[] = [];`
- **ConnectionDetail.tsx** — Add `const getProviderById = (_id: string): any => null;`
- **ConnectionsList.tsx** — Add `const getProviderById = (_id: string): any => null;`
- **ProviderDetail.tsx** — Add `const getProviderById = (_id: string): any => ({ capabilities: [], color: '#666', icon: '🔗' });`

### `src/pages/investment-office/` (8 files)
- **CatalystWarRoom.tsx** — Add `const CATALYST_EVENTS: any[] = [];`
- **DecisionReadiness.tsx** — Add `const PENDING_DECISIONS: any[] = [];`
- **EventProbabilityLab.tsx** — Add `const EVENTS: any[] = [];`
- **OpportunityMap.tsx** — Add `const THEMES: any[] = [];`
- **PlatformConnections.tsx** — Add `const AVAILABLE_PLATFORMS: any[] = [];`
- **PositionSizingCoach.tsx** — Add `const SIZING_SCENARIOS: any[] = [];`
- **PostTradeLoop.tsx** — Add `const ACTIVE_POSITIONS: any[] = [];`
- **TimeMachineReview.tsx** — Add `const PAST_DECISIONS: any[] = [];`
- **WhatWouldBreak.tsx** — Add `const TRADES: any[] = [];`

### `src/pages/mission-control/` (1 file)
- **MissionControlPage.tsx** — Fix `const stuckWorkflows = stuckWorkflows.length;` → reference the already-available array

## Verification

After all fixes, run `npx tsc --noEmit` and `npx vite build` to confirm zero errors.

## Deliverable: full_report.md

Generate `/mnt/documents/full_report.md` documenting:
- All tests/checks performed (tsc, vite build) with pass/fail status
- Files fixed across all sessions with error counts
- Which capabilities are proven working (DB-backed, real Supabase queries) vs. stub/empty-state (awaiting real data)
- The OSAUDIT.md update with current project status

