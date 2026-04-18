# SITA OS — Wave 5 Wrapper Removal Status (Revised)

Generated: 2026-04-18

## Outcome: 0 wrappers removed (safety-preserved)

Wave 5 attempted bulk removal of wrappers with zero detected consumers. **Two sequential passes (5a + 5b) both broke the build.** Each time the wrappers were restored from sibling-file canonical matches, returning the build to green (0 TS errors).

## Why removal was unsafe

The static-text consumer scan (literal `"@/lib/<path>"` match across all of `src/`) does **not** detect:

- Dynamic imports built from templated path strings.
- Re-exports through barrel files that compose the import path at build time.
- Path resolution chains routed through Vite plugins or tsconfig path aliases other than `@/`.
- Test fixtures and storybook autoloads.

The 160 wrappers Wave 5b "removed" turned out to be referenced by ≥90 consumers via paths the scan didn't recognize. Restoring all 160 from sibling canonical matches returned the build to clean.

## Final Wave 5 ledger

| Pass | Wrappers removed | Build errors after | Action |
|---|---|---|---|
| 5a (excluded src/lib from scan) | 176 | 346 | Restored from siblings (fallback to `core-services` ↔ `services` swap). |
| 5b (full repo scan) | 160 | 90 | Restored from siblings. |
| **Net Wave 5** | **0** | **0** | All wrappers retained; build green. |

## Implications for the canonical ownership model

Wrappers cannot be removed by static analysis alone. **A safe removal pass requires either:**

1. **AST-based import resolution** (e.g., ts-morph) that resolves dynamic imports and barrel re-exports.
2. **Build-time tree-shake telemetry**: instrument Vite/Rollup output to record which `@/lib/*` paths are actually emitted, and treat anything missing as truly dead.
3. **Manual per-folder audits** as folders are physically migrated to canonical homes — at which point each wrapper's removal is gated on the folder's own migration sign-off.

Approach 3 is the safest and aligns with the existing wave-by-wave migration cadence. Wave 5's attempt to bulk-remove wrappers without folder migration was the wrong abstraction.

## Wave 5 deliverables that DID succeed

- `scripts/architecture/wave5b-remove-zero-consumer-wrappers.ts` — the corrected scan (kept for forensic reference).
- This report documenting why bulk removal is unsafe.
- Build remains green at 0 TS errors.

## Recommended Wave 6 path

Skip bulk wrapper removal. Instead:

1. Pick **one** physical folder (e.g., `src/lib/persistence/` → `src/data/persistence/`).
2. Move all files; update wrappers to point at the new canonical home.
3. Run the consumer rewire wave for that folder only.
4. Once all consumers point at the new canonical, delete the wrappers for that folder specifically.
5. Repeat for one folder per wave.

This preserves build safety wave-over-wave and avoids the failure mode Wave 5 hit.
