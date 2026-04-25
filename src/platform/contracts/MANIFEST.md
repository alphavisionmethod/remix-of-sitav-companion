# `src/platform/contracts/` — Deprecated Shim Folder

**Status:** Frozen (Wave 1.2). No new files may be added here.

## Why this folder is now deprecated

Wave 1.2 promoted both files originally housed here (`pillar-contract.ts`, `decision-queue.ts`) to their canonical app-wide home at `src/packages/contracts/`. They were each imported by ≥2 distinct top-level layers (`modules/{business,concierge,finance,health}` + `platform/trust`) and therefore satisfy the **Promotion Rule** of the Contract Layer Ownership Model — making them app-wide public contracts, not platform-local ones.

## Current contents

| File | Purpose |
|---|---|
| `pillar-contract.ts` | `@deprecated Wave 1.2` re-export shim → `@/packages/contracts/pillar-contract` |
| `decision-queue.ts` | `@deprecated Wave 1.2` re-export shim → `@/packages/contracts/decision-queue` |

Both shims are removed in Wave 9 (alongside the rest of the deprecated-shim cohort).

## What lives where now

| Need | Canonical path | Public import |
|---|---|---|
| App-wide cross-pillar contract | `src/packages/contracts/<file>.ts` | `@/contracts` |
| Per-family contract (ai/finance/etc.) | `src/packages/<family>-contracts/<file>.ts` | `@/contracts` (cascaded) or direct `@/packages/<family>-contracts/...` if collision-tagged |
| Domain-native model/type | `src/domains/<domain>/...` or `src/domains/types/<file>.types.ts` | `@/domains/types` |
| Truly system-internal contract | Co-locate inside the owning system folder; do **not** add to this folder. | Internal to `@/platform/<system>/...` only |

See `docs/architecture/CONTRACT_LAYER_OWNERSHIP_MODEL.md` for the full Promotion Rule and Duplication Rule.

## Enforcement

- Adding any non-shim file here trips `scripts/architecture/checks/check-platform-local-contract-scope.ts` (BLOCK).
- Cross-layer imports of files in this folder (other than the deprecated shims) trip the same validator (BLOCK).