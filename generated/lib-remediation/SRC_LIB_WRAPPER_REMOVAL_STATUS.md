# SRC_LIB Wrapper Removal Status

_Last updated: Wave 8 complete — runtime layer fully migrated to canonical home_

## Cumulative Summary

| Metric | Wave 6g End | Wave 7 End | **Wave 8 End** |
|---|---|---|---|
| `@lovable:migrated-wrapper` files | 113 | 0 | **0** |
| TS errors | 0 | 0 | **0** |
| Vite build | (untested) | ✅ 57s | **✅ 53s** |
| `src/lib` top-level entries | 89 | 97 | **96** |
| `src/lib` total files | 1572 | 1591 | **1528** |
| `src/hooks` total files | ~169 | 178 | **178** |
| `src/runtimes` total files | 8 | 8 | **73** |

## Wave 8 — Runtime Folder Promotion ✅

**Folder:** `src/lib/runtime/` → `src/runtimes/`

### Steps Executed
1. **Conflict scan:** Verified zero file-level conflicts between source and destination (only barrel `index.ts` files coincided — handled separately).
2. **Physical migration:** Moved all 63 files preserving subfolder structure (`appliance/`, `appliance/release/`, `backend/release/`, `desktop/`, `desktop/release/`, `probes/`, `simulation/`, `web/`).
3. **Root barrel rename:** `src/lib/runtime/index.ts` had no `src/runtimes/index.ts` peer to merge with, so it was relocated to `src/runtimes/runtime-index.ts` (zero consumers, safe rename).
4. **Bulk rewire:** 27 consumer files updated from `@/lib/runtime/` → `@/runtimes/` via single sed pass.
5. **Folder deletion:** `src/lib/runtime/` removed atomically.
6. **Self-healing facades:** Existing `src/runtimes/desktop/index.ts` and `src/runtimes/appliance/index.ts` barrel facades that previously forwarded to `@/lib/runtime/desktop/*` were automatically rewired by the same sed pass, making them self-contained against their new local siblings.

### Verification

```
$ npx tsc --noEmit          → 0 errors
$ npx vite build            → ✅ built in 52.80s
$ grep -rn "@/lib/runtime" src → 0 import statements (1 comment-only reference in moved barrel)
```

## Architectural Position

The runtime layer (boot, host contracts, capability matrices, deployment profiles, release readiness probes, runtime detection) is now fully co-located under `src/runtimes/` per the **5-Plane Model** (Layer A: Core OS / Layer B: Shell Runtime). This eliminates the legacy `@/lib/runtime/*` deep-import path and aligns with the canonical-ownership model in `SRC_LIB_CANONICAL_OWNERSHIP_FINAL.md`.

`src/runtimes/` now contains 73 files spanning 8 subfolders, fully replacing the 63-file `src/lib/runtime/` plus the 8 existing facade barrels.

## Next Phase Targets (priority order)

| Folder | Files | Destination | Risk | Strategy |
|---|---|---|---|---|
| `src/lib/architecture/` | 47 | `src/platform/architecture/` | Low | Wave 8 pattern (physical promotion + bulk sed) |
| `src/lib/sync-engine/` | 38 | `src/platform/sync-engine/` | Low | Wave 8 pattern |
| `src/lib/orchestration/` | 47 | `src/platform/orchestration/` | Medium | Preserve canonical-spine layering |
| `src/lib/nova-sdk/` | 55 | Confirm full migration to `@/platform/nova-sdk/` | Medium | Audit + collapse |
| `src/lib/services/` + `src/lib/core-services/` | 703 | Multi-wave audit; collapse to ~45 canonical services | High | Service-by-service truth audit |

Each subsequent wave will follow the **proven Wave 7+8 pattern**:
1. Conflict scan (file-level, not barrel-level).
2. Physical promotion of all files preserving subfolder structure.
3. Bulk sed rewire across `src/**/*.{ts,tsx}` for both quote styles.
4. Restore minimal forwarder stubs only when external barrels demand them (no `@lovable:migrated-wrapper` marker).
5. Verify with both `tsc --noEmit` AND `vite build` (Vite catches what tsc misses).
