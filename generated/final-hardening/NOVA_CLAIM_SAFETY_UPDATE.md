# Nova Rename — Claim Safety Update

## Old name
**Nova Kernel** — implied host-kernel ownership and kernel-level isolation, neither of which the system provides.

## New canonical name
**Nova Runtime SDK** — accurately describes a userland runtime substrate that simulates OS-like primitives (scheduler, memory manager, transactional FS, IPC, power, crash resilience) inside the React + Electron host process.

## What changed

| Surface | Change |
|---|---|
| `src/platform/nova-runtime-sdk/index.ts` | NEW canonical alias module — re-exports internal modules under honest names |
| `src/platform/nova-sdk/kernel/*` | UNCHANGED — kept as compatibility alias (internal directory only, never user-visible) |
| `scripts/validation/check-nova-runtime-sdk-naming.ts` | NEW validator — fails CI if "Nova Kernel" reappears in claim-bearing surfaces |
| `generated/final-hardening/nova-rename-status.json` | NEW status artifact |

## Claim risk removed

- ❌ "Nova Kernel" implied SITA owns a real host kernel
- ❌ Implied kernel-level security boundary (process isolation, ring-0)
- ❌ Implied direct hardware control

## Honest framing now in use

> Nova Runtime SDK is a userland runtime substrate. It simulates OS-like primitives inside the host process. It does not own real hardware, does not replace the host kernel, and does not provide kernel-level isolation.

Internal symbol names are kept for compatibility but are not claim-bearing because they are not user-visible. The validator allowlists only:
- `src/platform/nova-sdk/kernel/**` (internal directory)
- `docs/REAL_VS_SIMULATED.md` (honesty doc itself)
- `generated/final-hardening/**` (this audit)
- Test files

Any other appearance of "Nova Kernel" in code or docs will fail CI.

## Migration guidance for new code

```ts
// ✅ Use the canonical alias
import { NovaRuntimeSDK, NovaRuntimeScheduler } from "@/platform/nova-runtime-sdk";

// ❌ Avoid in new code (compatibility-only)
import { boot } from "@/platform/nova-sdk/kernel/boot";
```
