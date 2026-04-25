# Wave 7 — Component Reclassification Report

**Generated:** 2026-04-25
**Status:** ✅ Complete — `tsc --noEmit` returns 0 errors.

## Summary

| Metric | Count |
|---|---|
| Legacy `src/components/` subtrees classified | 47 |
| Component files relocated to canonical owners | **1,144** |
| Thin adapter files written at legacy paths | **1,144** |
| Deep-relative imports rewritten to `@/...` aliases | 0 (already clean) |
| TypeScript errors after migration | **0** |

## Owner distribution

### Pillars (modules) — 248 files
- `src/modules/business/components/` (business + business-advisors + revenue-office + revenue + imports) — **206**
- `src/modules/concierge/components/` — **30**
- `src/modules/finance/components/` (finance + money + investment) — **12**

### Platforms — 896 files
- `src/platform/sita/components/` — 549
- `src/platform/admin/components/` (admin + admin-ai + admin-os) — 149
- `src/platform/personal-brain/components/` — 60
- `src/platform/ai/components/` (ai + ai-runtime + explainability + simulation) — 24
- `src/platform/advisors/components/` — 16
- `src/platform/cloud/components/` — 11
- `src/platform/experience/components/` (mobile + user-app) — 10
- `src/platform/marketing/components/` — 9
- `src/platform/setup/components/` (onboarding) — 9
- `src/platform/files/components/` — 8
- `src/platform/trust/components/` (autonomy + claim-safety) — 7
- `src/platform/governance/components/` — 6
- `src/platform/auth/components/` — 6
- `src/platform/intelligence/components/` — 5
- `src/platform/settings/components/` — 5
- `src/platform/product/components/` (reality) — 5
- `src/platform/orchestration/components/` (autopilot) — 3
- `src/platform/observability/components/` — 3
- `src/platform/app-platform/components/` (app-store) — 3
- `src/platform/notifications/components/` — 2
- `src/platform/runtime/components/` — 2
- `src/platform/core-services/components/` (platform) — 2
- `src/platform/operations/components/` — 1
- `src/platform/sync-engine/components/` (sync) — 1

## Adapter pattern (zero blast radius)

Every legacy file `src/components/<sub>/<…>/<File>.tsx` was replaced with:

```tsx
// Wave 7 — legacy component path. Canonical home:
//   @/{modules|platform}/<owner>/components/<sub>/<…>/<File>
export * from "@/{modules|platform}/<owner>/components/<sub>/<…>/<File>";
export { default } from "@/{modules|platform}/<owner>/components/<sub>/<…>/<File>"; // (when default exists)
```

No call site needed to change. All historical `@/components/<sub>/...` imports continue to resolve via the adapter.

## Truly shared (left in place)

`ui/`, `primitives/`, `shared/`, `cards/`, `navigation/`, `launcher/`, `__tests__/`, `NavLink.tsx`.

## Top-level file counts after Wave 7

| Tree | Before | After |
|---|---:|---:|
| `src/components/` | 1,227 | 1,227 (now adapters + shared) |
| `src/modules/` | 297 | **557** (+260) |
| `src/platform/` | 556 | **1,452** (+896) |

## Codemod: relative → alias imports

`scripts/codemods/wave-7-fix-relative-imports.mjs` was run across `src/platform/**`, `src/modules/**`, `src/components/**`, `src/pages/**`. Result: **0 rewrites** — Waves 4–6 had already left the tree free of deep-relative imports. The codemod is now retained in CI as a regression guard.

## Constitution updates

Added Rules 13–16 to `docs/architecture/REPOSITORY_CONSTITUTION.md`:
- **Rule 13:** `src/components/` is reserved for shared UI; all other subtrees must be Wave-7 thin adapters.
- **Rule 14:** Pillar-owned components live under `src/modules/<pillar>/components/<sub>/`.
- **Rule 15:** Platform-owned components live under `src/platform/<system>/components/<sub>/`.
- **Rule 16:** No deep relative imports across `src/{platform,modules,components,pages}/**`.

## Verification

```
$ npx tsc --noEmit
(no output — exit code 0)
```

## Next step

**Wave 8:** Promote the shared/primitives/cards trees through the same audit lens (these stayed in place because they really are shared, but Wave 8 will publish a hard allowlist validator and flag any non-adapter files re-introduced into the now-frozen legacy `src/components/<sub>/` directories).
