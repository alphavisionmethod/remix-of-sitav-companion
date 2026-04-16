# SITA OS — Global Refactor Secondary Issues

Generated: 2026-04-16

## Issues Discovered During Refactor

### 1. MIGRATION-BLUEPRINT.md Contains Aspirational Paths
- **File**: `docs/architecture/MIGRATION-BLUEPRINT.md`
- **Issue**: References `infra/deploy/build-ova.sh` which is a future target path, not current
- **Status**: Informational only — this doc describes future state architecture
- **Action**: No change needed; doc is clearly labeled as a blueprint

### 2. validate-deployment.sh References Multiple Fallback Paths
- **File**: `scripts/deployment/checks/validate-deployment.sh`
- **Issue**: Uses `||` fallback chains to check both old and new paths (e.g., `deploy/ota-agent.sh || scripts/release/iso/sita-ota-agent.sh`)
- **Status**: Acceptable — provides backward compatibility during migration
- **Action**: Can be simplified to canonical-only paths in a future pass

### 3. Hardcoded Colors in Admin Pages
- **Files**: `ITC08ArchitectureCompliance.tsx`, `ITC09RouteInventory.tsx`
- **Issue**: Use `text-orange-500`, `text-green-500` instead of design tokens
- **Status**: Pre-existing, not introduced by refactor
- **Action**: Track for future design-system compliance pass

### 4. Duplicate Test Files
- **Files**: `src/__tests__/scripts-validation.test.ts` and `src/test/scripts-validation.test.ts`
- **Issue**: Two test files covering the same domain with overlapping assertions
- **Status**: Both updated to canonical paths; consolidation deferred
- **Action**: Merge into single canonical test file in future cleanup

## No Critical Secondary Issues Found

All architectural areas are coherent. No conflicting registries, no dead routes, no orphaned integrations.
