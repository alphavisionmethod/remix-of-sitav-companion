

# Wire All Remaining Production Mocks to Real Data — Complete Inventory

## Scale of Work

After scanning every source file outside test/seed/fixture directories, there are **~110 files** (99 pages + 10 components + 1 lib) still consuming DEMO_ or MOCK_ constants directly in production rendering paths without a live data alternative. This is too large to do in a single pass — it requires batched execution across 6 phases.

---

## Classification

### Category A: Pages with inline DEMO_ constants (no import, hardcoded in file) — 15 files
These have DEMO_ arrays defined directly in the page file. They need the data extracted to seed files and replaced with DB queries.

| File | Inline Constants | Wire To DB Table |
|---|---|---|
| `AdminOperationsHub.tsx` | `DEMO_SERVICES`, `DEMO_QUEUES`, `DEMO_INCIDENTS` | `layer_health_snapshots`, `incidents` |
| `FleetHealthPage.tsx` | `DEMO_FLEET`, `DEMO_ANOMALIES`, `DEMO_PREDICTIONS`, `DEMO_MAINTENANCE` | `layer_health_snapshots`, `incidents` |
| `SecurityPostureBoard.tsx` | `DEMO_SECRETS`, `DEMO_CLASSIFICATION`, `DEMO_KEY_ROTATION` | `os_secrets_metadata`, `cloud_compliance_hooks` |
| `EnvironmentSwitcher.tsx` | `MOCK_ENVIRONMENTS` | `profiles` (user's environment list) |
| `SpendingPulse.tsx` | `DEMO_CATEGORIES` | `transactions` (aggregate) |
| `HouseholdMoneyOffice.tsx` | `DEMO_HOUSEHOLD` | `budgets`, `transactions` |
| `PredictiveAnalysisDashboard.tsx` | `MOCK_PREDICTIONS`, `MOCK_ANOMALIES` | `ai_provider_health`, `incidents` |
| `AutomationReceipts.tsx` | `IMPACT_SUMMARY` (hardcoded) | `ai_action_receipts` (aggregate) |
| + 7 more admin pages with inline arrays | Various | Existing tables |

### Category B: Pages importing from `src/data/seed/` without isDemoMode gate — 55 files
These import DEMO_ from seed files and render directly without checking demo mode. They need `isDemoMode` gating + `useQuery` for live mode.

Examples:
- `AISelfHealing.tsx` → `DEMO_HEALED`, `DEMO_RULES`, `DEMO_BLOCKED` → `ai_self_healing_rules`
- `AIHumanBoundaryControls.tsx` → `DEMO_AGENT_BOUNDARIES` → `advisor_autonomy_policies`
- `NSS03TrustContinuity.tsx` → `DEMO_SECURE_ACTIONS` → `admin_safety_actions`
- `NRC01RoutingStudio.tsx` → `DEMO_CHANNEL_SPECS` → `alert_routes`
- `ProofMatrixExplorer.tsx` → `DEMO_PROOFS` → `attestation_packets`
- `SpilloverDashboard.tsx` → `DEMO_ACTIVE_SPILLOVERS` → computed from `deals` + cross-domain events
- `ThesisJournal.tsx` → `DEMO_JOURNAL_ENTRIES` → investment domain tables
- `InvestmentConstitution.tsx` → `DEMO_CONSTITUTION_RULES` → investment strategy tables
- `CoreServiceMigrationBoard.tsx` → `DEMO_SERVICES` → `layer_health_snapshots`
- `FCC06ProgramManagementBoard.tsx` → `DEMO_OBJECTIVES` → program management tables
- `MissionControlHome.tsx` → `DEMO_SERVICES`, `DEMO_MUTATIONS` → `layer_health_snapshots`, `admin_action_audit`
- ~43 more pages following same pattern

### Category C: Components with inline MOCK_ constants — 10 files
- `PlaybookSimulator.tsx` → `MOCK_CUSTOMERS` → `customers`
- `BCPDRDashboard.tsx` → `MOCK_OBJECTIVES` → `sla_definitions`
- `MailClientWindow.tsx` → `MOCK_EMAILS` → `communications` (keep as OS-sim)
- `MusicPlayerWindow.tsx` → `MOCK_TRACKS` → keep as-is (decorative OS-sim)
- `CABWorkflow.tsx` → `MOCK_CHANGES` → `approval_requests`
- `AgentAuditLog.tsx` → `MOCK_AUDIT` → `audit_logs`
- `BoardroomApprovalView.tsx` → `MOCK_APPROVALS` → `approval_queue`
- `BoardroomDiscussionThread.tsx` → `MOCK_DISCUSSIONS` → `boardroom_items`
- `ProfileEvolutionTimeline.tsx` → `MOCK_TIMELINE` → `customer_profile_snapshots`
- `BoardroomEvidencePanel.tsx` → `DEMO_EVIDENCE` → `boardroom_evidence`

### Category D: Services/lib with mock returns — 3 files
- `pack-store/index.ts` → `MOCK_INSTALL_STATES` → `app_launch_events` / `apps`
- `connector-runners.ts` → simulated returns in sandbox mode → keep (intentional sandbox)
- `CommandHistory.tsx` → `MOCK_HISTORY` → `audit_logs`

### What stays as-is (confirmed):
- `src/data/seed/` files — demo fallback data (the source)
- `src/data/fixtures/` files — test/fixture data
- `src/test/` — test utilities
- `__tests__/` — test files
- OS simulation layer (kernel, filesystem, memory) — this IS the product
- `MusicPlayerWindow.tsx`, `NetworkSetupStep.tsx` — decorative OS simulation
- Third-party connector auth (OAuth, banking, forex, crypto)
- `src/lib/claim-safety/demo-only-surface-registry.ts` — this is a governance registry, not mock data
- `src/lib/ai-platform/runtime/` — demo_governed is a classification enum value, not mock data
- `src/pages/admin/MockSourceInventory.tsx` — this page IS the mock audit tool

---

## Execution Strategy

Given the massive scope (~110 files), this must be done in 6 batches to avoid overwhelming the type system.

### Batch 1: Create shared data hooks (foundation layer)
Create reusable hooks that all pages can import:
- `useAdminOpsData()` — queries `layer_health_snapshots`, `incidents`, `sla_definitions`
- `useSecurityPosture()` — queries `os_secrets_metadata`, `cloud_compliance_hooks`
- `useAuditData()` — queries `audit_logs`, `admin_action_audit`, `attestation_packets`
- `useBoardroomData()` — queries `boardroom_items`, `boardroom_evidence`, `approval_queue`
- `useMoneyData()` — queries `transactions`, `budgets`

Each hook follows the pattern:
```typescript
export function useAdminOpsData() {
  const { user, isDemo } = useAuth();
  const { data: liveServices } = useQuery({
    queryKey: ["admin-services", user?.id],
    enabled: !!user && !isDemo,
    queryFn: async () => {
      const { data } = await supabase.from("layer_health_snapshots")
        .select("*").eq("user_id", user!.id)
        .order("created_at", { ascending: false }).limit(20);
      return data;
    },
  });
  return { services: isDemo ? DEMO_SERVICES : (liveServices ?? []), isDemo };
}
```

### Batch 2: Wire 15 pages with inline constants (Category A)
- Move inline DEMO_ arrays to `src/data/seed/` files
- Replace with hook calls from Batch 1
- Pattern: `const data = hook.isDemo ? DEMO_X : hook.liveData`

### Batch 3: Wire 25 admin pages (Category B, first half)
- Add `useAuth()` + `isDemoMode` check to each page
- Add `useQuery` for live data from existing tables
- Keep DEMO_ imports as fallback for demo mode only

### Batch 4: Wire 30 remaining pages (Category B, second half)
- Same pattern as Batch 3 for revenue, money, investment, and enterprise pages

### Batch 5: Wire 10 components (Category C)
- Add `useAuth()` + `useQuery` to each component
- Skip `MusicPlayerWindow` and `MailClientWindow` (OS simulation)

### Batch 6: Wire services + pack store (Category D) + verify
- Wire `pack-store/index.ts` to `apps` table
- Wire `CommandHistory.tsx` to `audit_logs`
- Run full TypeScript check
- Run full test suite

---

## Database Impact

No new tables needed — all ~110 files can map to existing tables in the schema. The key tables being wired:

| Table | Used By (count) |
|---|---|
| `layer_health_snapshots` | ~8 admin pages |
| `incidents` | ~5 admin pages |
| `audit_logs` | ~6 pages/components |
| `ai_self_healing_rules` | 2 pages |
| `approval_queue` / `approval_requests` | 3 components |
| `boardroom_items` / `boardroom_evidence` | 3 components |
| `transactions` / `budgets` | 3 money pages |
| `advisor_autonomy_policies` | 2 pages |
| `attestation_packets` | 2 pages |
| `os_secrets_metadata` | 1 page |
| `ai_action_receipts` | 2 pages |
| `customers` | 2 components |
| `apps` | 1 lib |

## Summary

| Batch | Files | Description |
|---|---|---|
| 1 | 5 new hook files | Shared data hooks (foundation) |
| 2 | 15 pages | Inline constant pages |
| 3 | 25 pages | Admin pages (first half) |
| 4 | 30 pages | Remaining pages |
| 5 | 8 components | Component mock removal |
| 6 | 3 services + verification | Services + full test run |
| **Total** | **~86 files modified, 5 new** | |

