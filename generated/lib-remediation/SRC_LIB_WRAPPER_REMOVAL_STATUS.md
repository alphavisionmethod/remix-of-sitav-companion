# SRC_LIB Wrapper Removal Status

_Last updated: Wave 12 complete — nova-sdk merged into canonical home_

## Cumulative Summary

| Metric | Wave 10 End | Wave 11 End | **Wave 12 End** |
|---|---|---|---|
| `@lovable:migrated-wrapper` files | 0 | 0 | **0** |
| TS errors | 0 | 0 | **0** |
| Vite build | ✅ 53.7s | ✅ 45.5s | **✅ 47.2s** |
| `src/lib` top-level entries | 94 | 93 | **92** |
| `src/lib/nova-sdk` files | 55 | 55 | **0 (deleted)** |
| `src/platform/nova-sdk` files | 5 | 5 | **56** |

## Wave 12 — Nova SDK Merge (the parallel-canonical case) ✅

**Folder:** `src/lib/nova-sdk/` → `src/platform/nova-sdk/` (merge, not promote)

### Pattern Variant: Parallel-Canonical Merge

Unlike Waves 8–11 (which moved into empty placeholder destinations), this wave handled a **partial pre-existing canonical home**. `src/platform/nova-sdk/ui/` already held three live canonical UI files (`NovaThemeProvider.tsx`, `components.tsx`, `layout.tsx`), and the matching `src/lib/nova-sdk/ui/*` files were thin shim re-exports pointing to those canonicals. Both consumer sets (`@/lib/nova-sdk` × 24 and `@/platform/nova-sdk` × 24) had been growing in parallel.

### Steps Executed
1. **Conflict scan:** 4 file-name overlaps (`index.ts`, `ui/NovaThemeProvider.tsx`, `ui/components.tsx`, `ui/layout.tsx`).
2. **Shim deletion:** Removed the 3 `ui/*` shim files from `src/lib/nova-sdk/ui/` — canonical bodies remain untouched in `src/platform/nova-sdk/ui/`.
3. **Barrel handoff:** Replaced the empty Wave 1 placeholder `src/platform/nova-sdk/index.ts` with the live 100-LOC barrel (covering Core, UI, Services, System, Input, Graphics, Runtime, Hooks, Design Contract, Theme Provider, Kernel, Privilege, Wayland, Drivers, Extensions, Polish Audit).
4. **Physical migration:** Moved all 51 remaining files (10 subfolders: `core/`, `extensions/`, `graphics/`, `hooks/`, `input/`, `kernel/__tests__/`, `runtime/__tests__/`, `services/__tests__/`, `system/`).
5. **Bulk rewire:** Single sed pass rewrote 24 lib-side consumer files from `@/lib/nova-sdk/*` → `@/platform/nova-sdk/*`. Total `@/platform/nova-sdk` consumers now 38 (24 migrated + 14 pre-existing).
6. **Folder deletion:** `src/lib/nova-sdk/` removed atomically.

### Verification

```
$ grep -rn "@/lib/nova-sdk" src   → 0 hits
$ npx tsc --noEmit                → 0 errors
$ npx vite build                  → ✅ built in 47.18s
```

## Architectural Position

The full Nova SDK micro-OS surface — kernel (process/memory/syscall/scheduler/compositor/wayland/drivers/privilege), runtime (lifecycle/loader/managed-runtime), services (filesystem/window-server/input/notification/permission-monitor/settings), system bridges, input/graphics primitives, hooks, design contract enforcement, theme provider, UI component library, layout primitives, and the 3-tier extensibility system (plugins/widgets/integrations) — now lives entirely under `src/platform/nova-sdk/`. The platform-as-first-class-OS contract is unified: zero parallel canonicals remain.

## Wave 11 — Orchestration Folder Promotion ✅

**Folder:** `src/lib/orchestration/` → `src/platform/orchestration/`

### Steps Executed
1. **Conflict scan:** Only `index.ts` collided — destination held the empty Wave 1 placeholder barrel; replaced with the live 80-LOC source barrel exporting the 4-Layer Canonical Spine (Intent → Planning → Execution → Proof) plus Facade, IDs, Errors, Registry, and Migration mapping.
2. **Physical migration:** Moved all 47 files preserving the 6-subfolder structure (`shared/`, `intent/`, `planning/`, `execution/` (incl. `__tests__/`), `proof/`, `migration/`) plus 2 root files (`orchestration-facade.ts`, `index.ts`).
3. **Bulk rewire:** Single sed pass rewrote 12 consumer files from `@/lib/orchestration/*` → `@/platform/orchestration/*`.
4. **Folder deletion:** `src/lib/orchestration/` removed atomically.

### Verification

```
$ grep -rn "@/lib/orchestration" src   → 0 hits
$ npx tsc --noEmit                     → 0 errors
$ npx vite build                       → ✅ built in 45.49s
```

## Architectural Position

The 4-Layer Canonical Spine (Intent, Planning, Execution, Proof) and the singleton `OrchestrationFacade` — the **sole authoritative entry point** per the Orchestration Authority constitution — now live at `src/platform/orchestration/`. This eliminates the legacy `@/lib/orchestration/*` deep-import path and aligns with the Canonical Ownership Model (platform-layer service: Execution + Proof governance).

