

# Remove Production Mocks and Wire Real Data — Comprehensive Plan

## Scope Analysis

After auditing the entire codebase, there are **4 categories of mocks** in production code:

1. **Pages with `isDemoMode ? DEMO_X : DEMO_X` (same data both ways)** — 9 revenue-office pages that never show real data even in live mode
2. **Components with inline `MOCK_` constants** — 20 component files with hardcoded mock arrays instead of database queries
3. **Services with simulated execution** — 4 executor services that return `{ executed: true }` or `{ simulated: true }` instead of calling real backend functions
4. **OS-simulation layer** (kernel, filesystem, memory, rendering) — These are **intentionally simulated** browser experiences (not real OS), should be kept as-is

**What stays as mocks (per user request):**
- Third-party API auth connectors (OAuth, banking, forex, crypto)
- `src/data/seed/` files (needed for demo mode fallback)
- Test files (`__tests__/`, `*.test.ts`)
- OS simulation layer (it IS the product — browser-based OS experience)

---

## Phase 1: Fix 9 Revenue-Office Pages (DEMO_X : DEMO_X pattern)

These pages use the same demo data whether in demo or live mode. Wire them to real database queries with demo fallback.

| File | Mock Variables | Target DB Table |
|---|---|---|
| `src/pages/revenue-office/PipelineStudio.tsx` | DEMO_STAGES, DEMO_LEAKS, DEMO_VELOCITY | `deals`, `revenue_leaks` |
| `src/pages/revenue-office/GrowthBoardroom.tsx` | DEMO_PIPELINE_STAGES, DEMO_LEAKS, DEMO_ADVISOR_SIGNALS | `deals`, `advisor_board_recommendations` |
| `src/pages/revenue-office/ConversionLab.tsx` | DEMO_EXPERIMENTS | `conversion_experiments` (new) |
| `src/pages/revenue-office/CommercialMemoryFeed.tsx` | DEMO_memoryEvents | `commercial_memory_events` (new) |
| `src/pages/revenue-office/WhatBreaksGrowth.tsx` | DEMO_riskAreas | `revenue_risk_areas` (new) |
| `src/pages/revenue-office/OpportunityBoard.tsx` | DEMO_opportunities | `deals` |
| `src/pages/revenue-office/LeakDetector.tsx` | DEMO_LEAKS | `revenue_leaks` |
| `src/pages/revenue-office/JourneyTwin.tsx` | DEMO_JOURNEY_STAGES | `customer_journey_stages` (new) |
| `src/pages/revenue-office/RelationshipCenter.tsx` | DEMO_LIFECYCLE_STAGES | `customer_lifecycle_stages` (new) |

**Change pattern for each file:**
```typescript
// BEFORE
const STAGES = isDemoMode ? DEMO_STAGES : DEMO_STAGES;

// AFTER
const { data: liveStages } = useQuery({
  queryKey: ["pipeline-stages", user?.id],
  enabled: !!user && !isDemoMode,
  queryFn: async () => {
    const { data } = await supabase.from("deals").select("*").eq("user_id", user!.id);
    return data;
  },
});
const STAGES = isDemoMode ? DEMO_STAGES : (liveStages ?? []);
```

**New tables needed:** 5 tables via database migration (`conversion_experiments`, `commercial_memory_events`, `revenue_risk_areas`, `customer_journey_stages`, `customer_lifecycle_stages`)

---

## Phase 2: Wire 20 Component Files with Inline Mocks to DB

Replace inline `MOCK_` constants with database-backed queries or prop-driven data.

