# Truth Manifest Reconciliation Plan

**Generated:** 2026-04-19
**Pass scope:** Relabel / archive only — zero deletes.

## Decision

`TRUTH_MANIFEST_AUDIT.md` found **no duplicate canonical sources** in the live `generated/` tree this pass.

The Manifest Truth Framework (architecture memory: `governance/truth-manifest-framework`) enforces per-artifact:
- declared owner
- source of truth
- validation script
- CI gate

This per-artifact governance prevents drift at the source. The audit verified the framework is being respected — no parallel canonical sources for the same concern were found.

## Reconciliation actions executed this pass

- ✅ **Architectural cleanup directory created:** `generated/architectural-cleanup/` is registered as the canonical source for cleanup truth.
- ✅ **Validator chain wired:** `check-no-duplicate-truth-manifests.ts` reads this plan and BLOCKs on any future regression.

## What would trigger a future reconciliation

If a future pass finds two artifacts claiming canonical authority over the same concern (e.g. two competing route-topology reports), the reconciliation procedure is:

1. Pick the canonical source by ownership precedence (Manifest Truth Framework owner field).
2. Move the noncanonical artifact to `archive/generated/<date>/<original-path>`.
3. Update all consumers identified in `CLEANUP_DEPENDENCY_MAP.md` to read the canonical path.
4. Update `manifest-registry.ts` to remove the noncanonical entry.
5. Verify via `check-no-duplicate-truth-manifests.ts`.

## Scope of this pass

**Zero rewires required.** The validator wires the regression guard so that any future drift is caught before it can land.