## Wave 10 — Sync-Engine Folder Promotion ✅

**Folder:** `src/lib/sync-engine/` → `src/platform/sync-engine/`

### Steps Executed
1. **Conflict scan:** Verified zero file-name collisions — no pre-existing `src/platform/sync-engine/` directory; the unrelated `src/platform/sync/` barrel was left untouched (different concern).
2. **Physical migration:** Moved all 38 files preserving the 7-subfolder structure (`adapters/`, `collaboration/`, `ecosystem/`, `governance/`, `operations/`, `security/`, `transport/`) plus 9 root files (`syncd.ts`, `delta-engine.ts`, `conflict-resolver.ts`, `sync-state-machine.ts`, `sync-object-model.ts`, `sync-namespaces.ts`, `sync-notifications.ts`, `app-sdk.ts`, `index.ts`).
3. **Bulk rewire:** Single sed pass rewrote 11 consumer files from `@/lib/sync-engine/*` → `@/platform/sync-engine/*`.
4. **Folder deletion:** `src/lib/sync-engine/` removed atomically.

### Verification

```
$ grep -rn "@/lib/sync-engine" src   → 0 hits
$ npx tsc --noEmit                   → 0 errors
$ npx vite build                     → ✅ built in 53.72s
```

## Architectural Position

The sync-engine layer (Sync daemon `syncd`, delta/conflict resolution, state machine, object model, namespaces, notifications, app-SDK, plus 5 adapters, 4 collaboration modules, 4 ecosystem modules, 4 governance modules, 4 operations modules, 4 security modules, 4 transport modules) is now fully co-located under `src/platform/sync-engine/` per the **Canonical Ownership Model** (Layer 3 platform service: Sync).

## Wave 9 — Architecture Folder Promotion ✅

**Folder:** `src/lib/architecture/` → `src/platform/architecture/`

### Steps Executed
1. **Conflict scan:** Verified zero file-name collisions — destination held only the empty `index.ts` placeholder barrel from Wave 1 scaffolding.
2. **Doc relocation:** Moved `DIRECTORY_ORGANIZATION.md` to `docs/architecture/legacy/` (kept architectural prose under `docs/`, not under `src/`).
3. **Barrel handoff:** Replaced the placeholder `src/platform/architecture/index.ts` with the live source barrel (137 LOC of explicit re-exports across 12 numbered sections).
4. **Physical migration:** Moved all 45 remaining `*.ts` files into `src/platform/architecture/`, preserving file names so internal `./sibling` imports continued to resolve.
5. **Bulk rewire:** Single sed pass across `src/**/*.{ts,tsx}` rewrote 33 consumer files (admin commands, kernel context, plane guards, governance barrels, tests, runtime profiles, shell-runtime).
6. **Folder deletion:** `src/lib/architecture/` removed atomically.

### Verification

```
$ grep -rn "@/lib/architecture" src   → 0 hits
$ npx tsc --noEmit                    → 0 errors
$ npx vite build                      → ✅ built in 52.55s
```

## Architectural Position

The architecture-truth layer (canonical service registry, domain hierarchy, execution chain, pipeline, immutable event taxonomy, proof/memory/identity layers, workflow state machine, exception recovery, policy versioning, plane/route/owner/context maps, layer manifest, system-stack registry, observability diagnostics, OS unification layer, tenant sovereignty, IA governance, cost/token governance, connector governance, capability contract system, advisor orchestration, boardroom architecture, approval tiers, boundary rules, bounded-context registry/types, component registry, component duplication map, phased rollout plan, self-learning constraints, service-ownership manifest, truth validation) is now fully co-located under `src/platform/architecture/` per the **Canonical Ownership Model** (`docs/architecture/CANONICAL_OWNERSHIP_MODEL.md`).

This eliminates the legacy `@/lib/architecture/*` deep-import path and aligns Wave 9 with the same Wave 7+8 promotion playbook (zero shims, zero forwarders, zero wrappers).

## Next Phase Targets (priority order)

| Folder | Files | Destination | Risk | Strategy |
|---|---|---|---|---|
| `src/lib/sync-engine/` | 38 | `src/platform/sync-engine/` | Low | Wave 9 pattern (physical promotion + bulk sed) |
| `src/lib/orchestration/` | 47 | `src/platform/orchestration/` | Medium | Preserve canonical-spine layering |
| `src/lib/nova-sdk/` | 55 | Confirm full migration to `@/platform/nova-sdk/` | Medium | Audit + collapse |
| `src/lib/services/` + `src/lib/core-services/` | 703 | Multi-wave audit; collapse to ~45 canonical services | High | Service-by-service truth audit |

Each subsequent wave will follow the **proven Wave 7+8+9 pattern**:
1. Conflict scan (file-level, not barrel-level).
2. Physical promotion of all files preserving subfolder structure.
3. Bulk sed rewire across `src/**/*.{ts,tsx}` for both quote styles.
4. Restore minimal forwarder stubs only when external barrels demand them (no `@lovable:migrated-wrapper` marker).
5. Verify with both `tsc --noEmit` AND `vite build` (Vite catches what tsc misses).
