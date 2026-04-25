# Fix: TS2307 on `NeedsHistoricalReleasesExplainer` & `NeedsTimeWindowExplainer` shims

## Diagnosis

The TypeScript errors are **stale module-resolution cache**, not a real code defect:

| Check | Result |
|---|---|
| Canonical files exist on disk | ✅ `src/platform/sita/components/sita/explainers/NeedsHistoricalReleasesExplainer.tsx` & `NeedsTimeWindowExplainer.tsx` both present |
| Canonical files export `{ NamedExport, default, Props }` | ✅ All three exports present in each file |
| Shim import paths match canonical file paths exactly | ✅ Verified character-for-character |
| Sibling shim `NeedsDataExplainer.tsx` (identical pattern) | ✅ Compiles cleanly — proves the pattern is correct |
| Canonical barrel `index.ts` re-exports all three | ✅ Confirmed |

The two failing shims and their canonical targets were written in the same Wave 1.1 batch as `NeedsDataExplainer` (which works). The TS language service has cached "module not found" for the two longer-named files and has not re-resolved them after the writes landed.

## Fix (minimal, zero behavior change)

Rewrite the two shim files **with identical content** to force the file-watcher to re-resolve the import paths. No logic change, no API change, no UI change — only a cache bust.

### File 1: `src/components/primitives/feedback/NeedsHistoricalReleasesExplainer.tsx`
Re-emit the exact same 3-line shim (deprecation comment + `export` + `export type`).

### File 2: `src/components/primitives/feedback/NeedsTimeWindowExplainer.tsx`
Re-emit the exact same 3-line shim (deprecation comment + `export` + `export type`).

## Verification

After the rewrites:
1. `tsc --noEmit` should report **0 errors** (the only outstanding errors are these 4 TS2307s on these 2 files).
2. No consumer file changes — Wave 1.1 already rewired all `src/pages/**` and `src/modules/**` consumers to canonical paths.
3. Wave 10 attestation seal is **not affected** — shim file *contents* are byte-identical, so the digest over `src/components` is unchanged.
4. Shared-component zero-violation baseline (`shared-component-semantic-violation-baseline.json` → `baselineCount: 0`) remains valid.

## What this fix does NOT do

- ❌ Does not change exports, types, or runtime behavior
- ❌ Does not move any files
- ❌ Does not touch consumers, tests, manifests, or workflows
- ❌ Does not require attestation re-seal
- ❌ Does not require running any generator script

This is a pure cache-invalidation rewrite of two 3-line shim files — the smallest possible safe surgical fix.
