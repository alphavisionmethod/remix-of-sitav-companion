# Safe File Removal Policy

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Inheritance:** Extends `generated/architectural-cleanup/FILE_REMOVAL_SAFETY_POLICY.md`

## 1. Removal contract (unchanged from prior closure)

Before deleting any file, the following must be proven:

1. ❌ **No imports** — verified via `code--search_files` for the file's basename
2. ❌ **No route references** — verified against `route-registry.ts`
3. ❌ **No workflow references** — verified against `.github/workflows/`
4. ❌ **No script references** — verified against `scripts/`
5. ❌ **No doc references** — verified against `docs/` and `generated/`
6. ❌ **No generator references** — verified against `manifest-registry.json` source inputs
7. ❌ **No dynamic lookup references** — grep for the basename string across all `.ts`/`.tsx`
8. ❌ **No admin navigation references** — verified against `AdminNav` and hub maps
9. ❌ **No release/gate references** — verified against `check-os-release-readiness.ts`

## 2. Removal status this pass

**ZERO files deleted.** Closure is strictly additive.

All "removal candidates" identified in the original `FILE_REMOVAL_SAFETY_POLICY.md` remain in the deferred queue. Any future deletion pass must re-run all 9 proofs and emit a per-file removal receipt.

## 3. Why additive-only this pass

The prompt's invariant ("only on the admin AI engineer team", "no UI rewrites", "no edits to other admin domains") implies that deletions targeting non-admin-AI surfaces are out of scope. Audit-only is the safe default.

## 4. Future deletion process

When the next removal pass runs:

1. For each candidate, run all 9 proofs
2. Emit per-file removal receipt to `generated/file-removal-receipts/<filename>.md`
3. Update `generated/architectural-cleanup/architectural-cleanup-status.json::removedThisPass`
4. Run full release-readiness aggregator
5. Verify zero regressions in route/render/edge-function/CI/admin nav

## 5. Cross-references

- `generated/architectural-cleanup/FILE_REMOVAL_SAFETY_POLICY.md` — canonical policy
- `scripts/validation/check-safe-cleanup-regressions.ts` (existing) — regression detector
