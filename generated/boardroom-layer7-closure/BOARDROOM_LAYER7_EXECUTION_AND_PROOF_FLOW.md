# Boardroom Layer 7 — Execution & Proof Flow

## End-to-end runtime path

### 1. Approval → Dispatch

```
BoardroomApprovalView.tsx
  → useDispatchBoardroomAction()
    → supabase.functions.invoke("boardroom-followthrough-dispatch", { itemId, recommendationId, approvalQueueId, actionType, payload, advisorId })
```

Edge function `boardroom-followthrough-dispatch`:

1. Validates payload with Zod.
2. Reads item; verifies caller's membership (org-scoped) or admin role.
3. Inserts `boardroom_followthrough_dispatches` row in `pending` state with a fresh `correlation_id`.
4. Calls `brd_followthrough_transition(itemId, 'dispatch_pending', correlationId)`.
5. Invokes `agent-executor` with the canonical envelope:
   ```json
   {
     "source": "boardroom-followthrough",
     "dispatch_id": "...",
     "boardroom_item_id": "...",
     "correlation_id": "...",
     "action_type": "...",
     "payload": { ... },
     "risk_tier": "low|medium|high",
     "advisor_id": "..."
   }
   ```
6. On 2xx response: `brd_followthrough_transition('dispatched')`.
7. On error: writes `failure_reason`, `brd_followthrough_transition('failed')`.

### 2. Dispatch → Execution

`agent-executor` (Boardroom branch):

1. Detects `source: "boardroom-followthrough"`.
2. `brd_followthrough_transition('executing')`.
3. Inserts `command_steps` row (canonical execution record).
4. Runs the action (or queues it for an async worker).
5. On success: writes `agent_action_receipts` linking back to `command_step_id` and `dispatch_id`.
6. Updates dispatch with `command_step_id`, `receipt_id`.
7. `brd_followthrough_transition('executed')`, then `brd_followthrough_transition('receipt_recorded')`.
8. Triggers `boardroom-outcome-record` for auto-outcome derivation.

### 3. Execution → Proof

- Receipt IDs are durable in `agent_action_receipts`.
- For high-risk actions, a `proofs` row may be attached carrying signed proof bundle metadata.
- The dispatch row stores `receipt_id` so the entire chain is reachable in one join from `boardroom_items`.

### 4. Proof → Outcome

`boardroom-outcome-record` edge function:

- **Auto path:** invoked by `agent-executor` after receipt; derives `outcome_status: 'success'` and writes `actual_outcome` from receipt summary.
- **Manual path:** invoked from `Layer7FollowthroughBoard` when operator records outcome explicitly.
- Inserts `boardroom_outcome_records`, links to dispatch, calls `brd_followthrough_transition('outcome_tracked')`.

### 5. Outcome → Reflection

`BoardroomReflectionPrompt`:

- Surfaces in `BoardroomFollowthroughPanel` once `outcome_tracked`.
- Captures usefulness (1–5), recommendation quality, execution fitness, lesson, should-repeat.
- Inserts `advisor_board_reflections` with `dispatch_id`, `outcome_record_id`, `boardroom_item_id` FKs.
- `brd_followthrough_transition('reflected')`.
- Auto-calls `closeFollowthrough()` → `brd_followthrough_transition('closed')`.

## Failure semantics

| Phase | Failure handling |
|---|---|
| Dispatch | `failure_reason` populated; user-visible warning; operator can retry |
| Execution | Same; receipt may still be `failed_with_reason` |
| Outcome | `outcome_status: 'failed'` or `'partial'` allowed |
| Reflection | Optional in low-risk tier; required for high-risk |

## Proof reconstruction query (single SQL join)

```sql
SELECT
  bi.id, bi.title, bi.followthrough_state,
  d.correlation_id, d.action_type, d.state AS dispatch_state,
  cs.id AS command_step_id, cs.status AS exec_status,
  r.id AS receipt_id, r.summary AS receipt_summary,
  o.outcome_status, o.actual_outcome, o.confidence,
  refl.usefulness_score, refl.lesson_learned
FROM boardroom_items bi
LEFT JOIN boardroom_followthrough_dispatches d ON d.boardroom_item_id = bi.id
LEFT JOIN command_steps cs ON cs.id = d.command_step_id
LEFT JOIN agent_action_receipts r ON r.id = d.receipt_id
LEFT JOIN boardroom_outcome_records o ON o.dispatch_id = d.id
LEFT JOIN advisor_board_reflections refl ON refl.dispatch_id = d.id;
```
