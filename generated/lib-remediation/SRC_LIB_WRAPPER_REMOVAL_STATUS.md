# SRC_LIB Wrapper Removal Status

_Last updated: Wave 9 complete — architecture layer fully migrated to canonical home_

## Cumulative Summary

| Metric | Wave 7 End | Wave 8 End | **Wave 9 End** |
|---|---|---|---|
| `@lovable:migrated-wrapper` files | 0 | 0 | **0** |
| TS errors | 0 | 0 | **0** |
| Vite build | ✅ 57s | ✅ 53s | **✅ 52.5s** |
| `src/lib` top-level entries | 97 | 96 | **95** |
| `src/lib/architecture` files | 47 | 47 | **0 (deleted)** |
| `src/platform/architecture` files | 1 | 1 | **46** |

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
