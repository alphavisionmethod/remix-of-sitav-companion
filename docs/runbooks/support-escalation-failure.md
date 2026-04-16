# RB-019 — Support Escalation Failure

| Field | Value |
|---|---|
| Severity | **high** |
| Bounded Context | `admin` |
| Subsystem | support-escalation |
| Owner | support |
| Estimated MTTR | 10 min |
| Kill switch | `KS-OUTBOUND` |
| Message code | `SUP-001` |

## Trigger

Escalation does not reach the target within the configured SLA.

## Steps

1. **Verify outbound communications** are not blocked by `KS-OUTBOUND`.
2. **Re-route via the secondary escalation channel**.
3. **Manually page** on-call admin if all automated paths fail.
4. **Open an incident** to fix the broken escalation path.

## Rollback

Re-enable the primary path only after the failure mode is fixed and re-tested.

## Evidence

- Channel availability check
- Escalation delivery receipts
- Incident document
