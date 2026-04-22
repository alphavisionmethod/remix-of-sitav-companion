

# Remove All Production Mocks — Wire Real Data Everywhere

## Scope

After auditing every file in the project, there are **5 distinct categories** of production mocks that need real wiring. This is a massive effort (~60 files) that must be done in phases to avoid breaking the app.

**What stays as-is (per your request):**
- `src/data/seed/` and `src/data/fixtures/` — demo fallback data
- Test files (`__tests__/`, `*.test.*`) — proper test isolation
- OS simulation layer (kernel, filesystem, memory, rendering) — this IS the product
- Third-party API auth connectors (OAuth, banking, forex, crypto)
- `Math.random()` used for IDs (`Date.now()-${Math.random().toString(36)}`) — this is standard UUID-like generation, not mock data
- `Math.random()` used for UI animations/visualizations (particle effects, chart noise)

---

## Phase 1: Fix "isDemoMode ? DEMO_X : DEMO_X" (Same Data Both Ways) — 10 files

These pages pretend to check the mode but always return the same demo data. They need real DB queries for live mode.

| File | Broken Pattern | Wire To |
|---|---|---|
| `LeakDetector.tsx` | `DEMO_LEAKS : DEMO_LEAKS` | `revenue_leaks` table (needs creation) |
| `OpportunityBoard.tsx` | `DEMO_opportunities : DEMO_opportunities` | `deals` table |
| `JourneyTwin.tsx` | `DEMO_JOURNEY_STAGES : DEMO_JOURNEY_STAGES` | `customer_journey_stages` table |
| `RelationshipCenter.tsx` | `DEMO_LIFECYCLE_STAGES : DEMO_LIFECYCLE_STAGES` | `customer_lifecycle_stages` table |
| `PipelineStudio.tsx` | `DEMO_VELOCITY : DEMO_VELOCITY` | Compute from `deals` data |
| `GrowthBoardroom.tsx` | `DEMO_ADVISOR_SIGNALS : DEMO_ADVISOR_SIGNALS` | `advisor_board_recommendations` |
| `WhatBreaksGrowth.tsx` | `liveRiskAreas.length > 0 ? DEMO : DEMO` | Actually use `liveRiskAreas` |
| `CommercialMemoryFeed.tsx` | `liveMemoryEvents.length > 0 ? DEMO : DEMO` | Actually use `liveMemoryEvents` |
| `MediaWorkspace.tsx` | `liveMedia?.length ? liveMedia : DEMO_MEDIA` | Already correct — just remove DEMO fallback in live mode |
| `EnterpriseControlPlane.tsx` | `DEMO_COMPLIANCE_ITEMS` used directly | `compliance_controls` table |

**Fix pattern:**
```typescript
// BEFORE (broken)
const LEAKS = isDemoMode ? DEMO_LEAKS : DEMO_LEAKS;

// AFTER (real)
const { data: liveLeaks } = useQuery({
  queryKey: ["revenue-leaks", user?.id],
  enabled: !!user && !isDemoMode,
  queryFn: () => supabase.from("revenue_leaks").select("*").eq("user_id", user!.id),
});
const LEAKS = isDemoMode ? DEMO_LEAKS : (liveLeaks ?? []);
```

**DB migration needed:** Create `revenue_leaks` table (with RLS).

---

## Phase 2: Wire 19 Components with Inline `MOCK_` Constants — 19 files

These components have hardcoded mock arrays that never query the database.

| Component | Mock | Wire To |
|---|---|---|
| `ComplianceDashboard.tsx` | `MOCK_CONTROLS`, `MOCK_SLAS`, `MOCK_RISKS` | `compliance_controls`, `sla_definitions`, `risk_register` (exists) |
| `DiagnosticExportAudit.tsx` | `MOCK_AUDITS` | `audit_export_bundles` table |
| `WebhookReplayPanel.tsx` | `MOCK_EVENTS` | `webhook_events` table |
| `WeeklyExecutiveReport.tsx` | `MOCK_REPORT` | Generate from `advisor_board_recommendations` + `deals` |
| `PredictiveAnalysisDashboard.tsx` | `MOCK_PREDICTIONS`, `MOCK_ANOMALIES` | `ai_provider_health` + `incidents` |
| `AISpendIndicator.tsx` | `MOCK_SPEND` | `ai_token_usage` table (aggregate) |
| `MailClientWindow.tsx` | `MOCK_EMAILS` | `communications` table |
| `CodeEditorWindow.tsx` | `MOCK_FILES` | `cloud_files` table |
| `MusicPlayerWindow.tsx` | `MOCK_TRACKS` | Keep as-is (OS simulation — decorative) |
| `AccountEnvironmentStep.tsx` | `MOCK_RESTORE` | `profiles` table |
| `NetworkSetupStep.tsx` | `MOCK_NETWORKS` | Keep as-is (OS simulation — onboarding UX) |
| `ProfileEvolutionTimeline.tsx` | `MOCK_TIMELINE` | `customer_profile_snapshots` table |
| `PlaybookSimulator.tsx` | `MOCK_CUSTOMERS` | `customers` table |
| `UniversalTimeline.tsx` | `MOCK_TIMELINE` | `audit_logs` table |
| Other 5 components | Various | Map to existing tables |

