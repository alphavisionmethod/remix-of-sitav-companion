# Boardroom Layer 7 — Current State Audit

_Snapshot: 2026-04-18, post-Phase 4 closure._

## What existed before this work

| Capability | Pre-state | Evidence |
|---|---|---|
| Recommendation creation | ✅ Real | `advisor_board_recommendations`, `ai_workforce_recommendations`, `recommendation-engine.ts` |
| Approval capture | ✅ Real | `approval_decisions`, `ai_workforce_approval_queue`, instead-of triggers |
| Action dispatch | ⚠️ Partial — UI button only | `BoardroomApprovalView` could mark approved but no canonical dispatch row |
| Execution result persistence | ⚠️ Inconsistent | `command_steps` existed but Boardroom items had no FK |
| Receipt / proof linkage | ❌ Not linked to Boardroom items | `proofs`, `agent_action_receipts` orphaned from Boardroom chain |
| Outcome tracking | ❌ Missing | No table; advisors had no way to record observed outcome |
| Reflection | ⚠️ Decorative | `advisor_board_reflections` existed but no FK to dispatch / outcome |
| Operator visibility | ❌ Missing | No admin surface to see stale Layer 7 chains |
| User visibility | ❌ Missing | Boardroom shell stopped at "Approvals" tab |
| E2E proof | ❌ None | No integration test covered the post-approval chain |

## Where the chain broke

1. **Approval → Dispatch:** Approval status flipped on a recommendation row, but no canonical dispatch object was created and no executor was invoked.
2. **Dispatch → Execution result:** Even when ad-hoc executors ran, the result was not pinned to a Boardroom item.
3. **Execution → Proof:** `agent-executor` emitted `agent_action_receipts` but they were not linked back to the originating boardroom item or dispatch.
4. **Proof → Outcome:** No `outcome_records` table existed, so "what actually changed in the world" was unknown.
5. **Outcome → Reflection:** `advisor_board_reflections` accepted free text but had no FK columns to dispatch / outcome.
6. **Reflection → Closure:** No terminal state existed; items lingered indefinitely.

## Files / systems that owned Layer 7 behavior pre-work

- `src/components/sita/apps/boardroom/BoardroomApprovalView.tsx` — UI only
- `src/lib/services/boardroom/recommendation-engine.ts` — REX lifecycle
- `supabase/functions/agent-executor/index.ts` — generic executor (not Boardroom-aware)
- `src/integrations/supabase` — schema lacked `boardroom_followthrough_dispatches`, `boardroom_outcome_records`

## Gap summary

The flagship Boardroom orchestration loop was **5 of 7 layers real, layer 7 partial**. Approval was where reality stopped.
