# Architectural Cleanup Inventory

**Generated:** 2026-04-19
**Pass:** 1 (audit + safe additive cleanup; zero deletions)
**Scope rule:** New UI lives ONLY on `AIRuntimeHome.tsx` as a single new tab. No edits to other admin domains.

## Categories of cleanup candidates surfaced by live scan

| Category | Live count | Action this pass |
|---|---:|---|
| Browser-trapped shared hooks | 0 unclassified | Already-closed (Phase 2 complete — see `BROWSER_GLOBAL_ASSUMPTION_AUDIT.md`) |
| Edge functions without canonical structured logging | 142 / 172 (83%) | **Targeted refactor of 8 highest-value handlers** + honest `needs-standardization` classification for the rest. Validator BLOCKs only on regression of the standardized set (not fake-green coverage). |
| Duplicate / stale generated truth files | Audited in `TRUTH_MANIFEST_AUDIT.md` | Relabel/archive only — zero deletes this pass |
| Stale or duplicate `docs/` markdowns | Audited in `DOCUMENTATION_CLEANUP_AUDIT.md` | Audit-only — proven-safe register; no removals |
| Never-called scripts / redundant workflows | Audited in `SCRIPT_AND_WORKFLOW_CLEANUP_AUDIT.md` | Audit-only — proven-safe register |

## What is NOT in scope of this pass

- Mass file deletion (Part 7 safety rule: prove non-use first)
- Touching sealed `supabase/migrations/` history
- Modifying `archive/*` directories
- Refactoring all 142 unstructured edge functions in one pass (risk-managed: 8 highest-value only)
- Re-platforming any runtime-host adapter pieces (Phase 2 already complete in prior closure)

## Honest limits surfaced

1. **Edge-function logging coverage** will rise from 30/172 (17%) to 38/172 (22%) after the targeted refactor — the rest are honestly classified as `needs-standardization` (high-value to do) or `passthrough-acceptable` (low-value CRUD/proxy).
2. **Truth-manifest reconciliation** is relabel-only; no canonical files removed.
3. **Docs/scripts audits** are evidence-only; removal requires a separate validated pass.
4. **Carryover** — prior Economic-Trust-Future closure (DB tables, runtime enforcement, microcopy edits) was abandoned mid-flight before its `generated/economic-trust-and-future-closure/` directory was created. **Out of scope for this prompt** — flagged as known carryover.

## Cross-references

- Dependency map: `CLEANUP_DEPENDENCY_MAP.md`
- Removal safety policy: `FILE_REMOVAL_SAFETY_POLICY.md`
- Per-area audits: 8 sibling markdowns in this directory
