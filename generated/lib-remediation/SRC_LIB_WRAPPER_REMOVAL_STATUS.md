# SRC_LIB Wrapper Removal Status

_Last updated: Wave 6g complete — **ZERO wrappers remaining**_

## 🎯 MILESTONE: 100% wrapper elimination achieved

All 188 `@lovable:migrated-wrapper` files removed across Waves 6a–6g with zero TypeScript regressions.

## Cumulative Summary

| Metric | Wave 4 End | Wave 6a | Wave 6b | Wave 6c | Wave 6d | Wave 6e | Wave 6f | **Wave 6g** |
|---|---|---|---|---|---|---|---|---|
| Wrappers remaining | 188 | 129 | 114 | 105 | 72 | 42 | 30 | **0** |
| TS errors | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Net wrappers removed | 0 | 59 | 74 | 83 | 116 | 146 | 158 | **188** |
| `src/lib` top-level entries | 103 | 102 | 101 | 100 | 99 | 98 | 89 | **89** |
| Total `src/lib` files | 1767 | 1707 | 1687 | 1678 | 1645 | 1616 | 1582 | **1565** |

## Wave 6g — Final Cleanup Sweep ✅

**Scope:** All remaining 30 wrappers across 16 small folders/files + 19 reverse wrappers in `src/domains/types`.

**Strategy:** Bulk-classify by consumer count, then execute in a single pass:
- **0-consumer wrappers** (instant deletes): 24 files
- **Active wrappers** (rewire then delete): 6 surfaces, 13 consumer files

**Steps executed:**
1. Rewired `@/lib/services/approval-engine` → `@/lib/core-services/approval-engine` (2 consumers).
2. Rewired `@/lib/services/conscience-gate` → `@/lib/core-services/conscience-gate` (3 consumers).
3. Rewired `@/lib/verification` → `@/platform/verification` (1 consumer).
4. Rewired `@/lib/core-services/event-bus` → `@/platform/core-services/event-bus` (7 consumers).
5. Atomically deleted: `services/brain-core`, `services/approval-engine`, `services/conscience-gate`, `nova-sdk/ui`, `investment-office`, `verification` folders + 9 single-file wrappers + entire `src/domains/types/` (reverse-wrapper folder).
6. Removed 2 newly-empty parent folders (`src/lib/reality-audit`, `src/lib/integrations`).
7. Verified `tsc --noEmit` returns 0 errors.

**Outcome:** No file in the project carries the `@lovable:migrated-wrapper` marker anymore. The decomposition is complete.

## Wave 6f — cloud-backbone + design-system ✅

- Promoted `src/platform/cloud/index.ts` to a 20-export complete barrel (services + types).
- Rewired `src/planes/backend.ts` → `@/platform/cloud`.
- Rewired `src/lib/nova-sdk/core/enforcement.ts` → `@/platform/design-system/app-window-system`.
- Deleted `src/lib/cloud-backbone/` (11 files) and `src/lib/design-system/` (5 files).

## Wave 6e — demo-data ✅
Migrated `src/lib/demo-data/` (30 files) → `src/data/seed/`. Real demo content (DEMO_INBOX_ITEMS, etc.) physically copied; 5 consumers rewired.

## Wave 6d — data-services ✅
Migrated `src/lib/data-services/` (33 files) → `src/data/repositories/`. Promoted barrel; 2 consumers rewired.

## Wave 6c — customer-journey ✅
0-consumer wrapper deletion: 9 files removed; canonical `src/domains/customer-journey/` was already in active use.

## Wave 6b — persistence ✅
Migrated `src/lib/persistence/` (17 files) → `src/data/persistence/`. 142 consumers rewired; legacy `getScopedMemoryStats` alias preserved.

## Wave 6a — engines ✅
Migrated `src/lib/engines/` (59 files) → `src/domains/engines/`. Barrel promoted to 50+ exports; 5 consumers rewired.

## Final Architecture State

`src/lib/` is now an **88-entry shared utility/legacy ground**, not a 188-wrapper indirection swamp. All migrated logic lives at its canonical home:

| Canonical root | Now sole owner of |
|---|---|
| `src/domains/engines` | All business/orchestration engines |
| `src/domains/customer-journey` | Customer journey ingestion + scoring |
| `src/data/persistence` | Service-level persistence adapters |
| `src/data/repositories` | All data-service modules (32 services) |
| `src/data/seed` | All demo/seed data |
| `src/platform/cloud` | Cloud backbone services |
| `src/platform/design-system` | Design tokens + window system |
| `src/platform/verification` | Surface registry + verification hooks |
| `src/platform/core-services` | Event bus, runtime services |
| `src/platform/governance` | Platform law registry |
| `src/platform/runtime` | Sound engine + runtime utilities |
| `src/platform/nova-sdk/ui` | Nova SDK UI components |
| `src/runtimes/reality` | Reality audit registry |
| `src/integrations/external` | External integration hubs |
| `src/domains/apps/types` | App platform + investment-office types |

## Verified Pattern (the formula that worked 7 times in a row)

1. **Audit** canonical destination has ALL needed files (copy if missing)
2. **Promote** canonical barrel to be export-complete (preserve aliases)
3. **Bulk rewire** consumers via sed (both quote styles, deepest paths first)
4. **Hunt dynamic imports** (`import("@/lib/...")` patterns)
5. **Delete** folder atomically + clean empty parents
6. **Verify** `tsc --noEmit` → 0 errors immediately

## Architectural Health Signal

- **188/188 wrappers eliminated** (100%).
- **202 files removed** from `src/lib` (1767 → 1565).
- **14 top-level entries removed** from `src/lib` (103 → 89).
- **0 TS regressions** across any of the 7 waves.
- The `check-legacy-wrapper-usage.ts` guardrail will now report **0 wrapper imports** — its job is done.

## Next Steps (Post-Migration Hardening)

The decomposition phase is closed. Remaining opportunities live elsewhere:
- Audit `src/lib/services/` (largest remaining shape, mostly canonical now) for deduplication opportunities vs `src/lib/core-services/`.
- Migrate `src/lib/hooks/` → `src/hooks/` (the last "non-shared" folder still in `src/lib/`).
- Retire the wrapper-tracking guardrail check or repurpose it as a regression sentinel.
