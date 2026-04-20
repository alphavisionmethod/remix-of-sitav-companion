# Layer-2 Domain Services

## Purpose
Concrete domain service **implementations** (business logic per domain). These are the worker classes/functions that get re-exported by the Layer-1 façade in `core-services/`.

## Layer
**Layer 2** in the SITA Service Constitution (Layer 1 = `core-services` façade, Layer 2 = `services` implementations, Layer 3 = `platform` infrastructure, Layer 4 = `data-services` projections).

## What lives here
- Domain service classes (e.g., `AccountsService`, `BoardroomService`, `LedgerService`).
- Domain-scoped orchestration that is too big to inline in the organ.

## What does NOT belong here
- Generic platform plumbing (auth, observability, notifications) → `src/lib/platform/`.
- Façade re-exports → `src/lib/core-services/`.
- Read-model projections → `src/lib/data-services/`.
- Pure rules-as-data → `src/lib/platform-law/`.

## Canonical neighbors
- `src/lib/core-services/` — the Layer-1 façade that re-exports from here.
- `src/lib/data-services/` — Layer-4 projections (read models).
- `src/services/index.ts` — single navigable root for all 4 layers.

## Authority
The single navigable entry for consumers is `@/services` (= `src/services/index.ts`). Do not import from `@/lib/services/*` directly from app code — go through the façade.
