# Wave F — Frontend Page Canonicalization Hardening Report

**Status:** Adopted · **Logic/UI/API changes:** None · **File moves:** 30 · **Constitutional rules added:** 1 (Rule 50)

## Part 1 — Canonical model adopted
5-zone ownership: pillar pages (`src/modules/<p>/pages/`), platform pages (`src/platform/<s>/pages/`), admin pages (`src/admin/modules/<d>/views/` — Rule 30 destination), mobile/shell pages (`src/platform/experience/pages/mobile/`), reusable UI (`src/components/`). `src/pages/**` is a route-adapter zone only.

## Part 2 — Tree reclassification (30 moves, all with shims)
- 27 × `src/pages/mobile/*.tsx` → `src/platform/experience/pages/mobile/*.tsx`
- 2 × `src/pages/business-advisors/*.tsx` → `src/modules/business/pages/business-advisors/*.tsx`
- 1 × `src/pages/owner-mode/OwnerModePage.tsx` → `src/platform/owner/pages/OwnerModePage.tsx`
- New barrel: `src/platform/experience/pages/mobile/index.ts`

## Part 3 — Route/shell rewiring
**Zero route registry changes needed.** `MobileRoutes.tsx`, `business-advisor-routes.tsx`, `OwnerRoutes.tsx`, and `src/features/owner-mode/index.ts` all import via `@/pages/...` paths and continue to resolve through the 4-line shims.

## Part 4 — Constitution & governance
- **Rule 50** added (Wave F — Frontend Page Ownership Law)
- New doc `docs/architecture/FRONTEND_PAGE_OWNERSHIP_MODEL.md`
- New manifest `generated/manifests/frontend-page-ownership-map.json` (1148 files classified: 514 shims, 583 ratcheted-admin, 0 canonical-body)
- New baseline `generated/baselines/frontend-page-canonical-baseline.json` sealed at 0

## Part 5 — Validation/CI
- New BLOCK validator `check-frontend-page-canonical-ownership.ts` registered in `src/lib/ci/validator-gate-map.ts`
- New generator `generate-frontend-page-ownership-map.ts`
- Existing validators preserved: Rule 30 admin ratchet, Rules 33–35 semantic-adapter, Wave C §C.1 UI ownership

## Part 6 — Verification
- `tsc --noEmit`: 0 errors
- New validator: ✅ passes (0 bodies, 0 sealed-zone regressions, 0 broken shims)
- Pre-flight: 0 collisions at canonical destinations
- Reverse-dep proof: zero `@/pages/{mobile,business-advisors}/` consumers outside route registries; one `@/pages/owner-mode/` consumer (`src/features/owner-mode/index.ts`) continues to resolve via shim
- App/admin/shell separation preserved: mobile bodies went to platform/experience (shell zone), business-advisors to modules/business (pillar zone), owner-mode to platform/owner (platform zone) — none flattened
- `EmptyState` semantics: untouched (Wave F changes no UI components)
- Attestation reseal: deferred to user via canonical script `npx tsx scripts/architecture/wave-10-emit-attestation.ts`

## Part 7 — Future implementation safety
- Net-new thick body anywhere under `src/pages/**` (outside admin/__tests__/barrel/router-fallback) → BLOCKS CI
- Thick body re-emerging in 3 sealed zones → BLOCKS CI
- Shim with non-existent canonical target → BLOCKS CI
- Documented decision tree for adding new screens (5-step guide in FRONTEND_PAGE_OWNERSHIP_MODEL.md)

## Part 8 — Future-facing items (not in this wave)
- 561 admin bodies under `src/pages/admin/**` continue to drain via Rule 30 monotone-decrease ratchet (multi-week Wave G)
- `src/admin/pages/<domain>/index.ts` barrels still re-export from `@/pages/admin/` — flip when admin migration completes
