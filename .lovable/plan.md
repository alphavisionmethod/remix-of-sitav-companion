

# SITA OS — Master Script System Refactor

## Current State (Verified)

- **235 total scripts** across `scripts/`: 153 TypeScript, 22 shell, 44 PowerShell, 3 JS/MJS
- **0 TypeScript build errors** (activePath issue already resolved)
- Scripts spread across 12 top-level dirs + ~65 root-level files
- No script registry, taxonomy, ownership, CI binding, or output mapping exists
- Phase/prompt-era naming persists in 7 validation scripts
- `validate-all.ts` and `generate-all.ts` use flat file paths with no classification

## What Will Be Created/Changed

### Phase 1: Fix Build Errors + Script Registry Foundation (8 files)

**New directory `scripts/registry/`** with 8 governance files:

1. **`script-registry.ts`** — Master registry of all 235 scripts with id, path, class, owner, permanence, inputs, outputs, CI binding, runtime consequence, canonical status
2. **`script-taxonomy.ts`** — 11 canonical script classes: assert, check, validate, generate, bootstrap, migrate, emit, codemod, drill, restore, rotate
3. **`script-owner-map.ts`** — Maps every script to one of 9 ownership domains (architecture, platform/runtime, contracts, deployment/release, db, security, supportability, admin/control-plane, migration/refactor)
4. **`script-output-map.ts`** — Maps generators to their output artifacts in `generated/`
5. **`script-ci-binding-map.ts`** — Maps scripts to CI phases: pr, nightly, manual, release-gate, deploy-gate, support-drill, local-only
6. **`script-runtime-consequence-map.ts`** — Defines what breaks if each script is absent/broken
7. **`script-language-policy.ts`** — Classifies all scripts by language and defines policy for new scripts
8. **`script-classification-report.ts`** — Generates summary of unclassified, duplicate, deprecated, ownerless scripts

### Phase 2: New Script Domains (50+ new script files)

**`scripts/runtime/`** — Runtime truth plane:
- `checks/check-runtime-capability-matrix.ts`
- `checks/check-runtime-tier-coverage.ts`
- `checks/check-reality-classification-coverage.ts`
- `checks/check-desktop-runtime-contract.ts`
- `checks/check-mobile-runtime-contract.ts`
- `checks/check-appliance-runtime-contract.ts`
- `generate/generate-runtime-capability-matrix.ts`
- `generate/generate-runtime-reality-map.ts`
- `probes/ai-runtime-probe.ts` (moved from root)
- `edge-functions/check-edge-function-topology.ts`
- `edge-functions/check-edge-function-category-coverage.ts`
- `edge-functions/check-edge-function-auth-map.ts`
- `edge-functions/generate-edge-function-registry.ts`

**`scripts/manifests/`** — Manifest truth plane:
- `validate/check-manifest-authority.ts`
- `validate/check-manifest-runtime-linkage.ts`
- `validate/check-manifest-source-truth.ts`
- `validate/check-manifest-ci-gates.ts`
- `validate/check-manifest-owner-coverage.ts`
- `generate/generate-manifest-registry.ts`
- `generate/generate-manifest-truth-dashboard.ts`
- `reports/generate-manifest-drift-report.ts`

**`scripts/db/`** — Database truth plane:
- `checks/check-schema-registry.ts`
- `checks/check-table-ownership.ts`
- `checks/check-migration-ownership.ts`
- `checks/check-rls-policy-registry.ts`
- `checks/check-tenancy-boundary-map.ts`
- `generate/generate-schema-registry.ts`
- `generate/generate-table-ownership-map.ts`
- `generate/generate-rls-policy-registry.ts`
- `generate/generate-migration-registry.ts`
- `backup/verify-backup-restore.ts`

