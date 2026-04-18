# SRC_LIB Wrapper Removal Status

_Last updated: Wave 6e complete_

## Cumulative Summary

| Metric | Wave 4 End | Wave 5 (Aborted) | Wave 6a | Wave 6b | Wave 6c | Wave 6d | Wave 6e |
|---|---|---|---|---|---|---|---|
| Wrappers remaining | 188 | 188 | 129 | 114 | 114 | 81 | **45** |
| TS errors | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Net wrappers removed | 0 | 0 | 59 | 74 | 83 | 116 | **143** |
| `src/lib` top-level entries | 103 | 103 | 102 | 101 | 100 | 99 | **98** |
| Total `src/lib` files | 1767 | 1767 | 1707 | 1687 | 1678 | 1645 | **1616** |

## Wave 6e — demo-data Folder Migration ✅

**Folder:** `src/lib/demo-data/` → `src/data/seed/`

**Steps executed:**
1. Identified that `src/lib/demo-data/index.ts` contained the **real source** of demo constants (DEMO_INBOX_ITEMS, DEMO_AUTOMATION_RULES, DEMO_ACTIVITY_TIMELINE, DEMO_DELEGATIONS, DEMO_FILE_ITEMS, DEMO_SEARCH_ITEMS …) plus `packs.ts` had no canonical sibling.
2. Physically copied `index.ts` (149 lines) and `packs.ts` (6 lines) into `src/data/seed/`, replacing stub barrels.
3. Bulk-rewrote 5 consumers using sed in two passes (`@/lib/demo-data/packs` first, then `@/lib/demo-data`):
   - `src/pages/AutomationCenter.tsx`
   - `src/pages/InboxCapture.tsx`
   - `src/pages/owner/PackEditor.tsx`
   - `src/pages/ActivityStream.tsx`
   - `src/planes/internal-tools.ts`
4. Deleted entire `src/lib/demo-data/` directory (30 files).
5. Verified `tsc --noEmit` returns 0 errors.

**Outcome:** Demo seed data now lives canonically under `src/data/seed/` — no more dual-source ambiguity.

## Wave 6d — data-services Folder Migration ✅

**Folder:** `src/lib/data-services/` → `src/data/repositories/`

- Promoted stub `src/data/repositories/index.ts` to a complete 32-export barrel.
- Simplified `src/data/index.ts` to a single `export * from "@/data/repositories"`.
- Rewired 2 active external consumers (1 test mock file, 1 service).
- Deleted 33 wrapper files (32 services + index.ts).

## Wave 6c — customer-journey Folder Migration ✅

**Folder:** `src/lib/customer-journey/` → `src/domains/customer-journey/`

- Audit revealed **0 active consumers** of `@/lib/customer-journey` (all 24 consumers already on `@/domains/customer-journey`).
- Pure wrapper deletion: 9 files removed atomically with no rewire required.

## Wave 6b — Persistence Folder Migration ✅

**Folder:** `src/lib/persistence/` → `src/data/persistence/`

- Bulk-rewrote 142 consumer files; added `getScopedMemoryStats` legacy alias to canonical barrel.
- Deleted 17 files; verified tsc.

## Wave 6a — Engines Folder Migration ✅

**Folder:** `src/lib/engines/` → `src/domains/engines/`

- Promoted partial 13-export barrel to complete 50+ export barrel.
- Rewired 5 consumer files (1 component, 2 hooks, 1 service, 1 test).
- Deleted 59 wrapper files atomically.

## Verified Pattern (Wave 6 success formula)

1. **Audit** canonical destination has ALL needed files (copy if missing)
2. **Promote** canonical barrel to be export-complete (preserve aliases)
3. **Bulk rewire** consumers via sed (both quote styles, deepest paths first)
4. **Hunt dynamic imports** (`import("@/lib/...")` patterns)
5. **Delete** folder atomically
6. **Verify** `tsc --noEmit` → 0 errors immediately

## Next Targets (Wave 6f+)

| Folder | Wrappers | External Consumers | Risk | Strategy |
|---|---|---|---|---|
| `src/lib/cloud-backbone/` | ~10 | TBD | Medium | Wave 6 pattern |
| `src/lib/design-system/` | 5 | TBD | Low | Wave 6 pattern |
| `src/lib/services/` (per-subfolder) | varies | High | High | Sub-batched per service |

Each will follow the proven Wave 6 pattern: barrel completion → consumer rewire → folder deletion → tsc verification.

## Architectural Health Signal

- **143 wrappers eliminated** across Waves 6a–6e — all without a single TS regression.
- **5 canonical homes** (`src/domains/engines`, `src/data/persistence`, `src/domains/customer-journey`, `src/data/repositories`, `src/data/seed`) are now exclusive owners of their respective concerns.
- `src/lib` is now **151 files lighter** and **5 top-level entries leaner** than at Wave 4 end.
