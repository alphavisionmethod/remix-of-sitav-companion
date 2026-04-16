# RB-013 — Approval Queue Jam

| Field | Value |
|---|---|
| Severity | **high** |
| Bounded Context | `boardroom` |
| Subsystem | approvals |
| Owner | platform |
| Estimated MTTR | 15 min |
| Kill switch | — |
| Message code | `APPR-001` |

## Trigger

Approval queue depth exceeds 100 items, or oldest item is older than 24 hours.

## Steps

1. **Snapshot queue state** for audit.
2. **Identify root cause** — stuck reviewer, missing actor, dead-letter, etc.
3. **Reassign or auto-escalate** items past their SLA.
4. **Move unrecoverable items to dead-letter** with full audit.

## Rollback

Revert reassignments if reviewers return online and the queue can drain naturally.

## Evidence

- Queue snapshot
- Reassignment log
- Dead-letter manifest
