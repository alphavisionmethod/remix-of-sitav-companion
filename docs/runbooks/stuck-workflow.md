# RB-004 — Stuck Workflow Recovery

| Field | Value |
|---|---|
| Severity | **medium** |
| Bounded Context | `runtime-kernel` |
| Subsystem | workflow |
| Owner | ai |
| Estimated MTTR | 5 min |
| Kill switch | `KS-WORKFLOW` |
| Message code | `WF-001` |

## Trigger

Workflow remains in a non-terminal state for >30 minutes.

## Steps

1. **Identify the stuck workflow** and current state.
2. **Check pending approvals** in the approval queue.
3. **Attempt state-transition retry**.
4. **If still stuck** — force-complete or force-fail with audit entry.

## Rollback

Revert force transitions if downstream side effects make the chosen terminal state unsafe.

## Evidence

- Workflow state machine snapshot
- Approval queue dump
- Audit entry for the forced transition
