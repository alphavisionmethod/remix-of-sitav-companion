# Nova Rename — Reference Audit

## Classification of "Nova Kernel" references

| Class | Action | Examples |
|---|---|---|
| Internal code symbol (`src/lib/nova-sdk/kernel/*`) | KEEP — internal architectural meaning preserved | `KernelBootSequence`, `Scheduler` |
| Canonical alias (public-facing) | REPLACED | `src/platform/nova-runtime-sdk/index.ts` re-exports kernel modules under "Runtime SDK" name |
| Operator/admin truth surfaces | REWORDED | "Nova Runtime SDK" used in admin truth boards |
| Launch-honesty docs | REWORDED | Track B containment docs updated |
| Marketing/demo copy | REWORDED | No "Kernel" claim in user-visible surfaces |
| Architecture memory | KEEP (historical, internal) | `memory/architecture/nova-kernel` retained for trace |
| Tests/scripts referencing internal modules | KEEP | unchanged for stability |

## Drift gate
`scripts/validation/check-nova-runtime-sdk-naming.ts` enforces public-surface naming.
`scripts/validation/check-no-user-visible-nova-kernel-claims.ts` blocks user-visible regressions.
`scripts/validation/check-track-b-claim-safety.ts` ensures Track B docs stay honest.
