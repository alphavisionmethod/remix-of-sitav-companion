

# Boardroom Orchestration — Final Wiring Gap Analysis & Fix Plan

## Critical Finding

The orchestration pipeline infrastructure (8 files) is fully built but **completely disconnected from the running application**:

1. **Pipeline never boots**: `initAdvisorConsumer()` and `initAppBoardSynthesizer()` are only called inside `useOrchestrationHealth`, which is never mounted in any component. Signals are emitted into the void.

2. **BoardroomAdvisorCouncil uses hardcoded stances**: The `ADVISOR_STANCES` map is static — never reads from pipeline advisor outputs.

3. **BoardroomExecutiveView partially wired**: It reads `useBoardroomLiveData` items (good), but Morning Brief, SIGNALS, WHAT_CHANGED, and evidence chains are all hardcoded.

4. **BoardroomApprovalView uses MOCK_APPROVALS**: Never reads live recommendations from `boardroom_recommendations` table.

5. **Lifecycle state machine unused**: `transitionState()` is never called from any UI or service code.

6. **No auto-escalation**: `shouldAutoEscalate()` exists in the synthesizer but nothing triggers `escalateToBoardroom()` when the threshold is crossed.

7. **Follow-through is partial**: Approval writes to `advisor_action_queue` but never calls `transitionState("approved")` or creates a `FollowThroughPacket`.

---

## Implementation Plan — 3 Phases

### Phase 1 — Boot the Pipeline (2 files)

**Modify: `src/contexts/RuntimeProvider.tsx`**
- Add a `PipelineBootstrap` component that calls `initAdvisorConsumer()` and `initAppBoardSynthesizer()` on mount, stores cleanup refs, and tears down on unmount.
- This ensures the pipeline is alive whenever the app runs.

**New: `src/hooks/usePipelineBootstrap.ts`**
- Encapsulates pipeline initialization + auto-escalation watcher.
- Subscribes to `board.synthesis.*` events; when `boardroom_worthiness_score >= 0.65`, auto-calls `escalateToBoardroom()`.
- Subscribes to `lifecycle.transition` events for observability logging.

### Phase 2 — Wire Boardroom Views to Live Data (3 files modified)

**Modify: `BoardroomAdvisorCouncil.tsx`**
- Import `getAdvisorOutputs` from the pipeline.
- Replace hardcoded `ADVISOR_STANCES` with dynamic stances derived from live advisor output packets (mapping `boardroom_relevance_score > 0.6` → "agree", `confidence < 40` → "needs-data", `risks.length > 0` → "caution", etc.).
- Fall back to current hardcoded stances when no pipeline outputs exist (demo graceful degradation).

**Modify: `BoardroomApprovalView.tsx`**
- Query `boardroom_recommendations` via `useBoardroomLiveData` instead of using `MOCK_APPROVALS`.
- On approval, call `transitionState(itemId, "approved")` from the lifecycle state machine.
- Include `item_id` and `recommendation_id` in the receipt creation call (currently missing).

**Modify: `BoardroomExecutiveView.tsx`**
- Replace hardcoded `SIGNALS` array with live synthesis data from `getSynthesisForDomain()` for each domain.
- Replace hardcoded `WHAT_CHANGED` with recent transmission log entries from `getTransmissionLog()`.
- Wire the `MorningBrief` to generate text from live items instead of static strings.

### Phase 3 — Lifecycle Integration & Follow-Through Closure (2 files modified)

**Modify: `src/hooks/useBoardroomBridge.ts`**
- After `escalateToBoardroom()` succeeds, call `registerItem(itemId)` and `transitionState(itemId, "advisor_review")` to start tracking the item through the lifecycle.
- After `pushDecisionToApp()` succeeds, call `transitionState(itemId, "executed")`.

**Modify: `src/hooks/useBoardroomLiveData.ts`**
- Add a `transitionItem` mutation that updates `boardroom_items.status` in the database AND calls `transitionState()` in-memory, keeping both in sync.
- Add lifecycle trail query helper that reads from the in-memory `getLifecycleTrail()`.

---

## File Summary

| Phase | File | Action |
|-------|------|--------|
| 1 | `src/hooks/usePipelineBootstrap.ts` | New — pipeline init + auto-escalation |
| 1 | `src/contexts/RuntimeProvider.tsx` | Modify — mount PipelineBootstrap |
| 2 | `BoardroomAdvisorCouncil.tsx` | Modify — dynamic stances from pipeline |
| 2 | `BoardroomApprovalView.tsx` | Modify — live recommendations + lifecycle |
| 2 | `BoardroomExecutiveView.tsx` | Modify — live signals, changes, brief |
| 3 | `useBoardroomBridge.ts` | Modify — lifecycle transitions on escalation |
| 3 | `useBoardroomLiveData.ts` | Modify — transition mutation |

7 files (1 new, 6 modified). No new database tables. No new dependencies.

