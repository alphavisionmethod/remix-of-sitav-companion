

# SITA OS — Script System Completion & Wiring Plan

## Current State

**What's DONE (from previous rounds):**
- 8/8 registry files in `scripts/registry/` — EXISTS
- 5/5 architecture docs in `docs/architecture/SCRIPT_*` — EXISTS
- 1 test file in `src/test/script-system/` — EXISTS
- New domain scripts created: `scripts/runtime/{checks,edge-functions,generate}`, `scripts/manifests/{generate,validate,reports}`, `scripts/db/{checks,generate,backup}`, `scripts/support/{coverage,runbooks}`, `scripts/deployment/{checks,ingress,build}`, `scripts/architecture/checks/` (5 admin governance checks)
- `validate-all.ts` and `generate-all.ts` rewritten as registry-driven
- `scripts/legacy/` structure created

**What's NOT DONE (31 missing subdirs, ~65 root scripts unmoved, ~58 validation scripts unmoved, ~53 architecture scripts unorganized, 0 package.json script commands):**

### Missing Directory Structure (31 subdirs)
All of these directories need creating with at least a README or real scripts moved in:
- `scripts/architecture/{assertions,reports}`
- `scripts/contracts/{migration,lib}`
- `scripts/manifests/lib`
- `scripts/runtime/{probes,lifecycle,capability,lib}`
- `scripts/db/{migrations,restore,lib}`
- `scripts/deployment/{deploy,local,lib}`
- `scripts/release/{desktop,appliance,vmware,bundles,rings,supply-chain,checks,lib}`
- `scripts/support/{diagnostics,drills,recovery,lib}`
- `scripts/security/{checks,rotation,attestations,lib}`

### Scripts Not Yet Moved (~176 scripts)
- **65 root-level scripts** still in `scripts/` (e.g., `check-canonical-imports.ts`, `generate-route-manifest.ts`, `restore-backup.sh`, `consolidate-services.js`)
- **58 validation scripts** still in `scripts/validation/` including 7 phase/prompt-era named scripts
- **53 architecture root scripts** (assertions and checks sitting flat instead of in subdirs)

### Missing Wiring
- **package.json**: 0 canonical script commands (no `validate:*`, `generate:*`, `release:*`, `drill:*`)
- **Security subdirs**: `checks/`, `rotation/`, `attestations/` — all missing (scripts sit flat in `scripts/security/`)

---

## Implementation Plan

### Phase 1: Create All Missing Directories + Move Scripts

**1a. Architecture reorganization** — Move 25+ `.ps1` assertions into `scripts/architecture/assertions/`, move `architecture-report.ts` and `boundary-check.ts` to proper subdirs.

**1b. Root script redistribution** — Move all 65 root scripts to canonical homes:
| Script Pattern | Target |
|---|---|
| `check-canonical-imports.ts`, `check-contract-*`, `check-import-boundaries.ts`, `check-package-exports.ts`, `check-duplicate-exports.ts` | `scripts/contracts/checks/` |
| `check-single-brain.ts`, `check-runtime-usage.ts`, `check-edge-function-health.ts`, `check-scoring-boundaries.ts` | `scripts/runtime/checks/` |
| `check-rls-coverage.ts`, `db-integrity-check.sh` | `scripts/db/checks/` |
| `check-ia-coherence.ts`, `check-drift.ts`, `check-route-drift.ts`, `check-no-page-mocks.ts`, `check-inline-mocks.ts`, `check-feature-governance.ts`, `check-delegation-receipts.ts` | `scripts/architecture/checks/` |
| `generate-route-manifest.ts`, `generate-service-manifest.ts`, `generate-contract-manifest.ts`, `generate-ownership-manifest.ts`, `generate-admin-support-visibility.ts`, `generate-advisor-registry.ts`, etc. (20+ generators) | `scripts/manifests/generate/` |
| `generate-runtime-conformance.ts`, `generate-runtime-ports.ts` | `scripts/runtime/generate/` |
| `generate-release-gate-thresholds.ts` | `scripts/release/checks/` |
| `ai-runtime-probe.ts` | `scripts/runtime/probes/` |
| `restore-backup.ps1`, `restore-backup.sh` | `scripts/support/recovery/` |
| `deploy-vmware.sh`, `build-ova.sh` | `scripts/release/vmware/` |
| `smoke-tests.sh`, `validate-deployment.sh` | `scripts/deployment/checks/` |
| `consolidate-*.js` | `scripts/legacy/migration-tools/` |
| `sync-registry-manifests.ts`, `ingest-journey-results.ts`, `validate-os-contracts.ts` | appropriate domain dirs |

