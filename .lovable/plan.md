
# Wave 1.3 — Service / Adapter / Client Layer Hardening

## Audit findings (real repository state)

| Surface | Reality |
|---|---|
| `src/lib/services/**` | **229 service folders** already classified by `src/lib/migration/service-authority-map.ts` into 5 layers (PLATFORM / DOMAIN / **INTEGRATION_ADAPTER** / PROJECTION / **UI_CLIENT**). |
| `src/lib/core-services/**` | 90 entries — Layer 1 (platform canonical) + a subset already labeled `INTEGRATION_ADAPTER` (connector-runners, google-provider-family, integration-hub, connector-health-service, connector-control). |
| `src/lib/data-services/**` | 11 entries — Layer 5 `UI_CLIENT` (mode-aware Supabase CRUD). |
| `src/lib/adapters/**` | **Does not exist** — adapters live inside `core-services` / `services` and are tagged `INTEGRATION_ADAPTER`. |
| `src/lib/clients/**` | **Does not exist** — low-level callers live in `data-services` (`UI_CLIENT`) plus a few `*-client.ts` files inside `services/`. |
| Constitution | `docs/architecture/SERVICE_LAYER_CONSTITUTION.md` (66 lines) defines the 5-layer model + forbidden cross-layer matrix. |
| Validators | 17 service-related validators already exist (`check-service-layer-boundaries`, `check-service-authority-unique`, `check-wrapper-purity`, `check-projection-purity`, `check-service-sprawl`, `check-services-structure-hygiene`, etc.). |

**Conclusion:** the repo already implements the user's `services / adapters / clients` model — under different names (PLATFORM/DOMAIN, INTEGRATION_ADAPTER, UI_CLIENT). A physical mass-move of 229 folders into `src/lib/{services,adapters,clients}` would:

- violate the strict **no-logic / no-UI / no-API-change** rule (229 import surfaces × thousands of consumers),
- destabilize the Wave-10 architectural attestation,
- conflict with the just-sealed Wave-1.1 / Wave-1.2 wrappers,
- produce no semantic change (the layers are already authoritative via the authority map).

The **correct hardening** is therefore a **vocabulary bridge + enforcement strengthening**, not a folder shuffle. This matches all 8 deployment-readiness gates the user listed (canonical destination proof, reverse-dep proof, old-path removal gates, EmptyState semantics untouched, attestation reseal via canonical script, single canonical owner, no-logic/no-UI/no-API change).

---

## Plan (8 changes, all safe, zero behavior diff)

### 1. New constitutional doc
**Create** `docs/architecture/SERVICE_ADAPTER_CLIENT_OWNERSHIP_MODEL.md`

- States the canonical mapping:
  - **Service facade** ↔ `PLATFORM_CANONICAL` ∪ `DOMAIN_CANONICAL`
  - **Adapter** ↔ `INTEGRATION_ADAPTER`
  - **Client** ↔ `UI_CLIENT`
  - **Read-model** ↔ `PROJECTION_CANONICAL` (kept distinct — read-only)
- Defines: services compose adapters/clients; adapters wrap clients; clients hold transport only; UI consumes services (not raw clients) except where `UI_CLIENT` is the explicit consumption seam.
- Lists the 4 forbidden sprawl patterns (service doing transport, client doing orchestration, adapter duplicating facade, raw SDK bypassing adapter).

### 2. New machine-readable mapping
**Create** `src/lib/migration/service-vocabulary-bridge.ts`

```ts
export const VOCAB_BRIDGE = {
  service:  ["PLATFORM_CANONICAL", "DOMAIN_CANONICAL"],
  adapter:  ["INTEGRATION_ADAPTER"],
  client:   ["UI_CLIENT"],
  readModel:["PROJECTION_CANONICAL"],
} as const;
```

Pure constant — zero runtime behavior, consumed only by validators + generators.

### 3. New canonical ownership artifact
**Create** `generated/manifests/lib-service-layer-ownership-map.json` — emitted by a new script `scripts/architecture/emit-lib-service-layer-ownership.ts` that walks `service-authority-map.ts` and projects each entry into `{ path, layer, vocabClass: service|adapter|client|readModel, canonical, family }`.

### 4. New sprawl-deduplication audit artifact
**Create** `generated/audits/service-sprawl-deduplication-report.json` listing:
- entries flagged `WRAPPER_COMPAT_ONLY`, `DUPLICATE_MERGE_REQUIRED`, `SPLIT_REQUIRED`,
- `*-client.ts` files inside `src/lib/services/**` (potential client-misclassification),
- low-level transport-shaped files outside `data-services/` (heuristic: imports `@supabase/supabase-js` directly + ≤ 1 export).

