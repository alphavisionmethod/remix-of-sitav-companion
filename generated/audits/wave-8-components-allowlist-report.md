# Wave 8 — Components Allowlist Validator Report

**Generated:** 2026-04-25
**Status:** ✅ STRICT validator passes — wired into the Deployment Readiness Gate as a blocking CI step.

## What Wave 8 added

1. **`scripts/architecture/check-components-allowlist.ts`** — a STRICT validator enforcing Repository Constitution Rules 13–18:
   - Top-level loose files: only `NavLink.tsx` is permitted.
   - Frozen subtrees (`business/`, `admin/`, `sita/`, `personal-brain/`, `advisors/`, `ai/`, …) may contain ONLY Wave-7 thin adapters.
   - Adapter ceiling: 12 logical lines.
   - Adapter targets must be `@/modules/*` or `@/platform/*` (no relative paths, no shadow re-routes).
   - Allowlisted shared subtrees: `ui/`, `primitives/`, `shared/`, `cards/`, `navigation/`, `launcher/`, `__tests__/`.

2. **CI gate (BLOCKING)** — added to `.github/workflows/deployment-readiness-gate.yml` immediately after the pages thin-adapter check:
   ```yaml
   - name: Repo canonicalization — components allowlist (REQUIRED post-Wave 8)
     run: npx tsx scripts/architecture/check-components-allowlist.ts --strict
   ```

3. **Constitution amendments** — added Rules 17 and 18 covering the validator contract and shared-subtree allowlist.

## Misplacement scan

| Surface | Files scanned | Violations |
|---|---:|---:|
| Top-level `src/components/*.tsx` | 1 (`NavLink.tsx`) | 0 |
| Frozen subtrees (40 directories) | 1,144 adapters | 0 |
| Shared barrels (`shared/ai`, `shared/sita`, `shared/status`, `cards`, `navigation`) | 5 barrels | 0 (all re-export through canonical paths) |
| Total | **1,150** | **0** |

### Deep-scan of allowlisted shared trees

- `src/components/shared/FileUploadZone.tsx` — genuinely shared. ✅
- `src/components/shared/ai/index.ts` — barrel re-exporting `@/components/ai/*` (which adapts to `@/platform/ai/components/ai/*`). ✅
- `src/components/shared/sita/index.ts` — barrel re-exporting `@/components/sita/*` (adapts to `@/platform/sita/components/sita/*`). ✅
- `src/components/shared/status/index.ts` — barrel re-exporting `@/components/cloud/PlatformDegradedBanner` (adapts to `@/platform/cloud/components/cloud/PlatformDegradedBanner`). ✅
- `src/components/cards/index.ts` — barrel for the 10 canonical card primitives (re-routes through Sita adapters). ✅
- `src/components/navigation/index.ts` — barrel exposing `NavLink`. ✅
- `src/components/launcher/PillarRail.tsx` — shell launcher concern, only one file, used in 1 location; left in shared per Component Constitution since it composes only `@/components/ui/*` primitives. ✅
- `src/components/__tests__/` — Vitest tests for shared primitives. ✅

## Verification

```
$ npx tsx scripts/architecture/check-components-allowlist.ts --strict
════════════════════════════════════════════════════════════
Wave 8 — Components Allowlist Check (STRICT)
════════════════════════════════════════════════════════════
Violations: 0
(exit 0)
```

## Drift protection (going forward)

Once this PR lands, ANY of the following will fail CI:

- Adding a new authored `.tsx` file to `src/components/business/`, `src/components/admin/`, etc. — the file MUST live under `src/modules/<pillar>/components/...` or `src/platform/<system>/components/...`, with the legacy path being a Wave-7 adapter (or omitted entirely).
- Editing a Wave-7 adapter to inline real code.
- Pointing an adapter at a non-canonical path (e.g., `from "@/legacy/foo"`).
- Creating a brand-new top-level subtree under `src/components/` without amending `SHARED_ALLOWLIST` (which itself requires an ADR per the Constitution's Amendment Process).

## Next step

**Wave 9** (compatibility wrapper sunset): scan call sites using legacy `@/components/<sub>/*` imports, log usage in two consecutive CI runs, and once usage drops to zero, delete the Wave-7 adapter shells outright. The validator already enforces the *shape* of those adapters; Wave 9 retires them.
