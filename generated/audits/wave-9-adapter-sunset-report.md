# Wave 9 — Legacy Component Adapter Sunset

**Date**: 2026-04-25
**Status**: ✅ Complete

## Summary

The Wave-7 thin re-export adapters under `src/components/<frozen-sub>/*`
have been **fully sunset**. Every file consumer was migrated to its
canonical `@/modules/*` or `@/platform/*` path, and the now-orphaned
adapter shells were deleted.

## Metrics

| Metric | Value |
| --- | --- |
| Frozen adapter files at start | 1,144 |
| Initial zero-consumer adapters | 495 |
| Initial in-use adapters | 649 |
| File-level imports rewritten (pass 1) | 2,808 across 1,056 files |
| Directory-style imports rewritten (pass 2) | 161 across 109 files |
| Adapters deleted | 1,144 |
| Files remaining in `src/components/` | 83 (shared only) |
| TypeScript errors | 0 |
| Vite production build | ✅ PASS (62 s) |
| Components allowlist (strict) | ✅ 0 violations |

## Preserved Subtrees

The following shared subtrees remain authored under `src/components/`:

- `ui/` — shadcn-derived primitives
- `primitives/` — universal building blocks (actions, display, feedback, overlays, status, timelines)
- `shared/` — cross-cutting helpers (`ai/`, `sita/`, `status/`)
- `cards/`, `navigation/`, `launcher/`, `__tests__/`
- Root file: `NavLink.tsx`

## Codemods

1. **`/tmp/wave9-inventory.mjs`** — inventory & consumer count
2. **`/tmp/wave9-rewrite.mjs`** — file-level alias rewrite (2,808 imports)
3. **`/tmp/wave9-dir-rewrite.mjs`** — directory-barrel rewrite (161 imports)
4. **`/tmp/wave9-delete.mjs`** — orphan adapter deletion (1,144 files)

## Reports

- `generated/audits/wave-9-adapter-sunset-inventory.json`
- `generated/audits/wave-9-consumer-rewrite.json`
- `generated/audits/wave-9-directory-import-rewrite.json`
- `generated/audits/wave-9-adapter-sunset-deletion.json`

## Deployment Readiness

- ✅ `npx tsc --noEmit` — 0 errors
- ✅ `npx vite build` — production bundle generated
- ✅ `check-components-allowlist.ts --strict` — 0 violations
- ✅ Baseline updated: `lastWaveCompleted: 9`
- ✅ Repository Constitution Rule 19 (added below) enforced by CI

The Repository Tree Canonicalization initiative (Waves 1–9) is now
architecturally **closed**. All future component code must live in
`src/modules/<pillar>/components/` or `src/platform/<system>/components/`
from inception — no legacy adapter surface remains.