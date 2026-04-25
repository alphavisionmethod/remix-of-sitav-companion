# Frontend Page Ownership Model

> **Status:** Adopted (Wave F — Constitution Rule 50, BLOCKING)
> **Manifest:** `generated/manifests/frontend-page-ownership-map.json`
> **Validator (BLOCK):** `scripts/architecture/checks/check-frontend-page-canonical-ownership.ts`
> **Generator:** `scripts/architecture/generate/generate-frontend-page-ownership-map.ts`
> **Baseline:** `generated/baselines/frontend-page-canonical-baseline.json` (sealed at 0)

## Why this exists

The repo executed page canonicalization across Waves 4–9, but no constitutional
rule explicitly named the canonical home for every category of page body. Wave F
seals that gap with a 5-zone ownership model and a BLOCK validator.

## The 5 canonical zones

| Zone | Path pattern | Owns | Profile |
|---|---|---|---|
| **Route adapters** | `src/pages/**` | thin re-exports, redirects, lazy bindings, shell mounts | both |
| **Pillar pages** | `src/modules/<pillar>/pages/**` | canonical bodies for product pillars (`business`, `concierge`, `finance`, `health`) | user |
| **Platform pages** | `src/platform/<system>/pages/**` | canonical bodies for cross-pillar systems (`boardroom`, `trust`, `personal-brain`, `mission-control`, `files`, `atlas`, `owner`, …) | user · operator (system-dependent) |
| **Admin pages** | `src/admin/modules/<domain>/views/**` | canonical bodies for operator/admin surfaces; Rule 30 ratchet drains `src/pages/admin/**` here | operator |
| **Mobile/shell pages** | `src/platform/experience/pages/mobile/**` | canonical bodies for mobile trusted-device shell | user (mobile profile) |

`src/admin/pages/<domain>/index.ts` barrels remain as re-export aggregators
during the Rule 30 admin migration. They are not canonical owners.

## Hard rules

1. **`src/pages/**` is a route-adapter zone only.** Net-new files MUST be ≤10 logical lines and re-export from `@/modules/*`, `@/platform/*`, or `@/admin/*`.
2. **Allowlist (NEVER thick bodies):** `src/pages/NotFound.tsx`, `src/pages/**/__tests__/**`, `src/pages/**/index.ts` barrels.
3. **Ratcheted exception:** `src/pages/admin/**` is governed by the existing Constitution Rule 30 monotone-decrease baseline (576 bodies → migrating to `src/admin/modules/<domain>/views/`). Wave F does **not** loosen Rule 30; it complements it.
4. **Sealed zones (Wave F):** `src/pages/mobile/`, `src/pages/business-advisors/`, `src/pages/owner-mode/` — bodies were moved out and the zones are sealed at 0. Any thick body re-emerging here BLOCKS CI.
5. **App / admin / shell / OS surfaces stay separate.** Mobile-shell pages live under `src/platform/experience/pages/mobile/`, not flattened into `src/modules/*` or `src/platform/<system>/pages/`. Admin pages stay under `src/admin/modules/<domain>/views/`. Product pages stay under modules / platform.
6. **Reusable UI is not a page body.** Components live under `src/components/`, `src/modules/<pillar>/components/`, `src/platform/<system>/components/` per Wave C UI Ownership Law (§C.1). Pages compose components, never the reverse.
7. **Shim integrity.** Every page shim's `canonicalOwner` target file MUST exist; broken shims BLOCK CI.

## Sealed Wave-F state

| Surface | State after Wave F |
|---|---|
| `src/pages/*.tsx` (root) | 96 shims + `NotFound.tsx` (router fallback) — unchanged from Wave 6 |
| `src/pages/{business,concierge,finance,boardroom,...}` (~24 folders) | 100% shims |
| `src/pages/mobile/` | 27 shims → `@/platform/experience/pages/mobile/` |
| `src/pages/business-advisors/` | 2 shims → `@/modules/business/pages/business-advisors/` |
| `src/pages/owner-mode/` | 1 shim → `@/platform/owner/pages/` |
| `src/pages/admin/` | 561 ratcheted bodies (Rule 30, monotone-decrease) |
| `src/pages/__tests__/` | 50 test files (intentional) |

**canonical-body baseline = 0** outside the Rule 30 ratcheted-admin zone.

## How violations surface

`check-frontend-page-canonical-ownership.ts` produces `generated/frontend-page-canonical-report.json` with three failure classes:

- `newCanonicalBodies` — net-new thick bodies anywhere under `src/pages/**` (excluding admin/__tests__/barrel/router-fallback)
- `sealedZoneRegression` — thick bodies re-emerging in `src/pages/{mobile,business-advisors,owner-mode}/**`
- `brokenShims` — shim's `canonicalOwner` target file does not exist

## Relationship to other governance

- **Builds on Waves 4–9** physical migrations (root pages, pillar pages, platform pages, components allowlist, shim removal).
- **Complements Constitution Rule 30** (`check-admin-page-body-ratchet.ts`) — Rule 30 governs admin migration; Rule 50 governs everything else.
- **Complements Constitution Rules 33–35** (semantic route-adapter contract) — Rule 50 enforces *where* bodies live; Rules 33–35 enforce *what* an adapter may contain.
- **Complements Wave C §C.1** (UI Ownership) — UI primitives stay in `src/components/`; full screens live in the 5 canonical page zones above.
- **Complements Wave D §D.1** (Profile Visibility) — operator-only routes still need admin guards regardless of where the body lives.
- **Complements Wave D §D.2** (Concept Uniqueness) — every primary concept maps to exactly one canonical page family registered in `primary-concept-registry.ts`.

## Future implementation guide

When adding a new screen:

1. Decide the zone (pillar / platform / admin / mobile-shell).
2. Write the body at the canonical zone path.
3. Add a 4-line shim under `src/pages/<route>/<File>.tsx`:
   ```ts
   // legacy path re-exports the canonical implementation.
   // Lives at @/<zone>/<owner>/pages/<File>
   export { default } from "@/<zone>/<owner>/pages/<File>";
   export * from "@/<zone>/<owner>/pages/<File>";
   ```
4. Wire the shim into the appropriate `src/routes/*.tsx` registry.
5. Re-run `npx tsx scripts/architecture/generate/generate-frontend-page-ownership-map.ts` and confirm the validator passes.