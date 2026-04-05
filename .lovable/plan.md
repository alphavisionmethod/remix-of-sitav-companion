
# Core Persistence Wiring — Targeted Fix Plan

## Audit Result

**3 of 5 services are ALREADY fully wired:**
- ✅ EventBus → `persistEvent`, `persistDeadLetter`, `replayFromStorage` — all operational
- ✅ MemoryService → `persistMemoryEntry`, `supersedeMemoryEntry`, `forgetScopedMemory`, `hydrate()` — all operational
- ✅ PolicyEngine → `persistPolicyEvaluation` for deny/approval/simulation — operational

**2 services need wiring:**
- ❌ ReceiptService — purely in-memory `this.receipts[]`, no persistence adapter imported
- ❌ Action Lineage — adapter exists (`action-lineage-persistence.ts`) but nothing calls it

## Implementation

### 1. Wire ReceiptService to `sita_receipts` persistence

Update `src/lib/core-services/receipt-service.ts`:
- Import `persistReceipt`, `fetchReceipts` from `supabase-adapters.ts`
- On every `createReceipt()` call: persist durably after in-memory append
- Add `hydrate()` method to load receipts from DB on init
- Add `getPersistedReceipts()` for durable queries
- Keep in-memory chain for hot-path hash verification

### 2. Create Action Lineage orchestration service

Create `src/lib/core-services/action-lineage-service.ts`:
- Import all functions from `action-lineage-persistence.ts`
- Provide `initiateAction()`, `transitionAction()`, `linkEvent()`, `linkReceipt()`, `linkPolicy()`
- Export singleton factory
- This gives services a clean API to record action lifecycle

### 3. Wire Action Lineage into key flows

Update `src/lib/core-services/executor-service.ts` (or canonical-execution-path):
- On execution start: call `persistActionRecord()`
- On state transitions: call `persistActionTransition()`
- On receipt creation: call `linkReceiptToAction()`
- On event emission: call `linkEventToAction()`
- On policy evaluation: call `linkPolicyToAction()`

### 4. Add Core Persistence Status admin page

Create `/admin/persistence-status` showing:
- All 5 services and their wiring status
- Recent writes per service
- Hydration health
- Orphaned adapter resolution status

### 5. Remove incorrect `@persistence: none` annotations

The index files for event-bus, memory-service, policy-engine, receipt-service were incorrectly annotated as `@persistence: none` during the bulk annotation pass. Fix these.
