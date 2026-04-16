# RB-018 — Runtime Probe Failure

| Field | Value |
|---|---|
| Severity | **medium** |
| Bounded Context | `runtime-kernel` |
| Subsystem | runtime-probe |
| Owner | platform |
| Estimated MTTR | 15 min |
| Kill switch | — |
| Message code | `RUNTIME-001` |

## Trigger

`probeRuntimeTier()` reports an unexpected tier or a missing capability.

## Steps

1. **Capture runtime probe snapshot**.
2. **Diff against `generated/runtime-capability-matrix.json`**.
3. **Re-run capability detection** and emit a corrected receipt.
4. **If drift persists**, regenerate the matrix and redeploy.

## Rollback

Revert matrix change if regeneration introduces broader regressions.

## Evidence

- Probe snapshot
- Matrix diff
- Regeneration log