**1c. Validation script redistribution** — Move all 58 scripts from `scripts/validation/` to canonical domain homes. Rename 7 phase/prompt-era scripts:
- `check-phase4-foundations.ts` → `check-runtime-foundations.ts`
- `check-phase5-anti-patterns.ts` → `check-platform-anti-patterns.ts`
- `check-phase5-import-boundaries.ts` → `check-contract-import-boundaries.ts`
- `check-phase5-integration-map.ts` → `check-integration-map.ts`
- `check-phase5-readiness.ts` → `check-platform-readiness.ts`
- `check-phase5-route-contract-drift.ts` → `check-route-contract-drift.ts`
- `check-prompt9-readiness.ts` → `check-release-readiness.ts`

**1d. Security reorganization** — Move `rotate-secrets.sh` → `scripts/security/rotation/`, `security-check-*.ts` → `scripts/security/checks/`.

**1e. Release reorganization** — Move `build-electron.sh` → `desktop/`, `build-iso.sh` → `appliance/`, `build-ova.sh` + VMware generators → `vmware/`, `ring-promotion.ts` → `rings/`, `release-launch-truth-audit.ts` → `checks/`, supply-chain scripts → `supply-chain/`.

**1f. Support completion** — Move `ops-build-diagnostic-bundle.ts` → `diagnostics/`, disaster-recovery-drill scripts → `drills/`, restore scripts → `recovery/`.

### Phase 2: Re-export Shims for Moved Scripts

For every moved script that is referenced in `validate-all.ts` or `generate-all.ts` by its old path, create a 1-line re-export shim at the old location OR update the reference. Since `validate-all.ts` and `generate-all.ts` already use explicit path arrays, we update those arrays to point to new locations.

### Phase 3: Update validate-all.ts and generate-all.ts

Rewrite both entrypoints to reference the new canonical paths for all moved scripts. Every domain section gets updated paths.

### Phase 4: Add package.json Script Commands

Add ~20 canonical commands:
```
validate:architecture, validate:contracts, validate:runtime, validate:db,
validate:deployment, validate:release, validate:support, validate:all,
generate:manifests, generate:runtime, generate:db, generate:deployment, generate:all,
release:desktop, release:appliance, release:vmware,
drill:recovery, drill:backup-restore
```

### Phase 5: Update Registry Files

Update `scripts/registry/script-registry.ts` to reference new canonical paths for all moved scripts. Update `script-owner-map.ts` classification rules to match new directory structure. Update `script-ci-binding-map.ts` bindings to reference new paths.

### Phase 6: Expand Test Suite

Split `src/test/script-system/script-system.test.ts` into 7 focused test files per the spec, each asserting the governance rules for its domain.

---

## Summary

| Work Item | Count |
|---|---|
| New directories to create | 31 |
| Scripts to move/rename | ~176 |
| Re-export shims or path updates | ~176 |
| package.json commands to add | ~20 |
| Registry files to update | 3 |
| Test files to create | 6 (expanding 1→7) |
| Total new/modified files | ~250 |

All moves preserve behavior. No deletions without replacement. Phase/prompt naming eliminated from durable architecture.

