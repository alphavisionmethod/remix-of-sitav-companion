

# Phase 3 Core Persistence Substrate — Audit & Implementation Plan

## Current State Assessment

**Already fully implemented and wired:**

| System | Service | Persistence Adapter | DB Table | RLS | Wired to Service |
|--------|---------|---------------------|----------|-----|-------------------|
| EventBus | `event-bus.ts` | `event-bus-persistence.ts` | `os_event_log` (18 cols) | Yes (CRUD) | Yes — publish() auto-persists |
| MemoryService | `memory-service.ts` | `memory-service-persistence.ts` | `os_memory_scoped` (18 cols) | Yes (CRUD) | Yes — store()/forget() auto-persist |
| PolicyEngine | `policy-engine.ts` | `policy-engine-persistence.ts` | `os_policy_evaluations` (21 cols) | Yes (select/insert) | Yes — evaluate() auto-persists |
| ActionStateMachine | `action-state-machine.ts` | `action-lineage-persistence.ts` | `os_action_lineage` (23 cols) | Yes (select/insert/update) | Yes — constructor + transition auto-persist |
| Intelligence Assets | — | `intelligence-asset-persistence.ts` | `intelligence_assets_library` | Yes | Yes — full CRUD |
| Receipt/Proof | `receipt-service.ts` | `supabase-adapters.ts` | `sita_receipts` / `sita_proof_records` | Yes | Yes |
| Memory Forget Log | — | via memory-service-persistence | `sita_memory_forget_log` | Yes | Yes |
| Engine State | — | `engine-persistence-adapter.ts` | `os_service_state` | Yes | Yes — 100+ services use loadPersistedState() |

**All 10 CPS admin surfaces exist and are routed:**

| Screen | File | Route |
|--------|------|-------|
| CPS01 Core Overview | `CorePersistenceOverview.tsx` | `/admin/core-persistence` |
| CPS02 Event Stream | `EventStreamExplorer.tsx` | `/admin/event-stream` |
| CPS03 Memory Center | `MemoryContinuityCenter.tsx` | `/admin/memory-continuity` |
| CPS04 Policy Ledger | `PolicyDecisionLedger.tsx` | `/admin/policy-ledger` |
| CPS05 Intelligence Library | `IntelligenceArtifactLibrary.tsx` | `/admin/intelligence-library` |
| CPS06 Action Lineage | `ActionLineageExplorer.tsx` | `/admin/action-lineage` |
| CPS07 Replay Console | `ReplayRecoveryConsole.tsx` | `/admin/replay-console` |
| CPS08 Migration Board | `CoreServiceMigrationBoard.tsx` | `/admin/service-migration` |
| CPS09 Drift Radar | `PersistenceDriftRadar.tsx` | `/admin/persistence-drift` |
| CPS10 Continuity Board | `RuntimeContinuityBoard.tsx` | `/admin/runtime-continuity` |

**All persistence adapters correctly use `fromDynamicTable()` for Supabase queries, handle auth, and are non-blocking (fire-and-forget).**

---

## What Is Missing

### 1. Boot Hydration Hook
The kernel creates `EventBus`, `MemoryService`, `ReceiptService` in memory but **never calls `hydrate()` or `replayFromStorage()` on boot**. The services support it (methods exist), but nothing triggers hydration after login/refresh. `PlatformInit.tsx` only wires Electron bridge and offline store — no substrate hydration.

### 2. Build Error Fix
`src/hooks/use-intelligence-screen-data.ts` has `effectiveMode` references that the build system reports as errors. The file on disk appears to have `mode` (already fixed), but the build may have a stale cache. We need to ensure a clean rebuild triggers.

### 3. Replay/Recovery Console Not Fully Wired
`ReplayRecoveryConsole.tsx` uses `useWorkflowRecovery()` (workflow-level replay) but doesn't use the durable `replayFromStorage()` from EventBus or the `fetchActionLineage`-based replay. It should support correlation ID-scoped event replay from durable storage and dry-run modes.

### 4. Action Lineage Missing Linked Projection References
The `os_action_lineage` table has `linked_event_ids`, `linked_memory_ids`, `linked_policy_ids`, `linked_receipt_ids` but no `linked_projection_ids`. The spec requires projection linkage for full lineage.

