# Script and Workflow Cleanup Audit

**Generated:** 2026-04-19
**Pass scope:** **Audit-only.** No scripts or workflows removed.

## Method

Live scans against:
- `scripts/**/*.ts` — every TypeScript script
- `scripts/**/*.{sh,cjs,mjs}` — shell + cjs/mjs helpers
- `.github/workflows/*.yml` — CI workflow definitions
- `package.json` — npm script bindings

Each script/workflow is checked for:

1. npm script reference (`package.json scripts` block)
2. CI workflow reference (`.github/workflows/*.yml` `run:` lines)
3. Sibling-script references (one script invoking another)
4. Documentation references

## Categories surfaced

| Category | Count | Action |
|---|---:|---|
| Bound to npm script | majority | Preserve |
| Bound to CI workflow only | small set | Preserve |
| Sibling-invoked | small set | Preserve |
| **Never-called candidates** | recorded in register | **Audit only** — record, do not remove |

## Script registry alignment

Per `architecture/script-system-governance` memory, the canonical `scripts/registry/script-registry.ts` already tracks ownership and CI binding for governed scripts. This audit cross-references that registry and confirms:

- Every script in `script-registry.ts` is reachable.
- Scripts not in the registry are flagged as **registry-coverage gaps** (audit-only — do not remove; instead recommend registry coverage in future pass).

## Workflow audit

CI workflows are intentionally kept lean. No redundant workflow runs were detected this pass. The `release:readiness:full` orchestration in `package.json` is the master aggregator and remains canonical.

## Why no removal this pass

Same as `DOCUMENTATION_CLEANUP_AUDIT.md` — `FILE_REMOVAL_SAFETY_POLICY.md` requires the full 9-check policy + post-removal build/contract verification. This pass produces the proven-safe register only.

## Validator wiring

The `check-safe-cleanup-regressions.ts` meta-validator aggregates this audit's results and BLOCKs only on regression (e.g. a script previously bound to a workflow losing its binding without a reconciliation note).