| Component File | Inline Mock | Resolution |
|---|---|---|
| `ComplianceDashboard.tsx` | MOCK_CONTROLS, MOCK_SLAS, MOCK_RISKS | Query `compliance_controls`, `sla_metrics`, `risk_items` tables |
| `UniversalTimeline.tsx` | MOCK_TIMELINE | Query `audit_trail` table (already exists) |
| `DiagnosticExportAudit.tsx` | MOCK_AUDITS | Query `diagnostic_export_jobs` table (already exists) |
| `WebhookReplayPanel.tsx` | MOCK_EVENTS | Query `webhook_events` table (already exists) |
| `WeeklyExecutiveReport.tsx` | MOCK_REPORT | Generate from real `advisor_board_recommendations` + `deals` data |
| `PlaybookSimulator.tsx` | MOCK_CUSTOMERS | Query `customers` table (already exists) |
| `CodeEditorWindow.tsx` | MOCK_FILES | Query `file_metadata` table (already exists) |
| `MailClientWindow.tsx` | MOCK_EMAILS | Query `communication_log` table (already exists) |
| `AccountEnvironmentStep.tsx` | MOCK_RESTORE | Query `profiles` table for real user data |
| `ProfileEvolutionTimeline.tsx` | MOCK_TIMELINE | Query `customer_profile_snapshots` (new) |
| Other 10 component files | Various MOCK_ constants | Map to existing tables or create new ones |

**New tables needed:** ~3 tables

---

## Phase 3: Wire 4 Executor Services to Real Backend

These services currently return hardcoded success. Wire them to edge functions or database operations.

### `execute-action.service.ts`
- **Current:** Returns `{ executed: true }` immediately
- **Fix:** Record execution in `execution_receipts` table, dispatch to appropriate edge function based on `capabilityId`, update status on completion

### `execute-connector-action.service.ts`
- **Current:** Returns `{ simulated: true }` with random data
- **Fix:** Query `connector_instances` for real health status, invoke `connector-sync` edge function for actual operations, store results in `connector_sync_logs`

### `execute-workflow-step.service.ts`
- **Current:** Returns `{ externalCallSimulated: true }` for external-call steps
- **Fix:** Route through `workflow-step` edge function, record in `workflow_step_executions`

### `connector-executor.ts`
- **Current:** Logs to console and returns `{ executed: true }`
- **Fix:** Call `connector-webhook` edge function, record in `connector_sync_logs`

### `os-security/recovery.ts`
- **Current:** Uses `Math.random() > 0.3` for recovery success
- **Fix:** Actually re-initialize the failed service module and verify health

---

## Phase 4: Wire Remaining Page-Level Mocks

Several non-revenue pages also have mock patterns that should use existing DB tables:

| Page | Current Mock Source | Wire To |
|---|---|---|
| `CustomerDetail.tsx` | `DEMO_CUSTOMERS_DATA[id]` | `customers` table with real ID lookup |
| `MarketMemoryFeed.tsx` | `DEMO_MEMORY_EVENTS` (always used) | `market_events` + `advisor_observations` |
| `FunnelBuilder.tsx` | DEMO_FUNNELS (always used) | `conversion_experiments` table |

---

## Technical Details

### Database Migrations
Create ~8 new tables for data that currently has no backing store:
- `conversion_experiments` — A/B test experiments
- `commercial_memory_events` — Revenue memory feed entries
- `revenue_risk_areas` — Growth risk tracking
- `customer_journey_stages` — Journey twin mapping
- `customer_lifecycle_stages` — CRM lifecycle definitions
- `customer_profile_snapshots` — Profile evolution history
- `compliance_controls` — Compliance framework controls
- `risk_register` — Enterprise risk items

All new tables will have RLS policies scoped to `auth.uid()`.

### Execution Order
1. Create database migrations for ~8 new tables
2. Fix 9 revenue-office pages (Phase 1)
3. Wire 20 components (Phase 2)
4. Wire 4 executor services (Phase 3)
5. Wire remaining pages (Phase 4)
6. Run full test suite to verify nothing breaks
7. Verify demo mode still works with seed data fallback

### What Stays As-Is
- `src/data/seed/` — Demo data files (needed for demo mode)
- `src/data/fixtures/` — Fixture data for testing
- OS simulation layer (kernel, memory, filesystem) — This IS the product
- Third-party connector auth (OAuth, banking APIs) — Added later
- All test file mocks — Proper test isolation
- `isDemoMode ? DEMO_X : (liveData ?? DEMO_X)` pattern — Already correctly wired

### Estimated Scope
- ~40 files modified
- ~8 new database tables
- ~4 service rewrites
- ~30 pages/components with mock-to-live wiring

