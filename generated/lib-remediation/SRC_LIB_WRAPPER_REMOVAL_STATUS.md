# SRC_LIB Wrapper Removal Status

_Last updated: Wave 6a complete_

## Summary

| Metric | Wave 4 End | Wave 5 (Aborted) | Wave 6a End |
|---|---|---|---|
| Wrappers remaining | 188 | 188 (restored) | **129** |
| TS errors | 0 | 0 (after restore) | **0** |
| Net wrappers removed | 0 | 0 | **59** |

## Wave 6a — Engines Folder Migration ✅

**Strategy:** Per-folder physical migration (not bulk static deletion).

**Steps executed:**
1. Verified `src/domains/engines/` had 58 canonical implementation files (all 57 wrappers' siblings + index).
2. Promoted `src/domains/engines/index.ts` from a 13-export partial barrel to a complete 50+ export barrel matching the legacy `src/lib/engines/index.ts`.
3. Rewired 4 stale consumers:
   - `src/lib/hooks/useOSRuntime.tsx` (2 imports)
   - `src/test/engines.test.ts`
   - `src/lib/hooks/use-meta-governance.ts` (2 imports)
   - `src/lib/services/meta-governance/collector.service.ts`
   - `src/components/sita/OSSetupExperience.tsx` (dynamic import)
4. Deleted entire `src/lib/engines/` directory (57 wrapper files + index.ts + shared/ folder = 59 files).
5. Verified `tsc --noEmit` returns 0 errors.

**Outcome:** Engines are now exclusively under `src/domains/engines/` with a complete public barrel. No legacy `@/lib/engines/*` import paths remain.

## Wave 5 (Aborted) — Lessons Learned

Static text-scan-based bulk removal failed twice (~346 and ~90 errors respectively) because:
- Dynamic imports (`await import("@/lib/...")`) were missed.
- Templated path strings escaped the regex.
- Internal `src/lib/` consumers required full repo scan.

**Resolution:** Adopted per-folder migration with explicit consumer audit, used successfully in Wave 6a.

## Next Targets (Wave 6b/6c)

| Folder | Wrappers | External Consumers | Risk |
|---|---|---|---|
| `src/lib/persistence/` | 15 | 146 | Medium (high consumer count, needs systematic rewire) |
| `src/lib/customer-journey/` | 9 | TBD | Low–Medium |
| `src/lib/data-services/` | 21 | TBD | Medium |
| `src/lib/demo-data/` | 30 | TBD | Low (demo only) |

Each will follow the Wave 6a pattern: barrel completion → consumer rewire → folder deletion → tsc verification.
