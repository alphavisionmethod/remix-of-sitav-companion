# Boardroom Layer 7 Follow-Through Runbook

> **Owner:** platform-sre · **Backup:** product-lead · **Drill cadence:** monthly

This runbook covers operator response for every meaningful failure mode in the Boardroom Layer 7 follow-through chain (recommendation → approval → dispatch → execution → receipt → outcome → reflection).

## Inspection surfaces

| Surface | Use for |
|---|---|
| `Layer7FollowthroughBoard` (admin) | Stale, orphaned, failed dispatches |
| `boardroom_followthrough_dispatches` | Raw dispatch state + retry path |
| `boardroom_outcome_records` | Outcome tracking gaps |
| `advisor_board_reflections` | Missing reflection diagnosis |
| `timeline_events` (filter `event_type='boardroom.followthrough.transition'`) | Full audit trail |

## Scenarios

### 1. Stuck approval (status=approved, no dispatch within 1h)
1. Confirm `boardroom_items.followthrough_state = 'approved'` and `last_followthrough_event_at` > 1h ago.
2. Inspect `boardroom-followthrough-dispatch` edge function logs.
3. Manually invoke: `supabase.functions.invoke('boardroom-followthrough-dispatch', { body: { item_id, correlation_id } })`.
4. Verify transition to `dispatch_pending` then `dispatched`.

### 2. Dispatched but no execution start (>15m)
1. Check `agent-executor` edge logs for the `correlation_id`.
2. Confirm no kill-switch is blocking (`KS-OUTBOUND`, `KS-AGENT-EXECUTOR`).
3. Re-dispatch via `brd_followthrough_transition(item_id, 'dispatch_pending', correlation_id, 'manual-retry')`.

### 3. Execution failed
1. Inspect `boardroom_followthrough_dispatches.execution_result` jsonb.
2. Classify: transient → retry; permanent → mark `failed` and notify owner.
3. Transition: `brd_followthrough_transition(item_id, 'failed', correlation_id, '<reason>')`.

### 4. Execution complete, no receipt
1. Check `agent_action_receipts` for matching `correlation_id`.
2. If missing, the executor failed mid-write — reconstruct from `command_steps` and re-run receipt emission.

### 5. Receipt exists, no outcome (>24h)
1. Invoke `boardroom-outcome-record` manually with observed result.
2. Or escalate to recommendation owner for outcome capture.

### 6. Outcome exists, no reflection (>72h)
1. Surface `BoardroomReflectionPrompt` to the owner.
2. If user is unavailable, advisor can record a default reflection via admin override.

### 7. Stale chain detection
- `Layer7FollowthroughBoard` highlights any item whose `last_followthrough_event_at` exceeds the SLA for its current state.
- Take action per scenarios 1–6 based on the stuck state.

## Kill-switch interaction

- Never deactivate `KS-BOARDROOM-FOLLOWTHROUGH` without owner approval.
- If activated, all transitions pause. Resume by deactivating + manually nudging stuck items.

## Verification of recovery

After any intervention, confirm:
```sql
SELECT followthrough_state, last_followthrough_event_at
FROM boardroom_items WHERE id = '<item_id>';

SELECT event_type, action, created_at
FROM timeline_events
WHERE subject_id = '<item_id>'
ORDER BY created_at DESC LIMIT 10;
```

The chain is healthy when the item reaches `closed` and a `reflection_recorded` event exists.

## Drill cadence

Monthly drill executes synthetic stuck/failed dispatches and verifies operator can recover within 30 minutes. Tracked in `drill_cadence_registry` under `boardroom-followthrough-runbook-drill`.
