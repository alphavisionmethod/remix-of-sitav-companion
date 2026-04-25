# Wave 9 — Shim Removal Report

**Date:** 2026-04-25
**Scope:** Physical deletion of all `@deprecated` re-export shims after Wave 1.x–8.x semantic migration.

## Summary

| Metric | Count |
|---|---|
| Shim files deleted | 45 |
| Shim folders deleted | `src/modules/_shared/`, `src/modules/_trust/` (removed entirely) |
| Active consumers re-routed before delete | 1 (`src/modules/index.ts`) |
| `tsc --noEmit` errors after delete | 0 |
| Logic / UI / API behavior change | None |

## Pre-flight verification

- ✅ Reverse-dependency gate: 0 active `from '@/modules/_(shared|trust)'` imports across `src/`, `tests/`, `docs/`, `scripts/`, `.github/`.
- ✅ Reverse-dependency gate: 0 active `from '@/platform/contracts/(pillar-contract|decision-queue)'` imports.
- ✅ Canonical destination proof: all 45 canonical replacement paths verified to exist.
- ✅ EmptyState semantic verification: `@/platform/sita/components/sita/EmptyState` resolves cleanly.

## Files deleted

### `src/modules/_trust/` — 9 files (folder removed)

| Deleted shim | Canonical replacement |
|---|---|
| `src/modules/_trust/index.ts` | `@/platform/trust` |
| `src/modules/_trust/MANIFEST.md` | `src/platform/trust/MANIFEST.md` |
| `src/modules/_trust/registry/trust-action-registry.ts` | `@/platform/trust/registry/trust-action-registry` |
| `src/modules/_trust/registry/emit-registered.ts` | `@/platform/trust/registry/emit-registered` |
| `src/modules/_trust/authority/authority-evaluator.ts` | `@/platform/trust/authority/authority-evaluator` |
| `src/modules/_trust/authority/use-authority.ts` | `@/platform/trust/authority/use-authority` |
| `src/modules/_trust/ui/TrustBoundary.tsx` | `@/platform/trust/ui/TrustBoundary` |
| `src/modules/_trust/ui/TrustActionButton.tsx` | `@/platform/trust/ui/TrustActionButton` |
| `src/modules/_trust/ui/ActionAuthorityPanel.tsx` | `@/platform/trust/ui/ActionAuthorityPanel` |

### `src/modules/_shared/` — 34 files (folder removed)

| Deleted shim | Canonical replacement |
|---|---|
| `src/modules/_shared/index.ts` | `@/platform/*` (decomposed) + new `@/platform/shared-layer` for `SHARED_LAYER` |
| `src/modules/_shared/MANIFEST.md` | `src/platform/MANIFEST.md` |
| `src/modules/_shared/pillar-contract.ts` | `@/packages/contracts/pillar-contract` (public via `@/contracts`) |
| `src/modules/_shared/decision-queue.ts` | `@/packages/contracts/decision-queue` (public via `@/contracts`) |
| `src/modules/_shared/registry/module-registry.ts` | `@/platform/registry/module-registry` |
| `src/modules/_shared/workspace/workspace-context.tsx` | `@/platform/workspace/workspace-context` |
| `src/modules/_shared/ai/index.ts` | `@/platform/ai` |
| `src/modules/_shared/ai/StreamingChatPanel.tsx` | `@/platform/ai/StreamingChatPanel` |
| `src/modules/_shared/ai/ExplainabilityPanel.tsx` | `@/platform/ai/ExplainabilityPanel` |
| `src/modules/_shared/ai/useOrchestrator.ts` | `@/platform/ai/useOrchestrator` |
| `src/modules/_shared/ai/use-orchestrator-stream.ts` | `@/platform/ai/use-orchestrator-stream` |
| `src/modules/_shared/ai/use-explainability.ts` | `@/platform/ai/use-explainability` |
| `src/modules/_shared/knowledge/index.ts` | `@/platform/knowledge` |
| `src/modules/_shared/knowledge/*` (22 files) | `@/platform/knowledge/*` (1:1) |

### `src/platform/contracts/` — 2 files (folder retained, only MANIFEST + future-use)

| Deleted shim | Canonical replacement |
|---|---|
| `src/platform/contracts/pillar-contract.ts` | `@/packages/contracts/pillar-contract` |
| `src/platform/contracts/decision-queue.ts` | `@/packages/contracts/decision-queue` |

## Re-wiring

- `src/modules/index.ts`: switched `import { TRUST_LAYER } from "./_trust"` → `from "@/platform/trust"`, `SHARED_LAYER` → `from "@/platform/shared-layer"`.
- New canonical owner: `src/platform/shared-layer.ts` (the only line of executable code from the old `_shared/index.ts` barrel).
- `scripts/architecture/check-ai-orchestration-coverage.ts`: error message now points to `@/platform/ai`.
- `src/modules/README.md` + 4 pillar MANIFESTs: updated all textual references.
- `src/platform/contracts/MANIFEST.md`: marked Wave 9 complete, removed shim table.

## Post-delete verification

- ✅ `tsc --noEmit` → exit 0
- ✅ Reverse-dep gate re-run → 0 matches
- ✅ Smoke imports verified via tsc graph: `@/contracts`, `@/platform/trust`, `@/platform/knowledge`, `@/platform/ai`, `@/platform/workspace/workspace-context`, `@/platform/registry/module-registry`, `@/platform/sita/components/sita/EmptyState`.

## Generated artifacts

The following generated files contain stale path references and **must be regenerated** by their canonical scripts on the next CI run (no manual editing — per attestation policy):

- `generated/audits/wave-10-architectural-attestation-inventory.json` — regen via `scripts/architecture/wave-10-emit-attestation.ts`
- `generated/audits/contract-layer-hardening-report.md` — regen via `scripts/architecture/checks/check-contract-duplicate-identifiers.ts`
- `generated/manifests/contract-ownership-map.json` — regen via same script

## Safety attestation

- ✅ No-logic change (only re-export shims removed; one constant `SHARED_LAYER` was relocated identically).
- ✅ No-UI change (no React component bodies altered).
- ✅ No-API change (every public symbol still exported from its canonical path).
- ✅ Exactly one canonical owner per concept (verified by tsc + reverse-dep grep).
- ✅ Rollback = single git revert of this commit.