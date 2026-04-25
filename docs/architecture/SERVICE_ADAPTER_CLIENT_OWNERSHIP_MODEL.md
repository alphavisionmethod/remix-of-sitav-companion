# SITA OS — Service / Adapter / Client Ownership Model

> **Wave 1.3 (BLOCKING).** This is the canonical mapping from the user-facing
> vocabulary `service / adapter / client` to the existing 5-layer Service Layer
> Constitution. It is consumed by `check-service-vocabulary-coherence.ts` and
> the `lib-service-layer-ownership-map.json` manifest.
>
> **Companion docs**
> - `docs/architecture/SERVICE_LAYER_CONSTITUTION.md` — the 5-layer authority model
> - `src/lib/migration/service-authority-map.ts` — per-entry classification
> - `src/lib/migration/service-vocabulary-bridge.ts` — machine-readable bridge

## Why a vocabulary bridge instead of a folder shuffle

`src/lib/services/**` already contains 229 directories that are individually
classified into one of five canonical layers by `service-authority-map.ts`. The
layers are:

| Layer code               | Existing root(s)                                  |
| ------------------------ | ------------------------------------------------- |
| `PLATFORM_CANONICAL`     | `src/lib/core-services/**`                        |
| `DOMAIN_CANONICAL`       | `src/lib/services/**`, `src/lib/engines/**`, `src/lib/boardroom/**`, `src/lib/advisor-intelligence/**`, `src/lib/domain-engines/**` |
| `INTEGRATION_ADAPTER`    | a subset of `src/lib/core-services/**` and `src/lib/services/**` (connectors, providers, integration hub) |
| `PROJECTION_CANONICAL`   | `src/lib/core-services/projection-service/**`, `src/lib/services/projection-service/**`, audit/truth-index projection services |
| `UI_CLIENT`              | `src/lib/data-services/**`                        |

Physically relocating 229 service folders into `src/lib/{services,adapters,clients}`
would break the strict **no-logic / no-UI / no-API change** rule and invalidate
the Wave-10 architectural attestation without any semantic gain — the layers
are *already* authoritative. The correct hardening is therefore a **vocabulary
bridge plus stronger enforcement**, governed by this document.

## Canonical mapping

| User vocabulary | Canonical layer(s)                          | Owns                                                                 |
| --------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| **Service**     | `PLATFORM_CANONICAL` ∪ `DOMAIN_CANONICAL`   | App-facing facades, orchestration entrypoints, business/domain logic |
| **Adapter**     | `INTEGRATION_ADAPTER`                       | Connector drivers, provider SDKs, edge-function protocol bridges     |
| **Client**      | `UI_CLIENT`                                 | Mode-aware Supabase CRUD, low-level transport wrappers consumed by UI hooks |
| **Read model**  | `PROJECTION_CANONICAL`                      | Read-only projections, audit trails, truth indices                   |

`PROJECTION_CANONICAL` is kept distinct from `Service` because it is **read-only**
and is enforced separately by `check-projection-purity.ts`.

## Composition direction (allowed)

```
UI / pages / modules / platform / admin
        │
        ▼  consume
   Service facades  ────────────────►  Read models (read-only)
        │
        ▼  compose
      Adapters  (boundary translation)
        │
        ▼  wrap
      Clients  (transport / SDK / fetch primitives)
        │
        ▼  call
   External system / Supabase / Edge function
```

## Forbidden sprawl patterns

1. **Service-as-transport.** A `PLATFORM_CANONICAL` or `DOMAIN_CANONICAL` file
   directly imports `@supabase/supabase-js` or directly invokes
   `fetch()` against an external URL. Must go through an Adapter / Client.

2. **Client-as-orchestrator.** A `UI_CLIENT` file calls into Services, executes
   workflows, emits receipts, or runs approval flows. Clients are dumb.

3. **Adapter-as-facade.** An `INTEGRATION_ADAPTER` file is consumed directly by
   `src/modules/**`, `src/pages/**`, or `src/admin/**`. Modules consume
   Services; Adapters are internal implementation detail.

4. **Raw-SDK bypass.** Any code outside the four canonical roots above imports
   `@supabase/supabase-js`, a connector SDK, or a provider SDK directly.
   Exception: `src/integrations/supabase/client.ts` (the auto-generated singleton).

## Enforcement

| Validator                                        | Rule enforced                              |
| ------------------------------------------------ | ------------------------------------------ |
| `check-service-vocabulary-coherence.ts`          | The four sprawl patterns above (BLOCKING)  |
| `check-service-layer-boundaries.ts`              | Forbidden cross-layer imports              |
| `check-service-authority-unique.ts`              | Exactly one canonical owner per family     |
| `check-wrapper-purity.ts`                        | Compat wrappers contain only re-exports    |
| `check-projection-purity.ts`                     | Read models never mutate                   |
| `check-service-sprawl.ts`                        | 250-folder ceiling on `src/lib/services/**`|

## Generated artifacts

| Artifact                                                                  | Purpose                                                |
| ------------------------------------------------------------------------- | ------------------------------------------------------ |
| `generated/manifests/lib-service-layer-ownership-map.json`                | Per-entry projection: `{path, layer, vocabClass, …}`   |
| `generated/audits/service-sprawl-deduplication-report.json`               | Wrapper / duplicate / split candidates                 |
| `generated/audits/service-adapter-client-hardening-report.md`             | Wave 1.3 hardening summary + verification              |

## Change discipline (Constitution Rule 43)

No file may be promoted between vocabulary classes (Service ↔ Adapter ↔ Client
↔ Read model) without:

1. an updated entry in `src/lib/migration/service-authority-map.ts`,
2. a passing `check-service-vocabulary-coherence` run,
3. attestation reseal **only** via `scripts/architecture/wave-10-emit-attestation.ts`.

No physical file move, no logic change, no UI change, and no public API change
is permitted in a vocabulary-class promotion PR.