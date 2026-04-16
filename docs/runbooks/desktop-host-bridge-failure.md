# RB-016 — Desktop Host Bridge Failure

| Field | Value |
|---|---|
| Severity | **medium** |
| Bounded Context | `runtime-kernel` |
| Subsystem | desktop-host |
| Owner | platform |
| Estimated MTTR | 5 min |
| Kill switch | — |
| Message code | `BOOT-002` |

## Trigger

Desktop bridge probe (`detectDesktopRuntime()`) fails or returns an invalid contract.

## Steps

1. **Probe bridge** and capture state.
2. **Fall back to web-only feature surface**.
3. **Restart Electron main process** if available.
4. **If unrecoverable**, prompt user to relaunch the app.

## Rollback

Re-enable desktop features once probe returns a valid contract.

## Evidence

- Bridge probe snapshot
- Restart logs
- Feature surface degradation events
