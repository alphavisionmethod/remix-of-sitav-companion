# Script, Workflow, and Manifest Audit

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Inheritance:** Extends `generated/architectural-cleanup/SCRIPT_AND_WORKFLOW_CLEANUP_AUDIT.md`

## 1. Scope of this pass

Audit-only. No script/workflow/manifest deletions this pass — all candidates remain in the proven-safe-but-deferred queue per `SAFE_FILE_REMOVAL_POLICY.md`.

## 2. New scripts introduced this pass

| Script | Purpose |
|---|---|
| `scripts/validation/check-runtime-host-boundaries.ts` | Portability boundary enforcement |
| `scripts/validation/check-shell-runtime-portability.ts` | Reverse-import enforcement |
| `scripts/validation/check-edge-function-log-shape.ts` | Canonical log shape detector |
| `scripts/validation/check-mobile-archived-scope.ts` | Mobile reactivation drift |
| `scripts/validation/check-no-kernel-overclaim.ts` | Kernel claim drift |
| `scripts/validation/check-doc-canonicality.ts` | Orphan canonical doc detector |

All 6 wired into:
- `package.json::closure:architecture-hardening:run-all`
- `scripts/architecture/checks/check-os-release-readiness.ts` (BLOCK gates)

## 3. New package.json scripts

| Script | Behavior |
|---|---|
| `closure:architecture-hardening:emit` | Echoes that artifacts are static (markdown + JSON) |
| `closure:architecture-hardening:run-all` | Runs all 6 new validators |

Appended to `final:closure:run-all`.

## 4. Existing scripts (not touched this pass)

The 17 script-system domains and `scripts/registry/` governance are preserved as-is. No legacy script renamed, moved, or deleted.

## 5. Workflows (not touched this pass)

`.github/workflows/` is unchanged. New validators are picked up automatically by the existing release-readiness aggregator workflow.

## 6. Cross-references

- `generated/architectural-cleanup/SCRIPT_AND_WORKFLOW_CLEANUP_AUDIT.md`
- `scripts/registry/script-registry.ts`
- `scripts/registry/script-taxonomy.ts`