**Pattern:** Add `useQuery` with auth check, use mock as demo-mode fallback only.

---

## Phase 3: Wire Pages That Use DEMO_ Directly (No isDemoMode Check) — 15 files

These pages import DEMO_ data and render it directly without any mode check.

| Page | Demo Constants Used Directly | Wire To |
|---|---|---|
| `AISelfHealing.tsx` | `DEMO_HEALED`, `DEMO_RULES`, `DEMO_BLOCKED` | `ai_self_healing_rules` table |
| `AdminMutationAudit.tsx` | `DEMO_MUTATIONS` | `admin_action_audit` table |
| `AutomationReceipts.tsx` | `DEMO_receipts` | `ai_action_receipts` table |
| `AdminOperationsHub.tsx` | `DEMO_SLOS`, `DEMO_QUEUES`, `DEMO_INCIDENTS` | `sla_definitions`, `incidents` |
| `FleetHealthPage.tsx` | `DEMO_FLEET`, `DEMO_ANOMALIES`, `DEMO_PREDICTIONS`, `DEMO_MAINTENANCE` | `layer_health_snapshots`, `incidents` |
| `SecurityPostureBoard.tsx` | `DEMO_SECRETS`, `DEMO_KEY_ROTATION` | `os_secrets_metadata`, `secret_rotation_log` |
| `RevenueAutopilotMonitor.tsx` | `DEMO_HEALTH` | `automation_kill_switches` + computed |
| `WeeklyBoardroom.tsx` | `MOCK_WEEK` | `advisor_board_recommendations` |
| `EnvironmentSwitcher.tsx` | `MOCK_ENVIRONMENTS` | `profiles` table |
| `DeviceSettings.tsx` | `MOCK_DEVICE` | `navigator` API (already partially real) |
| `MobileDeviceTrust.tsx` | `MOCK_DEVICES` | Keep device info from browser APIs |
| `SovereignExportPage.tsx` | `DEMO_EXPORTABLE_TABLES`, `DEMO_PAST_EXPORTS` | `data_export_requests` table |
| `CapitalPurpose.tsx` | `DEMO_RULES` | Investment rules from seed (keep — config data) |
| `AuditComplianceWorkspace.tsx` | `MOCK_AUDIT_RECORDS` | `audit_logs` table |
| `CrossTenantGovernance.tsx` | `DEMO_PATTERNS` | Keep — governance config data |

---

## Phase 4: Realize 4 Executor Services — 4 files

| Service | Current Behavior | Real Behavior |
|---|---|---|
| `execute-connector-action.service.ts` | Returns `{ simulated: true }` with random recordCount | Query `connector_sync_runs` for real health, invoke `connector-sync` edge function, log to `connector_sync_runs` |
| `execute-workflow-step.service.ts` | Returns `{ externalCallSimulated: true }` for external-call | Route through `workflow-step` edge function, record in `workflow_receipts` |
| `connector-executor.ts` | Console.debug + returns `{ executed: true }` | Invoke edge function via `supabase.functions.invoke()`, log to `connector_receipts` |
| `connector-runners.ts` | Sandbox/simulation mode returns `{ simulated: true }` | In real mode, invoke `connector-sync` edge function; sandbox/simulation stay as simulation (intentional) |

---

## Phase 5: Wire `pack-store/index.ts` Install States — 1 file

| File | Mock | Wire To |
|---|---|---|
| `src/lib/pack-store/index.ts` | `MOCK_INSTALL_STATES` | `installed_apps` table |

---

## Phase 6: Fix Services Using Math.random() for Business Logic — 3 files

| Service | Issue | Fix |
|---|---|---|
| `execute-action.service.ts` | `Math.floor(Math.random() * 200) + 50` for simulation durationMs | Use `performance.now()` delta |
| `execute-connector-action.service.ts` | `Math.floor(Math.random() * 50) + 1` for recordCount | Return actual record count from sync |
| `communication-service/index.ts` | `Math.random() * 500 + 100` for latencyMs | Use actual elapsed time |

---

## Database Migration

**1 new table needed:**
- `revenue_leaks` — tracking pipeline revenue leakage points

All other tables already exist in the schema.

## Execution Order

1. Create `revenue_leaks` table migration
2. Phase 1: Fix 10 revenue/enterprise pages with broken ternaries
3. Phase 2: Wire 15 components (skip OS-simulation ones)
4. Phase 3: Wire 15 pages using DEMO_ directly
5. Phase 4: Realize 4 executor services
6. Phase 5: Wire pack-store install states
7. Phase 6: Fix Math.random() in business logic
8. Run full test suite to verify nothing breaks

## Summary

| Category | Files | Action |
|---|---|---|
| Broken ternaries (DEMO : DEMO) | 10 | Wire useQuery to real tables |
| Inline MOCK_ in components | 15 (skip 4 OS-sim) | Wire useQuery or props |
| DEMO_ used directly (no check) | 15 | Add isDemoMode gate + useQuery |
| Executor services | 4 | Replace simulated returns with real edge function calls |
| Pack store | 1 | Wire to installed_apps table |
| Math.random business logic | 3 | Use real measurements |
| **Total** | **~48 files** | |