### 5. New blocking validator
**Create** `scripts/architecture/checks/check-service-vocabulary-coherence.ts`

Fails CI when:
- a file under `src/lib/services/**` ending in `-client.ts` is **not** classified `INTEGRATION_ADAPTER` or `UI_CLIENT` in the authority map,
- a file classified `UI_CLIENT` lives outside `src/lib/data-services/**`,
- a file classified `INTEGRATION_ADAPTER` directly imports `@/modules/**` or `@/pages/**` (upward leak),
- a `PLATFORM_CANONICAL` or `DOMAIN_CANONICAL` file directly imports `@supabase/supabase-js` (must go through a client/adapter).

Registered in `src/lib/ci/validator-gate-map.ts` as **blocking**.

### 6. Strengthen existing service-layer-boundaries check
**Edit** `scripts/architecture/checks/check-service-layer-boundaries.ts` to import `VOCAB_BRIDGE` and emit human-readable `service|adapter|client` labels in violation messages (no rule change — just clarity).

### 7. Constitution amendment
**Edit** `docs/architecture/SERVICE_LAYER_CONSTITUTION.md` — append a new section **"Vocabulary Bridge — services / adapters / clients"** with the mapping table from doc #1, and a new **Rule 7**: *"No file may be promoted from `UI_CLIENT` to `DOMAIN_CANONICAL` (or vice-versa) without an entry update in `service-authority-map.ts` and a passing `check-service-vocabulary-coherence` run."*

### 8. Final hardening report
**Create** `generated/audits/service-adapter-client-hardening-report.md` — covers:
- old sprawl-risk summary,
- new semantic vocabulary bridge,
- classification counts (services / adapters / clients / read-models),
- exact files touched (this wave touches **0 service implementation files** — only docs, maps, validators, generated artifacts),
- constitution + validator changes,
- verification: `tsc --noEmit` clean, all 18 service-related validators passing, attestation resealed via the canonical `scripts/architecture/wave-10-emit-attestation.ts` script.

---

## Safety guarantees (matches the 8 deployment-readiness gates)

| Gate | How this plan satisfies it |
|---|---|
| Canonical destination proof | The vocabulary bridge maps each existing path to exactly one `vocabClass`; no file moves, so destinations are tautologically the current canonical paths. |
| Reverse-dependency proof | Zero implementation files moved → zero importer churn → reverse-dep graph unchanged. |
| Stronger old-path removal gates | New `check-service-vocabulary-coherence` blocks regressions; existing `check-deprecated-wrappers` + `check-legacy-wrapper-usage` continue to enforce shim removal. |
| Targeted multi-consumer smoke tests | No multi-consumer move happens. `tsc --noEmit` + the existing 17 service validators are the smoke. |
| Explicit `EmptyState` semantic verification | EmptyState is a UI primitive — out of service-layer scope; its Wave-1.1 canonical home (`@/platform/sita/components/sita/EmptyState`) is untouched and re-verified by the existing validator pass. |
| Attestation resealing only via canonical script | Reseal via `scripts/architecture/wave-10-emit-attestation.ts`; never by hand. |
| Exactly one canonical owner per concept | Enforced by the existing `check-service-authority-unique` + the new vocabulary bridge (each layer maps to exactly one `vocabClass`). |
| Strict no-logic / no-UI / no-API change | This wave touches **0** files under `src/lib/services/**`, `src/lib/core-services/**`, or `src/lib/data-services/**`. Only docs / maps / validators / generated artifacts change. |

---

## What this plan deliberately does NOT do

- Does **not** create empty `src/lib/adapters/` or `src/lib/clients/` folders. Creating empty buckets without moving files would itself be sprawl.
- Does **not** physically move any of the 229 service folders. The authority map already assigns each one a canonical layer; relocation would be a separate, ADR-gated wave.
- Does **not** touch any runtime code, edge function, connector, or UI surface.
- Does **not** alter the Wave-1.2 contract layer or the Wave-1.1 component shims.

If you want a future ADR-gated **physical** relocation wave (e.g. moving the ~10 `INTEGRATION_ADAPTER` services into `src/lib/adapters/` with full shim coverage), that should be its own wave with its own attestation reseal. This wave establishes the vocabulary, enforcement, and audit trail that such a wave would need.
