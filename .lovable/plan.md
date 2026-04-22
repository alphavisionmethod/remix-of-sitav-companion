

# Fix 10 Partial Systems + Build Error — Deployment Readiness

## Priority 0: Fix Build Error

`src/pages/SystemStatus.tsx` line 119 has a corrupted line from the automated mock-gating pass:
```
const SeverityBadge = ({
  const { isDemoMode } = useDataMode(); severity }: { severity: string }) => {
```
The `useDataMode()` call was injected into the wrong location. Fix: move it inside the component body or remove it (SeverityBadge is a presentational component that receives data via props — it does not need demo mode gating).

---

## System 1: Receipt Emission (0% of edge functions emit receipts)

**Current state:** Receipt types and tables exist (`ai_action_receipts`, `notification_delivery_receipts`). `push-dispatch` already writes delivery receipts. `receipt-builder.ts` constructs receipt objects. But most edge functions do not persist receipts.

**Fix:** Add a shared `emitReceipt()` helper in `supabase/functions/_shared/receipt-emitter.ts` that inserts into `ai_action_receipts`. Then add receipt emission to the 10 highest-traffic edge functions: `brain-core`, `advisor-agent-loop`, `agent-executor`, `workflow-execute`, `scheduler-dispatch`, `event-processor`, `intelligence-api`, `routing-policy-update`, `connector-sync`, `self-healing`.

**Test:** Deploy and call each function via `curl_edge_functions`, verify receipts appear in `ai_action_receipts`.

---

## System 2: Advisor Debate (no execution evidence)

**Current state:** `advisor-debate-orchestrator.ts` has types + `resolveDebate()` function. No tests, no DB persistence of debate outcomes.

**Fix:**
1. Add `resolveDebate` result persistence — write debate rounds to `advisor_board_recommendations` with type `debate_outcome`.
2. Create `src/lib/advisors/__tests__/advisor-debate-orchestrator.test.ts` covering: consensus, majority, dissent, escalation, tiebreaker, and insufficient participants.

---

## System 3: Desktop Runtime (no host binary)

**Current state:** Full contract layer exists (`desktop-host-contract.ts`, `electron-bridge-contract.ts`, detection, security boundaries). `electron/main.cjs` exists. No packaged binary in the repo (expected — binaries are CI artifacts).

**Fix:** This is correctly partial by design — the binary is produced by CI, not stored in repo. What's missing is a **smoke test** that validates the contracts match the Electron main process. Create `src/runtimes/desktop/__tests__/desktop-runtime-contract.test.ts` to verify contract completeness and detection logic.

---

## System 4: Appliance Runtime (no CI-verified image)

**Current state:** Contracts, ISO scripts, OVA build scripts all exist and are GA per `PLATFORM_SCOPE.md`. Images are CI artifacts.

**Fix:** Same as desktop — add `src/runtimes/appliance/__tests__/appliance-runtime-contract.test.ts` to verify the contract types, capability entries, and first-boot phase completeness.

---

## System 5: Mobile Runtime (archived)

**Current state:** Archived per `PLATFORM_SCOPE.md`. Not active scope.

**Fix:** No action needed. This is correctly inactive. Verify the archive contract test exists; if not, add a minimal `src/runtimes/__tests__/mobile-archive-assertion.test.ts` that asserts mobile is not in active scope.

---

## System 6: Sync Engine (no conflict resolution tests)

**Current state:** `sync-protocol.ts` has full types (SyncConflict, ConflictResolution, SyncRepairRequest, etc.). One integration test exists in `cloud-sync-updates.integration.test.ts` with a basic conflict resolution case.

**Fix:** Create `src/packages/protocols/__tests__/sync-protocol.test.ts` with unit tests for: all 5 conflict resolution strategies (server_wins, client_wins, merge, manual, newest_wins), sync state transitions, repair request validation, checkpoint integrity, and reconciliation logic.

---

## System 7: Notification Delivery (no delivery confirmation tracking)

**Current state:** `push-dispatch` already writes to `notification_delivery_receipts` table (exists in DB). It updates `notifications_queue` status to `delivered` or `failed`.

**Fix:** This is actually more complete than reported. What's missing is a **confirmation callback** for async delivery (e.g., FCM delivery receipts). Add a `delivery-confirmation` webhook handler in push-dispatch that updates receipt status from `sent` to `confirmed` when platform callbacks arrive. Add test coverage.

---

## System 8: Offline Queue (no replay tests)

**Current state:** `OfflineQueueService` is fully implemented with enqueue, replay (with retry + max 5 attempts), persistence, and online event listener.

**Fix:** Create `src/lib/services/offline-queue/__tests__/offline-queue.test.ts` testing: enqueue, replay success, replay failure with retry, max retries exceeded, queue persistence, clear, and online event trigger.

---

## System 9: Search Fabric (no index management, no relevance tests)

**Current state:** `SearchFabricService` exists with add/remove/search. Extensive tests already exist in 3 test files covering indexing, domain filtering, sensitivity filtering, and facets.

**Fix:** The test coverage is actually good. What's missing is **index management** (rebuild, clear, stats). Add `rebuildIndex()`, `clearIndex()`, and `getIndexStats()` methods. Add relevance scoring tests that verify title matches rank higher than body matches.

---

## System 10: Digital Twins (no twin state verification)

**Current state:** `digital-twin-engine` edge function exists and queries `digital_twin_state` and `digital_twin_snapshots` tables. But these tables do not exist in the database yet.

**Fix:**
1. Create migration for `digital_twin_state` and `digital_twin_snapshots` tables with RLS.
2. Deploy `digital-twin-engine` edge function.
3. Test via `curl_edge_functions`.

---

## Execution Order

| Phase | Systems | Files Changed |
|---|---|---|
| 0 | Build error fix | 1 file |
| 1 | DB migration (digital twin tables) | 1 migration |
| 2 | Shared receipt emitter + wire 10 edge functions | 11 files |
| 3 | Advisor debate tests + persistence | 2 files |
| 4 | Sync protocol tests | 1 file |
| 5 | Offline queue tests | 1 file |
| 6 | Search fabric index management | 2 files |
| 7 | Desktop + appliance contract tests | 2 files |
| 8 | Notification delivery confirmation | 1 file |
| 9 | Digital twin deploy + test | 1 edge function |
| 10 | Run all tests, verify green | 0 files |

**Total: ~22 files, 1 migration, ~10 edge function updates**

