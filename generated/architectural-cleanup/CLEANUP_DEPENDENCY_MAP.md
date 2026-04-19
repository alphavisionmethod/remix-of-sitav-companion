# Cleanup Dependency Map

**Generated:** 2026-04-19
**Method:** Live `grep -r` against `src/`, `scripts/`, `supabase/`, `docs/`, `.github/`, `package.json`, `generated/`.

## Why a dependency map exists

Per `FILE_REMOVAL_SAFETY_POLICY.md`, every cleanup candidate must pass 9 dependency checks before removal is even considered. This document records the live evidence for the candidates surfaced in `ARCHITECTURAL_CLEANUP_INVENTORY.md`.

## Candidate categories + dependency posture

### A. Browser-trapped shared hooks
- **Count:** 0 (all 11 `window`-touching hooks classified in `src/runtimes/portability-boundary-model.ts`)
- **Action:** None — closed by prior portability closure.

### B. Unstandardized edge functions (172 total, 30 adopters)
- **Imports of `_shared/logger.ts`:** 30 files
- **Reverse refs to those 30 fns from `src/`:** all functions are reachable via `supabase.functions.invoke(<name>)` and the canonical edge-function topology — none are dead.
- **Action:** Refactor 8 highest-value (additive only, preserves behavior); honestly label rest in audit JSON.

### C. Generated truth artifacts (`generated/`)
- **Total files:** see `TRUTH_MANIFEST_AUDIT.md` for live count and duplicate matrix.
- **Action:** Relabel/archive in place; rewire consumers via `TRUTH_MANIFEST_RECONCILIATION_PLAN.md`.

### D. Docs (`docs/`)
- **Cross-referenced from:** `README.md`, root manifests, sub-`README.md`s, `package.json` script descriptions.
- **Action:** Audit-only register; no removals this pass.

### E. Scripts / workflows (`scripts/`, `.github/workflows/`)
- **Cross-referenced from:** `package.json` (190+ npm scripts), CI workflow YAML, peer scripts importing siblings.
- **Action:** Audit-only register; no removals this pass.

## Reverse-reference checks performed

For each candidate the following 9 checks were run via grep:

1. Direct ESM import (`from "@/..."` / `from "../..."`)
2. Dynamic `import()`
3. Route registration (`react-router` / route registry)
4. CI workflow reference (`.github/workflows/*.yml`)
5. npm script reference (`package.json`)
6. Validator/generator reference (`scripts/**`)
7. Doc reference (`docs/**`, `*.md`)
8. Manifest registry reference (`generated/**`)
9. Edge-function invocation reference (`supabase.functions.invoke`)

## Output

The live result of each check is encoded in the per-candidate JSON status mates (`architectural-cleanup-status.json`, `portability-cleanup-status.json`, `logging-cleanup-status.json`).
