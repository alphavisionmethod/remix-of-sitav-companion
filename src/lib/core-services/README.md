# Layer-1 Platform Canonical (Organs + Façade)

## Purpose
The **canonical façade** over Layer-2 domain services. Defines the organ pattern (one organ per business domain) and re-exports the implementations from `src/lib/services/`. This is the **authority above** `services/`.

## Layer
**Layer 1** in the SITA Service Constitution. Layer-1 sits above Layer-2 implementations and is the contract surface that the rest of the codebase consumes.

## What lives here
- Organ definitions (one per domain) that compose Layer-2 implementations.
- The barrel that `src/services/index.ts` re-exports under `export * from "@/lib/core-services"`.

## What does NOT belong here
- Concrete domain logic → `src/lib/services/`.
- Platform plumbing (auth/proof/observability) → `src/lib/platform/`.
- OS daemons → `src/lib/os-services/`.

## Canonical neighbors
- `src/lib/services/` — Layer-2 implementations re-exported via this façade.
- `src/lib/data-services/` — Layer-4 read-model projections.
- `src/lib/os-services/` — Layer-3 OS daemons (~33 daemons, namespaced).
- `src/services/index.ts` — single root that wires all 4 layers.

## Authority
This is the **contract surface**. Changes here are breaking changes for the entire app. Never import implementations directly from `services/` outside this barrel.
