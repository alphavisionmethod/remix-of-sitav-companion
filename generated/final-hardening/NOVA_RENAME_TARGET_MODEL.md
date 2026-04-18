# Nova Rename — Target Model

| Aspect | Old | New |
|---|---|---|
| Public/canonical name | Nova Kernel | **Nova Runtime SDK** |
| Internal code path | `src/lib/nova-sdk/kernel/` | unchanged (internal) |
| Public alias module | n/a | `src/platform/nova-runtime-sdk/index.ts` |
| Claim implication | implies host kernel ownership ❌ | userland runtime SDK ✅ |
| Operator truth wording | "Kernel" | "Runtime SDK" |
| User-visible wording | "Kernel" (any) | forbidden by gate |

## Compatibility strategy
- Internal kernel modules retain their names (architectural meaning).
- The canonical public alias is `Nova Runtime SDK` and is the only public-facing identifier.
- Compatibility re-exports live in `src/platform/nova-runtime-sdk/index.ts`.
- Drift CI gate prevents user-visible "Nova Kernel" reappearance.

## Rationale
The system is a userland simulated substrate — calling it a "Kernel" in launch/marketing copy creates claim risk. The Runtime SDK label preserves architectural meaning while removing the host-ownership implication.
