# RB-012 — Setup Checkpoint Corruption

| Field | Value |
|---|---|
| Severity | **medium** |
| Bounded Context | `setup-identity` |
| Subsystem | setup |
| Owner | platform |
| Estimated MTTR | 10 min |
| Kill switch | — |
| Message code | `SETUP-001` |

## Trigger

Setup state machine cannot resume from a saved checkpoint.

## Steps

1. **Identify last known-good checkpoint**.
2. **Restore checkpoint state** from snapshot.
3. **Re-run validation** for steps after the checkpoint.
4. **Notify user** and resume the flow.

## Rollback

Reset to fresh setup if checkpoint restoration corrupts downstream state.

## Evidence

- Checkpoint id restored
- Validation results post-restore
- User notification receipt
