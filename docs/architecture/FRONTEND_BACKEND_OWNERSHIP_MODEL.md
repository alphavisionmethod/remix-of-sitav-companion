# SITA OS — Frontend / Backend Ownership Model

> Wave B (Constitution Rule §B.2, **BLOCKING**). The boundary between UI, frontend service facades, integration clients, edge functions, and migrations is now constitutional law, validator-enforced, and ratcheted.

## Authority

- **Constitutional rule:** Repository Constitution §B.2 — Frontend / Backend Ownership Law.
- **Canonical manifest:** `generated/manifests/frontend-backend-boundary-map.json`.
- **Baseline (page+domain bypass):** `generated/baselines/page-backend-bypass-baseline.json` (145 pages + 9 domains pinned, monotone-decreasing).
- **Validator:** `scripts/architecture/checks/check-page-backend-bypass.ts` (BLOCK).
- **Generator:** `scripts/architecture/generate/generate-frontend-backend-boundary-map.ts`.
- **Companion docs:** `docs/architecture/BACKEND_TOPOLOGY_MAP.md` (reference), `docs/architecture/SERVICE_LAYER_CONSTITUTION.md` (Rule 44).

## The five-layer ownership table

| Layer | Owns | Forbidden imports | Allowed callers |
|---|---|---|---|
| `supabase/functions/**` | Backend execution endpoints; server-side orchestration; secrets handling | `react`, `@/components/**`, `@/pages/**`, `src/**` | (deployed to edge runtime; never `import`-ed by app code) |
| `supabase/migrations/**` | Schema evolution; RLS policies; database types | n/a (SQL only) | (auto-managed; never hand-edited as application logic) |
| `src/integrations/**` (incl. `src/integrations/supabase/**`) | Auto-generated clients + types; provider-specific adapters | `@/components/**`, `@/pages/**` | `src/lib/services/**`, `src/lib/clients/**`, `src/data/**`, `src/platform/**`, `src/modules/**` |
| `src/lib/services/**` (canonical service facades) | App-facing service entry points; the only sanctioned home for raw backend invocation patterns | `react`, `@/components/**`, `@/pages/**` | `src/pages/**`, `src/components/**`, `src/modules/**`, `src/platform/**`, `src/admin/**` |
| `src/pages/**`, `src/components/**` | UI / presentation only | direct `@/integrations/supabase/client` (must use a service facade) | (terminal — consume facades) |
| `src/domains/**` | Pure business models, engines, contracts | `@/integrations/supabase/**`, `@/lib/services/**`, `react` | UI, services, platform |

## Forbidden drift patterns

1. **Page-backend bypass** — pages directly importing `@/integrations/supabase/client` instead of a service facade. Currently baselined at **145** files; new violators block CI.
2. **Component-backend bypass** — components importing `@/integrations/supabase/**`. Currently sealed at **0**; any new violator blocks CI.
3. **Domain-backend bypass** — files under `src/domains/**` importing integrations or services. Baseline **9**; monotone-decreasing toward zero.
4. **Edge-function caller drift** — multiple frontend services duplicating identical edge-function invocation logic without a shared contract.
5. **Service-backend duplication** — a frontend service re-implementing logic that already lives in an edge function (vice versa) without a contract link.
6. **Backend-imports-UI** — anything under `supabase/functions/**` or `src/lib/services/**` importing `react` or `@/components`/`@/pages`. Caught by `check-no-ui-in-backend.ts` (already BLOCK).
7. **UI-imports-backend-internals** — pages/components importing `@/lib/core-services/**`. Caught by `check-no-backend-in-ui.ts` (already WARN; promoted to BLOCK in this wave's validator-gate-map note).
8. **Migration-as-app-logic** — application code reaching into `supabase/migrations/**` paths.

## Anti-duplication rule (services ↔ edge functions)

A frontend service in `src/lib/services/<name>/` that proxies an edge function in `supabase/functions/<fn>/` **must** declare the contract link. The recommended pattern is a `contract.ts` re-export:

```ts
// src/lib/services/<name>/contract.ts
export const EDGE_FUNCTION_NAME = "<fn>";
export type * from "@/contracts/types"; // shared request/response types
```

This requirement is documented in `SERVICE_LAYER_CONSTITUTION.md` Rule 44 and surfaced advisory by `check-edge-function-mutation-traceability.ts`.

## Current baseline (sealed Wave B)

| Surface | Direct `@/integrations/supabase` importers |
|---|---|
| `src/pages/**` | 145 (baselined; ratchet-only) |
| `src/components/**` | 0 (sealed) |
| `src/domains/**` | 9 (baselined; monotone-decreasing) |

## Remediation roadmap (out of Wave B scope)

1. **Wave C** — extract page-local Supabase calls into `src/lib/services/<domain>/` facades; drive page baseline 145 → 0.
2. **Wave C.1** — purge all 9 domain-layer integrations imports; enforce strict zero.
3. **Wave C.2** — backfill `contract.ts` files for every existing service↔edge-function pair.

## Amendment process

New layer rules require ADR + update of this doc, the constitution, the validator, the boundary map generator, and re-seal via `wave-10-emit-attestation.ts`.

## Cross-references

- `docs/architecture/BACKEND_TOPOLOGY_MAP.md` — descriptive backend topology (now classified `reference`).
- `docs/architecture/CORE_OS_USER_ADMIN_BACKEND_MODEL.md` — admin backend specifics.
- `docs/architecture/SERVICE_LAYER_CONSTITUTION.md` — 5-layer service authority + Rule 44.
- `docs/architecture/SERVICE_ADAPTER_CLIENT_OWNERSHIP_MODEL.md` — vocabulary coherence.