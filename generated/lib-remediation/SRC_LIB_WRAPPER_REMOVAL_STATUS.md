# SRC_LIB Wrapper Removal Status

_Last updated: Wave 6b complete_

## Cumulative Summary

| Metric | Wave 4 End | Wave 5 (Aborted) | Wave 6a End | Wave 6b End |
|---|---|---|---|---|
| Wrappers remaining | 188 | 188 (restored) | 129 | **114** |
| TS errors | 0 | 0 (after restore) | 0 | **0** |
| Net wrappers removed | 0 | 0 | 59 | **74** |
| `src/lib` top-level entries | 103 | 103 | 102 | **101** |
| Total `src/lib` files | 1767 | 1767 | 1707 | **1687** |

## Wave 6b — Persistence Folder Migration ✅

**Folder:** `src/lib/persistence/` → `src/data/persistence/`

**Steps executed:**
1. Verified canonical destination has all 15 wrapper siblings + 2 extras (`offline-db.ts`, `storage-topology-registry.ts`).
2. Bulk-rewrote 142 consumer files using sed: `@/lib/persistence/X` → `@/data/persistence/X` (both single and double quoted forms).
3. Fixed 2 dynamic imports in `src/lib/hooks/useOSRuntime.tsx` (different quoting pattern).
4. Added legacy alias to canonical barrel: `export { getMemoryStats as getScopedMemoryStats }` to preserve API used by 4 admin pages.
5. Deleted entire `src/lib/persistence/` directory (15 wrappers + index + tests = 17+ files).
6. Verified `tsc --noEmit` returns 0 errors.

**Outcome:** 0 legacy `@/lib/persistence/*` imports remain. Persistence layer is now exclusively under `src/data/persistence/`.

## Wave 6a — Engines Folder Migration ✅

**Folder:** `src/lib/engines/` → `src/domains/engines/`

- Promoted partial 13-export barrel to complete 50+ export barrel.
- Rewired 5 consumer files (1 component, 2 hooks, 1 service, 1 test).
- Deleted 59 wrapper files atomically.

## Verified Pattern (Wave 6 success formula)

1. **Audit** canonical destination has ALL needed files
2. **Promote** canonical barrel to be export-complete (preserve aliases)
3. **Bulk rewire** consumers via sed (both quote styles)
4. **Hunt dynamic imports** (`import("@/lib/...")` patterns)
5. **Delete** folder atomically
6. **Verify** `tsc --noEmit` → 0 errors immediately

## Next Targets (Wave 6c+)

| Folder | Wrappers | External Consumers | Risk | Strategy |
|---|---|---|---|---|
| `src/lib/customer-journey/` | 9 | TBD | Low | Wave 6 pattern |
| `src/lib/data-services/` | 21 | TBD | Medium | Wave 6 pattern |
| `src/lib/demo-data/` | 30 | TBD | Low | Wave 6 pattern |
| `src/lib/cloud-backbone/` | ~10 | TBD | Medium | Wave 6 pattern |
| `src/lib/design-system/` | 5 | TBD | Low | Wave 6 pattern |

Each will follow the proven Wave 6 pattern: barrel completion → consumer rewire → folder deletion → tsc verification.
