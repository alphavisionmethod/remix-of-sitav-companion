# SITA OS — Global Refactor File Update Map

Generated: 2026-04-16

## Script Import Path Fixes (77 files)

| File | Change | Reason |
|------|--------|--------|
| `scripts/architecture/checks/*.ts` (34) | `./lib/utils` or `../architecture/lib/utils` → `../lib/utils` | Scripts moved into `checks/` subdirectory |
| `scripts/architecture/reports/*.ts` (1) | `./lib/utils` → `../lib/utils` | Script moved into `reports/` subdirectory |
| `scripts/contracts/checks/*.ts` (12) | `../architecture/lib/utils` → `../../architecture/lib/utils` | Cross-domain depth increased |
| `scripts/db/checks/*.ts` (1) | Same pattern | Cross-domain depth |
| `scripts/db/migrations/*.ts` (1) | Same pattern | Cross-domain depth |
| `scripts/deployment/checks/*.ts` (3) | Same pattern | Cross-domain depth |
| `scripts/release/vmware/*.ts` (9) | Same pattern | Cross-domain depth |
| `scripts/release/rings/*.ts` (1) | Same pattern | Cross-domain depth |
| `scripts/release/checks/*.ts` (2) | Same pattern | Cross-domain depth |
| `scripts/security/checks/*.ts` (2) | Same pattern | Cross-domain depth |
| `scripts/manifests/validate/*.ts` (5) | Same pattern | Cross-domain depth |
| `scripts/support/diagnostics/*.ts` (1) | Same pattern | Cross-domain depth |
| `scripts/codemods/*.ts` (1) | Same pattern | Cross-domain depth |

## Special Fixes

| File | Change | Reason |
|------|--------|--------|
| `scripts/architecture/checks/check-feature-governance.ts` | `../src/packages/` → `../../../src/packages/` | Incorrect relative path from new location |

## Registry Updates

| File | Changes | Type |
|------|---------|------|
| `src/lib/platform-law/platform-law-registry.ts` | 11 script paths updated | Canonical |
| `src/lib/truth-manifests/manifest-registry.ts` | 8 script paths updated | Canonical |

## Test File Rewrites

| File | Type |
|------|------|
| `src/__tests__/scripts-validation.test.ts` | Full path rewrite (60+ assertions) |
| `src/test/scripts-validation.test.ts` | Full path rewrite (60+ assertions) |

## Admin Page Updates

| File | Old Reference | New Reference |
|------|--------------|---------------|
| `ITC08ArchitectureCompliance.tsx` | `scripts/architecture/architecture-report.ts` | `scripts/architecture/reports/architecture-report.ts` |
| `ITC09RouteInventory.tsx` | `scripts/generate-route-manifest.ts` | `scripts/manifests/generate/generate-route-manifest.ts` |
| `ITC12ValidationPipeline.tsx` | `scripts/check-architecture-compliance.ts` | `scripts/architecture/reports/architecture-report.ts` |
| `ITC12ValidationPipeline.tsx` | `scripts/generate-route-manifest.ts` | `scripts/manifests/generate/generate-route-manifest.ts` |

## Doc Updates

| File | Old Reference | New Reference |
|------|--------------|---------------|
| `docs/architecture/LAYER_SEPARATION.md` | `scripts/check-import-boundaries.ts` | `scripts/contracts/checks/check-import-boundaries.ts` |
| `docs/architecture/VMWARE_DEPLOYMENT_AND_OPS.md` | `scripts/restore-backup.sh` | `scripts/release/iso/restore-backup.sh` |
| `docs/architecture/VMWARE_DEPLOYMENT_AND_OPS.md` | `scripts/build-ova.sh` | `scripts/release/vmware/build-ova.sh` |
| `docs/self-hosted-deployment.md` | `scripts/deploy-vmware.sh` | `scripts/release/vmware/deploy-vmware.sh` |
| `docs/self-hosted-deployment.md` | `scripts/build-ova.sh` | `scripts/release/vmware/build-ova.sh` |
| `docs/vmware-deployment.md` | `scripts/restore-backup.sh` | `scripts/release/iso/restore-backup.sh` |

## Orphan Cleanup

| Action | Path | Destination |
|--------|------|-------------|
| Moved | `scripts/validation/lib/capability-quality-math.ts` | `scripts/manifests/lib/` |
| Moved | `scripts/validation/lib/master-dossier-plan.ts` | `scripts/manifests/lib/` |
| Removed | `scripts/ops/` (empty) | N/A |

## Empty Directory READMEs (16)

All populated with purpose-describing README.md files:
`contracts/lib`, `contracts/migration`, `db/lib`, `db/restore`, `deployment/deploy`, `deployment/lib`, `deployment/local`, `manifests/lib`, `release/bundles`, `release/lib`, `runtime/capability`, `runtime/lib`, `runtime/lifecycle`, `security/attestations`, `security/lib`, `support/lib`
