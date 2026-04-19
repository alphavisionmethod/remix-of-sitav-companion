# Documentation Cleanup Audit

**Generated:** 2026-04-19
**Pass scope:** **Audit-only.** No documentation files removed, renamed, or relabeled this pass.

## Method

`find docs -name '*.md' -type f` enumerates the canonical documentation tree. Each file is checked for:

1. Direct cross-references in `README.md` and root `*.md`
2. Cross-references from sibling `docs/**/*.md`
3. Reference from `package.json` script descriptions
4. Reference from generated artifacts

## Categories surfaced

| Category | Action |
|---|---|
| Active canonical (referenced by ≥1 consumer) | Preserve |
| Likely-superseded (not referenced + content overlaps with newer canonical) | **Audit only** — record candidate, do not remove |
| Future / archived (clearly future-vision content) | Recommend relabel with explicit `Status: Future Vision` header in subsequent pass |
| Truly orphaned (zero refs, no overlap) | Recommend archive in subsequent pass after second-pass verification |

## Why no removal this pass

`FILE_REMOVAL_SAFETY_POLICY.md` requires all 9 dependency checks green plus a verified build/render/contract pass for removal. This pass executes only the audit step. The proven-safe register produced here becomes input for any future removal pass.

## Recommendation register

Documentation candidates flagged for **future** review (no action this pass):
- Markdowns in `docs/` whose content is fully superseded by `generated/` artifacts.
- Markdowns predating major architecture closures (e.g. pre-Manifest Truth Framework) that no current generator references.

Each future-pass review will:
1. Re-run the 9-check policy live.
2. Compare current content against the canonical generator output.
3. Either archive (preferred) or delete (only after second-pass verification + build/render/contract green).

## Validator wiring

`scripts/validation/check-no-stale-canonical-docs.ts` reads `architectural-cleanup-status.json` and BLOCKs **only on regression** of any docs already labeled `canonical` (i.e., a doc previously canonical losing its canonical label without a reconciliation entry).
