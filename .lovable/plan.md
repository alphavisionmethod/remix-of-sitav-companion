

# SITA OS — Global Refactor Integration & Dependency Audit

## Audit Findings

### CRITICAL: 77 Broken Script Import Paths

When scripts were moved from their original locations into canonical subdirectories, their relative import paths to `scripts/architecture/lib/utils.ts` were **not updated**. This means **77 scripts will fail at runtime**.

Three categories of breakage:

| Category | Count | Current Import | Correct Import |
|----------|-------|---------------|----------------|
| `scripts/architecture/checks/` files using `./lib/utils` | 16 | `./lib/utils` | `../lib/utils` |
| `scripts/architecture/checks/` files using `../architecture/lib/utils` | 18 | `../architecture/lib/utils` | `../lib/utils` |
| `scripts/architecture/reports/` using `./lib/utils` | 1 | `./lib/utils` | `../lib/utils` |
| Other domains (contracts, db, deployment, release, security, manifests, support, codemods) using `../architecture/lib/utils` | 42 | `../architecture/lib/utils` | `../../architecture/lib/utils` |

### Stale Test File: `src/__tests__/scripts-validation.test.ts`

This test file references **all old paths** (e.g., `scripts/generate-service-manifest.ts`, `scripts/check-single-brain.ts`, `scripts/architecture/boundary-check.ts`, `scripts/architecture/architecture-report.ts`). Every single path is now wrong — the file will fail 60+ assertions. Must be rewritten to reference new canonical paths.

### Stale Registry References

- **`src/lib/platform-law/platform-law-registry.ts`**: 3 references to `scripts/validation/` paths that no longer exist
- **`src/lib/truth-manifests/manifest-registry.ts`**: 8 references to `scripts/validation/` paths that no longer exist

### Stale Admin Page References

- `ITC08ArchitectureCompliance.tsx`: References `scripts/architecture/architecture-report.ts` (now at `scripts/architecture/reports/architecture-report.ts`)
- `ITC09RouteInventory.tsx`: References `scripts/generate-route-manifest.ts` (now at `scripts/manifests/generate/generate-route-manifest.ts`)
- `ITC12ValidationPipeline.tsx`: References `scripts/check-architecture-compliance.ts` and `scripts/generate-route-manifest.ts` (both moved)

### Stale Doc References

- `docs/architecture/LAYER_SEPARATION.md`: References `scripts/check-import-boundaries.ts` (now at `scripts/contracts/checks/check-import-boundaries.ts`)

### Empty Directories (17)

Directories created but never populated with scripts or READMEs:
`scripts/contracts/{lib,migration}`, `scripts/db/{lib,restore}`, `scripts/deployment/{deploy,lib,local}`, `scripts/manifests/lib`, `scripts/release/{bundles,lib}`, `scripts/runtime/{capability,lib,lifecycle}`, `scripts/security/{attestations,lib}`, `scripts/support/lib`, `scripts/ops` (orphaned)

### Orphaned Files

- `scripts/validation/lib/capability-quality-math.ts` and `scripts/validation/lib/master-dossier-plan.ts` — left behind in old validation dir, no consumers found
- `scripts/ops/` — empty directory, `ops-build-diagnostic-bundle.ts` already moved to `scripts/support/diagnostics/`

### `check-feature-governance.ts` Broken Imports

This file imports from `../src/packages/feature-governance/...` which is incorrect from its current location at `scripts/architecture/checks/`.

---

## Implementation Plan

### Phase 1: Fix All 77 Broken Import Paths

Automated sed-based fix across all script files:

- **35 files in `scripts/architecture/checks/`**: Change `./lib/utils` and `../architecture/lib/utils` to `../lib/utils`
- **1 file in `scripts/architecture/reports/`**: Change `./lib/utils` to `../lib/utils`
- **42 files in other domains**: Fix relative path depth:
  - `scripts/contracts/checks/` (11 files): `../architecture/lib/utils` → `../../architecture/lib/utils`
  - `scripts/db/checks/` (1 file): same fix
  - `scripts/db/migrations/` (1 file): same fix
  - `scripts/deployment/checks/` (3 files): same fix
  - `scripts/release/vmware/` (9 files): same fix
  - `scripts/release/rings/` (1 file): same fix
  - `scripts/release/checks/` (2 files): same fix
  - `scripts/security/checks/` (2 files): same fix
  - `scripts/manifests/validate/` (5 files): same fix
  - `scripts/support/coverage/` (1 file): same fix
  - `scripts/support/diagnostics/` (1 file): same fix
  - `scripts/codemods/` (1 file): same fix
- **`check-feature-governance.ts`**: Fix `../src/packages/` to `../../src/packages/`

### Phase 2: Rewrite `src/__tests__/scripts-validation.test.ts`

Update all 60+ file paths to their new canonical locations. Update the test assertions to match the new `validate-all.ts` and `generate-all.ts` structures.

### Phase 3: Fix Stale Registry References

- **`src/lib/platform-law/platform-law-registry.ts`**: Update 3 `scripts/validation/` paths to canonical locations
- **`src/lib/truth-manifests/manifest-registry.ts`**: Update 8 `scripts/validation/` paths to canonical locations

### Phase 4: Fix Admin Page References

- `ITC08ArchitectureCompliance.tsx`: Update to `scripts/architecture/reports/architecture-report.ts`
- `ITC09RouteInventory.tsx`: Update to `scripts/manifests/generate/generate-route-manifest.ts`
- `ITC12ValidationPipeline.tsx`: Update both references to new paths

### Phase 5: Fix Doc References

- `docs/architecture/LAYER_SEPARATION.md`: Update script path reference

### Phase 6: Clean Up Empty Dirs & Orphans

- Add README.md files to 17 empty directories explaining their purpose
- Move `scripts/validation/lib/*.ts` to `scripts/manifests/lib/` (or `scripts/architecture/lib/`)
- Remove empty `scripts/ops/` directory

### Phase 7: Generate Change Impact Report

Create `generated/refactor/GLOBAL_REFACTOR_CHANGE_IMPACT.md` documenting all changes, and run verification to confirm zero broken imports remain.

---

## Summary

| Work Item | Count |
|-----------|-------|
| Broken import paths to fix | 77 |
| Test file to rewrite | 1 |
| Registry files to update | 2 |
| Admin pages to update | 3 |
| Doc files to update | 1 |
| Empty dirs to populate with READMEs | 17 |
| Orphaned files to relocate | 2 |
| Orphaned dirs to remove | 1 |
| Total files changed | ~105 |

