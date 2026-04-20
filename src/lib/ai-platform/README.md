# `src/lib/ai-platform/` — Canonical AI Family Home

## Purpose

This directory is the **single canonical home** for the SITA OS AI surface.
It consolidates four historically-overlapping clusters into one navigable
hierarchy, eliminating the cognitive load of `ai` vs `ai-gateway` vs
`ai-engineering` vs `sovereign-ai-gateway`.

## Layer

Kernel / Platform — AI runtime and engineering primitives. Not a feature
surface. Consumed by `src/features/**`, `src/admin/**`, and edge functions
via the canonical `@/lib/ai-platform/*` import paths.

## Canonical neighbors

- `@/lib/ai-platform/runtime` — client-side AI runtime (`invokeAICapability`, hooks)
- `@/lib/ai-platform/gateway` — pre-invocation client gates (budget, rate-limit)
- `@/lib/ai-platform/engineering` — 9 intelligence layers
- `@/lib/ai-platform/sovereign` — Sovereign Gateway type taxonomy
- Legacy shim re-exports under `src/lib/{ai,ai-engineering,ai-gateway,sovereign-ai-gateway}/` (enforced by BLOCK Gate #28 `ai-shim-integrity`)

## Domain map

| Subdomain        | Source path                          | Responsibility                                                                 |
| ---------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| `runtime/`       | `src/lib/ai-platform/runtime/`       | Client-side AI runtime: `invokeAICapability`, hooks, state grammar, executor.  |
| `gateway/`       | `src/lib/ai-platform/gateway/`       | Pre-invocation client gates (budget gate today; rate-limit / kill-switch tba). |
| `engineering/`   | `src/lib/ai-platform/engineering/`   | The 9 intelligence layers (observation → diagnosis → planning → execution).   |
| `sovereign/`     | `src/lib/ai-platform/sovereign/`     | Type taxonomy enforcing the Sovereign AI Gateway constitution.                 |

## Import patterns

```ts
// Preferred — explicit subdomain (smallest blast radius, best tree-shaking)
import { invokeAICapability } from "@/lib/ai-platform/runtime";
import { checkBudget } from "@/lib/ai-platform/gateway";

// Namespaced — when consuming many AI surfaces in one file
import { Runtime, Gateway, Engineering, Sovereign } from "@/lib/ai-platform";

// Legacy — still supported via shim, will keep working forever
import { invokeAICapability } from "@/lib/ai";
import { ObservationLayer } from "@/lib/ai-engineering";
```

## Migration status

The four legacy folders (`src/lib/ai`, `ai-engineering`, `ai-gateway`,
`sovereign-ai-gateway`) have been reduced to **single-line re-export
shims** that point at this canonical home. No existing import statement
in the project required modification — the consolidation is fully
backward-compatible.

| Legacy path                         | Status | Re-exports from                          |
| ----------------------------------- | ------ | ---------------------------------------- |
| `src/lib/ai/index.ts`               | shim   | `@/lib/ai-platform/runtime`              |
| `src/lib/ai-engineering/index.ts`   | shim   | `@/lib/ai-platform/engineering`          |
| `src/lib/ai-gateway/index.ts`       | shim   | `@/lib/ai-platform/gateway`              |
| `src/lib/sovereign-ai-gateway/index.ts` | shim | `@/lib/ai-platform/sovereign`            |

## Constitution

This module is the canonical implementation surface for the **Sovereign
AI Gateway** constraint family (see `memory:constraints/sovereign-ai-gateway`).
All AI invocation MUST flow through `runtime/invokeAICapability`, which
itself MUST consult `gateway/budget-gate` before dispatch. Direct provider
SDK usage is forbidden.