### 5. Persistence Drift Radar Uses Hardcoded Demo Data
`PersistenceDriftRadar.tsx` does a single `fetchPersistedEvents` check but most of the drift detection is hardcoded demo data, not live analysis of actual persistence gaps.

### 6. Runtime Continuity Board Manual Checks
`RuntimeContinuityBoard.tsx` runs local checks but doesn't actually test cross-session continuity by reading from durable storage.

---

## Implementation Plan

### Step 1: Create Boot Hydration Hook
Create `src/hooks/useCoreSubstrateHydration.ts` — a hook mounted in `PlatformInit.tsx` that runs once after auth and hydrates:
- `kernel.memory.hydrate()` — loads scoped memory from `os_memory_scoped`
- `kernel.receipts.hydrate()` — loads receipts from `sita_receipts`
- `kernel.eventBus.replayFromStorage({ limit: 200 })` — warms event log
- Emits `kernel.substrate.hydrated.v1` event on completion
- Tracks hydration status for the RuntimeContinuityBoard

### Step 2: Fix Build Error
Force-write `use-intelligence-screen-data.ts` to ensure all `effectiveMode` references are `mode`. The file may have been partially saved.

### Step 3: Add Projection Linkage to Action Lineage
- Migration: add `linked_projection_ids text[] default '{}'` to `os_action_lineage`
- Add `linkProjectionToAction()` function to `action-lineage-persistence.ts`
- Export from barrel

### Step 4: Wire Replay Console to Durable Storage
Enhance `ReplayRecoveryConsole.tsx` to include:
- Event replay from `os_event_log` by correlation ID
- Action lineage replay (reconstruct action history from `os_action_lineage`)
- Dry-run toggle that marks replayed events with `replayed` status
- Diff panel showing before/after state

### Step 5: Wire Persistence Drift Radar to Live Data
Enhance `PersistenceDriftRadar.tsx` to actually detect drift by:
- Querying each `os_*` table for recent activity
- Comparing in-memory event count vs persisted count
- Detecting memory scope coverage gaps
- Flagging domains with no policy evaluations

### Step 6: Wire Runtime Continuity Board to Live Storage
Enhance `RuntimeContinuityBoard.tsx` to actually test:
- Memory hydration success (read from `os_memory_scoped`)
- Event durability (read from `os_event_log`)
- Receipt chain integrity (read from `sita_receipts`)
- Action lineage completeness (read from `os_action_lineage`)

---

## Files Changed

| File | Action |
|------|--------|
| `src/hooks/useCoreSubstrateHydration.ts` | **New** — boot hydration hook |
| `src/components/sita/PlatformInit.tsx` | **Edit** — mount hydration hook |
| `src/hooks/use-intelligence-screen-data.ts` | **Edit** — fix effectiveMode build error |
| `src/lib/persistence/action-lineage-persistence.ts` | **Edit** — add linkProjectionToAction |
| `src/lib/persistence/index.ts` | **Edit** — export new function |
| `src/pages/admin/ReplayRecoveryConsole.tsx` | **Edit** — wire to durable event/action replay |
| `src/pages/admin/PersistenceDriftRadar.tsx` | **Edit** — wire to live persistence gap detection |
| `src/pages/admin/RuntimeContinuityBoard.tsx` | **Edit** — wire to live continuity checks |
| Migration SQL | **New** — add linked_projection_ids column |

**Total: 2 new files, 6 enhanced files, 1 migration. No stubs. Everything wired to real Supabase tables.**

## What Does NOT Need Change

The following are already fully implemented and wired — no work needed:
- EventBus persistence (publish auto-persists, replay from storage exists)
- MemoryService persistence (store/forget auto-persist, hydrate method exists)
- PolicyEngine persistence (evaluate auto-persists denials/approvals)
- ActionStateMachine persistence (auto-persists records and transitions)
- Intelligence asset persistence (full CRUD)
- Receipt/proof persistence (full CRUD)
- All 10 CPS admin page components and routes
- 100+ services with loadPersistedState/hydrate patterns via engine-persistence-adapter
- RLS policies on all os_* tables
- DB schema for all 5 core tables

