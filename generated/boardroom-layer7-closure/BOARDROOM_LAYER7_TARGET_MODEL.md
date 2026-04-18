# Boardroom Layer 7 — Target Model

## Canonical chain (unidirectional, durable, queryable)

```
BoardroomItem
  └─ Recommendation                       (advisor_board_recommendations)
      └─ ApprovalDecision                 (approval_decisions / ai_workforce_approval_queue)
          └─ FollowthroughDispatch        (boardroom_followthrough_dispatches)   ← NEW
              └─ ExecutionResult           (command_steps via agent-executor)
                  └─ Receipt / Proof       (agent_action_receipts, proofs)
                      └─ OutcomeRecord    (boardroom_outcome_records)             ← NEW
                          └─ Reflection   (advisor_board_reflections + FKs)       ← EXTENDED
                              └─ closed   (boardroom_items.followthrough_state)   ← NEW column
```

## Canonical ownership

| Concern | Owner |
|---|---|
| State machine + transitions | `src/lib/services/boardroom/followthrough-engine.ts` |
| Dispatch creation + executor invocation | `supabase/functions/boardroom-followthrough-dispatch` |
| Execution + receipt emission | `supabase/functions/agent-executor` (Boardroom-aware branch) |
| Outcome recording | `supabase/functions/boardroom-outcome-record` |
| Reflection capture | `BoardroomReflectionPrompt.tsx` → `advisor_board_reflections` |
| User visibility | `BoardroomFollowthroughView` + `BoardroomFollowthroughPanel` (in `BoardroomAppShell`) |
| Operator visibility | `Layer7FollowthroughBoard` (in `/admin/approvals` → "Layer 7 Follow-through") |
| State persistence | `boardroom_items.followthrough_state` (single source of truth) |
| Timeline emission | SQL function `brd_followthrough_transition()` writes to `timeline_events` on every transition |
| Validation | 6 scripts under `scripts/validation/check-boardroom-*` |
| Release gate | `scripts/architecture/checks/check-boardroom-layer7-closure.ts` (BLOCK) |

## Linkage proof obligations

Every dispatch row must satisfy:

1. `boardroom_item_id` resolves to an existing `boardroom_items` row
2. `recommendation_id` (if present) resolves to `advisor_board_recommendations`
3. After execution, `command_step_id` resolves to a `command_steps` row
4. After receipt, `receipt_id` resolves to `agent_action_receipts`
5. After outcome, `outcome_record_id` resolves to `boardroom_outcome_records`
6. Final reflection in `advisor_board_reflections` carries all three FKs (`dispatch_id`, `outcome_record_id`, `boardroom_item_id`)
