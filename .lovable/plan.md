# Wave 9 — Physical Shim Removal

## Context

Audit confirms the repository is **semantically already at the target state**:
- All canonical files exist at canonical paths (`src/platform/*`, `src/packages/contracts/*`).
- **Zero** active `from` imports reference any deprecated shim path.
- `tsc --noEmit` passes with 0 errors.
- All 45 remaining shim files are pure 2-line `@deprecated` re-exports.

The only remaining "move" is the **scheduled physical deletion** of these shim files. The constitution previously scheduled this for "Wave 9"; we will execute it now since there are no live consumers.

## Strict Discipline (per user's explicit checklist)

- ✅ **Canonical destination proof for every moved file** — pre-flight verifies each canonical path exists before deleting its shim
- ✅ **Reverse-dependency proof** across `src/`, `tests/`, `docs/`, `generated/`, `scripts/`, `.github/workflows/` — block deletion if any real `from` import is found
- ✅ **Stronger verification gates for old-path removal** — pre-delete and post-delete grep gates
- ✅ **Targeted smoke tests for multi-consumer moves** — `tsc --noEmit` + key barrel imports re-verified
- ✅ **Explicit semantic verification for `EmptyState`** — confirm canonical `@/platform/sita/components/sita/EmptyState` resolves
- ✅ **Attestation resealing only via canonical generation script** — `scripts/architecture/wave-10-emit-attestation.ts`
- ✅ **Exactly one canonical owner path per moved concept** — enforced by `check-contract-duplicate-identifiers`
- ✅ **Strict no-logic / no-UI / no-API-change rule** — only deletes pure re-export shims

## Files to Delete (45 total)

### Group A — `src/modules/_trust/**` (8 files + MANIFEST)
- `src/modules/_trust/index.ts`
- `src/modules/_trust/MANIFEST.md`
- `src/modules/_trust/registry/{trust-action-registry,emit-registered}.ts`
- `src/modules/_trust/authority/{authority-evaluator,use-authority}.ts`
- `src/modules/_trust/ui/{TrustBoundary,TrustActionButton,ActionAuthorityPanel}.tsx`

### Group B — `src/modules/_shared/**` (35 files + MANIFEST)
- `src/modules/_shared/{index,pillar-contract,decision-queue}.ts`
- `src/modules/_shared/MANIFEST.md`
- `src/modules/_shared/knowledge/**` (24 shims)
- `src/modules/_shared/ai/**` (5 shims)
- `src/modules/_shared/workspace/workspace-context.tsx`
- `src/modules/_shared/registry/module-registry.ts`

### Group C — `src/platform/contracts/**` (cleanup)
- `src/platform/contracts/pillar-contract.ts` (shim)
- `src/platform/contracts/decision-queue.ts` (shim)
- `src/platform/contracts/MANIFEST.md` (update; folder may keep other platform-local types)

## Execution Steps

1. **Pre-flight reverse-dependency gate**
   - `rg "from ['\"]@/modules/_(shared|trust)" src tests docs scripts .github` → must return 0
   - `rg "from ['\"]@/platform/contracts/(pillar-contract|decision-queue)" src tests docs scripts .github` → must return 0
   - Abort hard if any match found and re-route the consumer first.

2. **Canonical destination proof**
   - For each shim, verify its target file exists. Abort if any miss.

3. **Delete shims** (single atomic operation per group via `rm`)

4. **Update `src/modules/index.ts`** if it re-exports `_shared`/`_trust` (verify and patch).

5. **Post-delete verification**
   - `npx tsc --noEmit` → exit 0
   - `rg` re-runs from step 1 → still 0
   - Key smoke imports: `@/contracts`, `@/platform/trust`, `@/platform/knowledge`, `@/platform/ai`, `@/platform/workspace/workspace-context`, `@/platform/registry/module-registry`, `@/platform/sita/components/sita/EmptyState`

6. **Update governance artifacts**
   - Remove Wave-9 references in `REPOSITORY_CONSTITUTION.md` (mark complete)
   - Update `docs/architecture/CONTRACT_LAYER_OWNERSHIP_MODEL.md` ("shims removed")
   - Regenerate `generated/manifests/contract-ownership-map.json` via `scripts/architecture/checks/check-contract-duplicate-identifiers.ts`
   - Reseal attestation via `scripts/architecture/wave-10-emit-attestation.ts` (only canonical script)

7. **Final report**: write `generated/audits/wave-9-shim-removal-report.md` listing each deleted file and its canonical replacement.

## Safety Guarantees

- **No-logic change**: only deletes pure re-export shims (verified line-by-line in audit).
- **No-UI change**: no React components are altered; only deprecated re-export shims removed.
- **No-API change**: every public symbol remains exported from its canonical path.
- **Rollback**: revert is a single git operation since deletes are atomic.
