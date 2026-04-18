# SRC_LIB Wrapper Removal Status

_Last updated: Wave 11 complete — orchestration layer fully migrated to canonical home_

## Cumulative Summary

| Metric | Wave 9 End | Wave 10 End | **Wave 11 End** |
|---|---|---|---|
| `@lovable:migrated-wrapper` files | 0 | 0 | **0** |
| TS errors | 0 | 0 | **0** |
| Vite build | ✅ 52.5s | ✅ 53.7s | **✅ 45.5s** |
| `src/lib` top-level entries | 95 | 94 | **93** |
| `src/lib/orchestration` files | 47 | 47 | **0 (deleted)** |
| `src/platform/orchestration` files | 1 | 1 | **47** |

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
