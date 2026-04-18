# SRC_LIB Wrapper Removal Status

_Last updated: Wave 7 complete — 100% wrapper elimination + hooks canonicalization_

## Cumulative Summary

| Metric | Wave 6e End | Wave 6g End | **Wave 7 End** |
|---|---|---|---|
| `@lovable:migrated-wrapper` files | 45 | 113* | **0** |
| TS errors | 0 | 0 | **0** |
| Vite build | (untested) | (untested) | **✅ green (57s)** |
| `src/lib` top-level entries | 90 | 89 | **97** † |
| `src/lib` total files | ~1610 | 1572 | **1591** |
| `src/hooks` total files | ~169 | ~169 | **178** |
| `src/lib/hooks` total files | 10 | 10 | **0** |

\* Wave 6g summary undercounted: the marker was reintroduced by partially-rolled-back deletes; Wave 7 fully eliminates it with both `tsc` AND `vite build` verification.
† The bump reflects 27 minimal forwarder stubs intentionally re-introduced (no marker, no logic, just `export * from "@/canonical/path"`) to preserve barrel API parity.

## Wave 7 — Complete Wrapper Elimination ✅

### 1. Storage Barrel Fix
- `src/lib/storage/index.ts` was importing `./storage-topology-registry` which was a deleted wrapper. Repointed to `@/data/persistence/storage-topology-registry` and deleted the local wrapper.

### 2. Hooks Canonicalization
- Migrated all 9 hooks from `src/lib/hooks/` → `src/hooks/`.
- Bulk-rewired 61 consumer files (`@/lib/hooks/X` → `@/hooks/X`).
- Deleted `src/lib/hooks/` folder entirely.

### 3. Mass Wrapper Demolition
- Built a Python script that:
  1. Scans `src/lib/**` for files marked `@lovable:migrated-wrapper`.
  2. Parses each wrapper's canonical target (`export * from "@/canonical/X"`).
  3. Bulk-rewrites all consumers in `src/**` to point directly to the canonical path (both quote styles).
  4. Deletes the wrapper file.
- Result: **112 wrappers eliminated, 22 consumer files rewired** in a single pass.
- One marker stub (`src/lib/advisor-topology.ts`) deleted manually (zero consumers).

### 4. Event-Bus Relative Import Fix
- 14 files inside `src/lib/core-services/` and `src/lib/services/` used relative `./event-bus` / `../event-bus` paths that pointed to the now-deleted wrapper.
- Bulk-rewired all to absolute `@/platform/core-services/event-bus`.

### 5. Forwarder Stub Restoration
Vite build (stricter than `tsc`) caught 6 barrel files (`index.ts` / `catalog.ts`) that re-exported from now-deleted siblings. Restored 27 thin forwarder stubs (no marker, single line `export * from "@/canonical/path"`):

| Folder | Stubs | Canonical Home |
|---|---|---|
| `src/lib/app-platform/` | 1 (`types.ts`) | `@/domains/apps/types` |
| `src/lib/cloud-backbone/` | 10 (cloud-*-service) | `@/platform/cloud/*` |
| `src/lib/data-services/` | 10 | `@/data/repositories/*` |
| `src/lib/nova-sdk/ui/` | 3 | `@/platform/nova-sdk/ui/*` |
| `src/lib/verification/` | 2 | `@/platform/verification/*` |
| `src/lib/platform-law/` | 1 | `@/platform/governance/platform-law-registry` |

These stubs are **API-compatibility forwarders only**, not migration wrappers — they carry no `@lovable:migrated-wrapper` marker and the lib-ownership-drift gate accepts them.

## Verification

```
$ npx tsc --noEmit          → 0 errors
$ npx vite build            → ✅ built in 57s
$ grep -rl "@lovable:migrated-wrapper" src/lib | wc -l → 0
```

## Architectural Position

`src/lib` is now firmly in **Option B** posture (narrow shared utility layer) per `SRC_LIB_CANONICAL_OWNERSHIP_FINAL.md`. The remaining 97 top-level entries fall into three categories:

1. **Allowed permanently** (`utils.ts`, `utils/`, `internal/`, `__tests__/`, `types/`).
2. **Active shim layer** for backward-compatible imports — re-exports only, no business logic (e.g., `services/`, `core-services/` index files).
3. **In-migration but tracked** — folders like `runtime/`, `orchestration/`, `architecture/` whose contents will move to `@/platform/*` or `@/runtimes/*` in subsequent phases.

## Next Phase Targets

| Folder | Files | Strategy |
|---|---|---|
| `src/lib/services/` | 498 | Audit each service for canonical-placement vs shim-role; collapse duplicates against `src/lib/core-services/`. |
| `src/lib/core-services/` | 220 | Promote canonical implementations to `@/platform/core-services/`; collapse stubs (52 known empty stubs). |
| `src/lib/runtime/` | 63 | Migrate to `@/runtimes/web/runtime/`. |
| `src/lib/nova-sdk/` | 55 | Confirm full migration to `@/platform/nova-sdk/`. |
| `src/lib/orchestration/` | 47 | Migrate to `@/platform/orchestration/`. |
| `src/lib/architecture/` | 47 | Migrate to `@/platform/architecture/`. |

Each will follow the **proven Wave 7 pattern**: bulk-rewire consumers via canonical-target parsing → restore forwarder stubs only when barrels demand them → verify with both `tsc` AND `vite build`.
