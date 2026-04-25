# Wave 0.9 — Concept-Based Shared Component Hardening Report

**Generated:** 2026-04-25
**Status:** ✅ Foundation enforcement substrate installed.
**Constitution rules added:** 36, 37, 38.
**Validator (BLOCKING):** `scripts/architecture/check-shared-component-concept-rule.ts`
**Model doc:** `docs/architecture/SHARED_COMPONENT_OWNERSHIP_MODEL.md`

## 1. Old heuristic problem

Constitution Rule 13 said `src/components/**` is for "shared UI used by ≥2 pillars." This usage-count rule is structurally simple but semantically wrong:

- A genuinely generic component used today in only one pillar is denied a shared home.
- A pillar/platform/admin-semantic component used in two pillars by accident is granted a shared home and silently becomes a hidden owner.
- Wave 8's allowlist enforces *which subtrees* exist, not *which files inside those subtrees* are conceptually shared.

## 2. New concept-based ownership model

A file may live under `src/components/**` only if it passes all three tests:

1. **Vocabulary** — name/props/types/JSX/className contain no pillar word, platform-subsystem word, admin/operator word, or operator-only phrase.
2. **Dependency** — no imports from `@/modules/**`, `@/platform/**`, `@/admin/**`, `@/pages/**`.
3. **Portability** — renders given only props + shadcn `ui/` + `cn()`; no shell singletons; no hardcoded pillar IDs.

## 3. Classification results (32 files scanned)

| Bucket | Count |
|---|---:|
| `shared-clean` ✅ | 19 |
| `barrel-only-reexport` | 5 |
| `wrapper-with-platform-import` | 3 |
| `platform-semantic` | 2 |
| `shell-runtime-semantic` | 1 |
| `admin-semantic` | 1 |
| `deprecated-shim` | 1 |
| **Violators (baselined)** | **12** |

## 4. Sealed baseline (12 grandfathered violators)

| File | Class | Target owner |
|---|---|---|
| `src/components/cards/index.ts` | barrel-only-reexport | `@/platform/sita/components/sita/cards/index.ts` |
| `src/components/launcher/PillarRail.tsx` | shell-runtime-semantic | `@/platform/sita/components/sita/shell/` |
| `src/components/primitives/actions/EvidenceLink.tsx` | platform-semantic | `@/platform/sita/components/sita/` |
| `src/components/primitives/actions/OperatorActionPanel.tsx` | admin-semantic | `@/admin/modules/<domain>/components/` |
| `src/components/primitives/feedback/EmptyState.tsx` | barrel-only-reexport | `@/platform/sita/components/sita/index.ts` |
| `src/components/primitives/feedback/NeedsDataExplainer.tsx` | wrapper-with-platform-import | `@/platform/sita/components/sita/` |
| `src/components/primitives/feedback/NeedsHistoricalReleasesExplainer.tsx` | wrapper-with-platform-import | `@/platform/sita/components/sita/` |
| `src/components/primitives/feedback/NeedsTimeWindowExplainer.tsx` | wrapper-with-platform-import | `@/platform/sita/components/sita/` |
| `src/components/primitives/status/ConnectorStateBadge.tsx` | platform-semantic | `@/platform/<system>/components/` |
| `src/components/shared/ai/index.ts` | barrel-only-reexport | `@/platform/ai/components/ai/index.ts` |
| `src/components/shared/sita/index.ts` | barrel-only-reexport | `@/platform/sita/components/sita/index.ts` |
| `src/components/shared/status/index.ts` | barrel-only-reexport | `@/platform/cloud/components/cloud/index.ts` |

Drained by the future Shared Component Relocation Wave (gated by Rules 19, 24).

## 5. Constitution amendments

- **Rule 36** — Concept-based shared component rule (BLOCKING).
- **Rule 37** — Shared-semantic violation ratchet (monotone-decreasing).
- **Rule 38** — Shared-component import direction.

## 6. Validator + CI wiring

- New manifest generator: `scripts/manifests/generate/generate-shared-component-ownership-map.ts`.
- New BLOCKING validator: `scripts/architecture/check-shared-component-concept-rule.ts` (+ `checks/` alias).
- Registered in `src/lib/ci/validator-gate-map.ts` as `block` / `release-readiness`.
- Wired into `.github/workflows/foundation-gate.yml` as a required step.
- Two new entries added to `generated/manifests/foundation-manifest-index.json` (now 23 manifests; 21 foundation-tier validators).
- Regenerated `generated/validator-gate-map.json` (240 validators, 100% coverage).

## 7. Verification (executed)

| Step | Result |
|---|---|
| `generate-shared-component-ownership-map.ts` | ✅ 32 scanned, 19 clean, 12 violators |
| `check-shared-component-concept-rule.ts` (strict) | ✅ GREEN (live=12, baseline=12, ratchet delta=0, regressions=0) |
| `generate-foundation-manifest-index.ts` | ✅ 23 entries, 23 present |
| `generate-validator-gate-map.ts` | ✅ 240 validators, coverage 100% |
| Wave 10 attestation seal | ✅ preserved (no source code touched) |

## 8. What this wave intentionally does NOT do

- No bulk file moves (preserves Wave 10 attestation seal).
- No deletion of existing barrels.
- No change to the PRIMITIVE/DOMAIN/SURFACE 3-class model (orthogonal).
- No new validator framework — built on the foundation tier installed in Waves 0/0.5/0.6/0.7.

## 9. Future-facing work

- A future Shared Component Relocation Wave will physically move the 12 baselined violators to their canonical owners. That wave is ADR-gated and requires a Rule 19 re-seal.