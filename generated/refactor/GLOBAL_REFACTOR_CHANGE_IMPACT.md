# SITA OS — Global Refactor Change Impact Report

Generated: 2026-04-16

## Summary

| Category | Count |
|----------|-------|
| Broken import paths fixed | 77 |
| Test files rewritten | 2 |
| Registry files updated | 2 |
| Doc files updated | 1 |
| Empty directories populated | 16 |
| Orphaned files relocated | 2 |
| Orphaned directories removed | 1 |

## Phase 1: Import Path Fixes (77 files)

### scripts/architecture/checks/ (34 files)
Changed `./lib/utils` → `../lib/utils` (16 files)
Changed `../architecture/lib/utils` → `../lib/utils` (18 files)

### scripts/architecture/reports/ (1 file)
Changed `./lib/utils` → `../lib/utils`

### Other domains (42 files)
Changed `../architecture/lib/utils` → `../../architecture/lib/utils`:
- scripts/contracts/checks/ (12 files)
- scripts/db/checks/ (1 file)
- scripts/db/migrations/ (1 file)
- scripts/deployment/checks/ (3 files)
- scripts/release/vmware/ (9 files)
- scripts/release/rings/ (1 file)
- scripts/release/checks/ (2 files)
- scripts/security/checks/ (2 files)
- scripts/manifests/validate/ (5 files)
- scripts/support/diagnostics/ (1 file)
- scripts/codemods/ (1 file)

### Special fix: check-feature-governance.ts
Changed `../src/packages/` → `../../../src/packages/`

## Phase 2: Test File Rewrites

- `src/__tests__/scripts-validation.test.ts` — All 60+ paths updated to canonical locations
- `src/test/scripts-validation.test.ts` — All paths updated to canonical locations

## Phase 3: Registry Updates

### src/lib/platform-law/platform-law-registry.ts
- `scripts/check-single-brain.ts` → `scripts/runtime/checks/check-single-brain.ts`
- `scripts/check-import-boundaries.ts` → `scripts/contracts/checks/check-import-boundaries.ts`
- `scripts/check-rls-coverage.ts` → `scripts/db/checks/check-rls-coverage.ts`
- `scripts/check-edge-function-health.ts` → `scripts/runtime/checks/check-edge-function-health.ts`
- `scripts/check-package-exports.ts` → `scripts/contracts/checks/check-package-exports.ts`
- `scripts/check-contract-completeness.ts` → `scripts/contracts/checks/check-contract-completeness.ts`
- `scripts/check-canonical-imports.ts` → `scripts/contracts/checks/check-canonical-imports.ts`
- `scripts/architecture/check-workflow-state-usage.ts` → `scripts/architecture/checks/check-workflow-state-usage.ts`
- `scripts/validation/check-route-page-contract-layer-usage.ts` → `scripts/architecture/checks/check-route-page-contract-layer-usage.ts`
- `scripts/validation/generated-truth.ts` → `scripts/manifests/validate/generated-truth.ts`
- `scripts/validation/schema-compliance.ts` → `scripts/db/checks/schema-compliance.ts`

### src/lib/truth-manifests/manifest-registry.ts
- All `scripts/validation/check-manifest-*` → `scripts/manifests/validate/check-manifest-*`
- All `scripts/validation/` consumer refs → canonical domain paths

## Phase 4: Doc Updates

### docs/architecture/LAYER_SEPARATION.md
- `scripts/check-import-boundaries.ts` → `scripts/contracts/checks/check-import-boundaries.ts`

## Phase 5: Cleanup

### Empty directories populated with README.md (16)
contracts/lib, contracts/migration, db/lib, db/restore, deployment/deploy, deployment/lib, deployment/local, manifests/lib, release/bundles, release/lib, runtime/capability, runtime/lib, runtime/lifecycle, security/attestations, security/lib, support/lib

### Orphaned files relocated
- `scripts/validation/lib/capability-quality-math.ts` → `scripts/manifests/lib/`
- `scripts/validation/lib/master-dossier-plan.ts` → `scripts/manifests/lib/`

### Orphaned directories removed
- `scripts/ops/` (empty after previous move)

## Verification

- Zero broken `./lib/utils` imports in architecture/checks/
- Zero broken `../architecture/lib/utils` imports in other domains
- All test paths updated to canonical locations
- All registry references updated
- All doc references updated
- Build passes with 0 TypeScript errors