**`scripts/support/`** — Supportability plane:
- `coverage/check-runbook-coverage.ts`
- `coverage/check-alert-runbook-linkage.ts`
- `coverage/check-kill-switch-coverage.ts`
- `coverage/check-golden-path-coverage.ts`
- `runbooks/generate-runbook-index.ts`
- `runbooks/generate-golden-path-registry.ts`
- `diagnostics/` (move `ops-build-diagnostic-bundle.ts`)
- `drills/` (move disaster-recovery-drill scripts)
- `recovery/` (move restore-backup scripts)

**New admin/architecture governance checks** (in `scripts/architecture/checks/`):
- `check-admin-ia.ts`
- `check-admin-top-level-domain-count.ts`
- `check-admin-route-coherence.ts`
- `check-admin-shell-consistency.ts`
- `check-owner-workflow-map.ts`

**`scripts/deployment/`** expansion:
- `checks/check-deployment-unit-map.ts`
- `checks/check-build-output-map.ts`
- `checks/check-ingress-topology.ts`
- `checks/check-release-unit-map.ts`
- `build/generate-build-output-map.ts`
- `ingress/generate-ingress-topology.ts`

### Phase 3: Reorganize Existing Scripts

Move ~65 root-level scripts into canonical subdirectories:
- 16 `check-*` → `scripts/architecture/checks/` or `scripts/contracts/checks/`
- 28 `generate-*` → `scripts/manifests/generate/` or `scripts/runtime/generate/`
- `consolidate-*.js` → `scripts/legacy/migration-tools/`
- `db-integrity-check.sh` → `scripts/db/checks/`
- `restore-backup.*` → `scripts/support/recovery/`
- `deploy-vmware.sh`, `build-ova.sh` → `scripts/release/vmware/`
- `smoke-tests.sh` → `scripts/testing/`

Reorganize `scripts/validation/` by concern:
- Phase/prompt-era scripts renamed to permanent names
- Scripts moved to their canonical domain (db, runtime, manifest, architecture, deployment, support)

Create `scripts/legacy/` for archived scripts.

### Phase 4: Update Master Entrypoints

- **`validate-all.ts`** — Rewrite to use registry-driven script discovery by class
- **`generate-all.ts`** — Rewrite to use registry-driven generator discovery
- **`package.json`** — Add canonical script commands:
  - `validate:architecture`, `validate:contracts`, `validate:runtime`, `validate:db`, `validate:deployment`, `validate:release`, `validate:support`
  - `generate:manifests`, `generate:runtime`, `generate:db`, `generate:deployment`
  - `release:desktop`, `release:appliance`, `release:vmware`
  - `drill:recovery`, `drill:backup-restore`

### Phase 5: Documentation

Create 5 architecture docs:
- `docs/architecture/SCRIPT_SYSTEM_ARCHITECTURE.md`
- `docs/architecture/SCRIPT_TAXONOMY_AND_EXECUTION_POLICY.md`
- `docs/architecture/SCRIPT_LANGUAGE_POLICY.md`
- `docs/architecture/SCRIPT_OUTPUT_AND_CI_BINDING_MAP.md`
- `docs/architecture/SCRIPT_PERMANENCE_AND_LIFECYCLE_MODEL.md`

### Phase 6: Script System Tests

Create `src/test/script-system/` with 7 test files asserting:
- Every script is registered
- Every permanent script has an owner
- No duplicated canonical concerns
- Every validation/generation script has outputs or CI bindings

## Key Constraints

- All existing imports from `scripts/architecture/lib/utils.ts` preserved — the `lib/` stays and all new scripts import from it
- `validate-all.ts` and `generate-all.ts` updated to reference new paths
- No script deleted without replacement identification
- All new scripts are real executable validators/generators, not stubs
- Total new files: ~95 (8 registry + 50+ domain scripts + 5 docs + 7 tests + ~25 reorganized/renamed)

## Technical Notes

- All scripts use the existing `ViolationCollector` pattern from `scripts/architecture/lib/utils.ts`
- New domain `lib/` directories created where needed for shared utilities
- Registry files are `as const` typed registries following the pattern in `src/lib/` canonical registries
- Shell/PS1 scripts are not moved if they have no TS equivalent — they stay in their current domain but get registered

