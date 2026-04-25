# Wave 0.7 — Semantic Route-Adapter Hardening Report

**Status:** ✅ Installed (foundation-tier, BLOCKING).
**Authority:** Constitution Rules 33–35.
**Date sealed:** Wave 0.7.
**Companion model:** [`docs/architecture/ROUTE_ADAPTER_SEMANTIC_MODEL.md`](../../docs/architecture/ROUTE_ADAPTER_SEMANTIC_MODEL.md)

## 1. The loophole this wave closes

Before Wave 0.7 the rule for `src/pages/**` was **purely syntactic** (Rule 7: `≤40 logical lines OR pure re-export`, scoped to 8 pillar dirs). A 30-line file importing `useQuery` and calling `supabase.from(...)` passed the check while still owning canonical data flow. The line-count rule could not distinguish a true adapter from a compact-but-violating page body.

## 2. The new contract (Rule 33)

Every `src/pages/**/*.{ts,tsx}` (excluding `__tests__/`) MUST belong to **exactly one** of six adapter subtypes:

| # | Subtype | Detection |
|---|---|---|
| 1 | `pure-reexport` | All non-comment lines are `export … from "@/…"` |
| 2 | `lazy` | `lazy(() => import("@/…"))` |
| 3 | `redirect` | `useNavigate` / `<Navigate>` w/o params |
| 4 | `param-translate` | `useParams` / `useSearchParams` + `useNavigate` |
| 5 | `shell-mount` | Wraps canonical page in `<MobileShell>` / `<AppFrame>` / etc. |
| 6 | `event-dispatch` | `window.dispatchEvent("sita-open-…")` + `navigate("/desktop")` |

Universally forbidden: `supabase.*`, `useQuery` / `useMutation` / `useInfiniteQuery` / `useSuspenseQuery`, `useState` / `useReducer` for canonical state, trust/approval/persistence logic, business-rule branching that owns a concept.

## 3. Wave 0.7 baseline (sealed)

- **Total `src/pages/**` files scanned:** 1,098 (excluding 50 test files).
- **Legacy violations baselined:** **550** (decrease-only ratchet — Rule 34).
- **Subtype distribution:**
  - `pure-reexport`: 511
  - `shell-mount`: 14
  - `lazy`: 11
  - `redirect`: 11
  - `param-translate`: 1
  - `event-dispatch`: 0
  - `legacy-violation`: 550
- **Violation breakdown by directory:**
  - `src/pages/admin/`: 534
  - `src/pages/mobile/`: 12
  - `src/pages/owner-mode/`: 1
  - `src/pages/business-advisors/`: 2
  - root (`src/pages/NotFound.tsx`): 1

## 4. Validators installed (BLOCKING, foundation-tier)

| Validator | Purpose | Rule |
|---|---|---|
| `scripts/architecture/check-page-semantic-adapter.ts` | Monotone ratchet on legacy-violation count + forbidden API detection | 33 / 34 |
| `scripts/architecture/check-page-adapter-subtype-declaration.ts` | When `// @route-adapter:` directive present, declared subtype must match detected | 35 |

Both are wired into `.github/workflows/foundation-gate.yml` and registered in `src/lib/ci/validator-gate-map.ts` as `block` / `release-readiness`.

## 5. Constitution rules added

- **Rule 33** — Semantic route-adapter contract (six subtypes; forbidden APIs).
- **Rule 34** — Page semantic violation ratchet (550 → decrease-only).
- **Rule 35** — Adapter subtype declaration (`// @route-adapter:` directive consistency).

## 6. Existing rule reinforced

- **Rule 7** — `check-pages-thin-adapter.ts` expanded from 8 pillar dirs to **all 33 page subdirs** (admin, mobile, owner, atlas, marketing, etc.). Runs as a syntactic complement to the new semantic enforcement.

## 7. Foundation index changes

| Manifest | Action | Rule |
|---|---|---|
| `route-adapter-semantic-map.json` | Created (TTL 30d) | 33 |
| `page-semantic-violation-baseline.json` | Sealed | 34 |
| `page-semantic-violation-report.json` | Per-run | 33–34 |

Foundation-tier validator count: 18 → 20.

## 8. What this wave does NOT do (deferred)

- **No physical file moves.** Wave 10 attestation seal preserved.
- **No bulk relocation** of the 550 legacy violators — gated by the future Page Body Relocation Wave (Rules 19, 24).
- **No removal of Rule 7.** The line-count rule and the new semantic rule are complementary.

## 9. Verification

| Check | Result |
|---|---|
| `tsx scripts/manifests/generate/generate-route-adapter-semantic-map.ts` | ✅ 1,098 files classified, 550 violations |
| `tsx scripts/architecture/check-page-semantic-adapter.ts` | ✅ ratchet at baseline |
| `tsx scripts/architecture/check-page-adapter-subtype-declaration.ts` | ✅ 0 declarations, 0 mismatches |
| Wave 10 attestation digest | ✅ unchanged |

## 10. Future-facing work

1. **Page Body Relocation Wave** — drain the 550 legacy violators by moving each to its canonical home (`@/admin/**`, `@/modules/**`, `@/platform/**`) and reducing the `src/pages/**` file to one of the six subtypes. Each batch updates the ratchet baseline downward.
2. **Re-classify after relocation:** for each moved file, the wrapper inherits the canonical adapter subtype declaration (`// @route-adapter: pure-reexport`).
3. **Eventual goal:** legacy-violation count = 0; the entire `src/pages/**` tree is provably semantic-clean.
