# Boardroom Layer 7 — State Machine

The post-approval lifecycle is stored in `boardroom_items.followthrough_state` and transitioned exclusively by the SQL function `brd_followthrough_transition()`, which also emits a `timeline_events` row.

## States

| State | Meaning | Terminal? |
|---|---|---|
| `none` (NULL) | Item not yet approved or pre-Layer-7 | no |
| `approved` | Approval captured, dispatch not yet created | no |
| `dispatch_pending` | Dispatch row created, executor not yet invoked | no |
| `dispatched` | Executor invoked successfully (acknowledged) | no |
| `executing` | Executor reports work in progress | no |
| `executed` | Executor returned success | no |
| `receipt_recorded` | `agent_action_receipts` row linked to dispatch | no |
| `outcome_pending` | Receipt present, outcome not yet recorded | no |
| `outcome_tracked` | `boardroom_outcome_records` row written | no |
| `reflected` | Advisor reflection captured with full FKs | no |
| `closed` | Operator (or auto-policy) marked chain complete | **yes** |
| `failed` | Any phase failed; `followthrough_failure_reason` set | **yes** |

## Transitions

```
                  ┌─────────────────────────────────────────────┐
                  │                                             │
                  ▼                                             │
none ──► approved ──► dispatch_pending ──► dispatched ──► executing ──► executed
                                                                            │
                                                                            ▼
                                                                  receipt_recorded
                                                                            │
                                                                            ▼
                                                                  outcome_pending
                                                                            │
                                                                            ▼
                                                                  outcome_tracked
                                                                            │
                                                                            ▼
                                                                       reflected
                                                                            │
                                                                            ▼
                                                                         closed
```

Any state may transition to `failed` if the executor errors or an operator force-fails.

## Triggers

| Transition | Trigger | Code path |
|---|---|---|
| `approved` → `dispatch_pending` → `dispatched` | `boardroom-followthrough-dispatch` edge function | builds payload, writes dispatch row, calls `agent-executor` |
| `dispatched` → `executing` → `executed` / `failed` | `agent-executor` Boardroom branch | writes `command_steps`, `agent_action_receipts` |
| `executed` → `receipt_recorded` | `agent-executor` after receipt insert | calls `brd_followthrough_transition('receipt_recorded')` |
| `receipt_recorded` → `outcome_pending` → `outcome_tracked` | `boardroom-outcome-record` edge function | auto-derived from receipt OR manual operator |
| `outcome_tracked` → `reflected` | `BoardroomReflectionPrompt` → `recordReflection()` | inserts `advisor_board_reflections` with FKs |
| `reflected` → `closed` | `closeFollowthrough()` (auto on reflection or operator action) | `Layer7FollowthroughBoard` "Close" button |
| `* → failed` | Executor error OR operator "Force-fail" | `markFailed()` in `followthrough-engine.ts` |

## Idempotency

`brd_followthrough_transition` is idempotent — re-applying the same `(itemId, state)` tuple is a no-op for state but always emits a timeline event with the current `correlation_id` so re-tries are auditable.

## Recovery

- **Stuck dispatches** (`dispatch_pending` > SLA): operator-retryable from Layer 7 board.
- **Failed executions**: `followthrough_failure_reason` populated; operator may retry by calling dispatch edge function with `retry_of` param.
- **Missing outcomes**: surfaced in admin queue; operator can record outcome manually.
- **Missing reflections**: surfaced as stale; auto-prompt to advisor.
