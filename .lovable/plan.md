

# Zero-Regression Architecture Cleanup: Service Consolidation, Archive Resolution, and Domain Boundary Enforcement

## Summary

Three workstreams executed in 5 phases to safely consolidate 37 duplicate service pairs between `src/lib/core-services/` and `src/lib/services/`, resolve ~38 wrapper/deprecated files (19 migrated-wrapper files in `src/domains/types/` plus deprecated service artifacts), and formalize the Advisor/Boardroom/Brain boundary across 30 directories that currently scatter these concepts.

---

## Workstream A -- Consolidate 37 Duplicate Service Pairs

### Current State

37 directory names appear in both `src/lib/core-services/` and `src/lib/services/` (e.g., `brain-core`, `policy-engine`, `workflow-engine`, `receipt-service`, `memory-service`). Per the existing Service Constitution, `core-services/` is the canonical authority layer; `services/` contains the duplicate. Additionally, 19 migrated-wrapper files exist in `src/domains/types/` re-exporting from `src/lib/types/`.

### Deliverables

**New files:**

- `src/lib/architecture/duplicate-service-registry.ts` -- Registry of all 37 pairs with fields: `coreServicesPath`, `servicesPath`, `overlapType` (full/partial/wrapper/naming-only), `canonicalChoice`, `callerCount`, `importers`, `testCoverage`, `riskLevel`, `migrationPhase`, `equivalenceStatus`.
- `src/lib/architecture/service-equivalence-reports.ts` -- For each of the 37 pairs: public API diff, export comparison, side-effect analysis, behavioral equivalence verdict (identical/compatible/divergent).
- `scripts/architecture/checks/check-duplicate-service-pairs.ts` -- CI gate that scans both directories, detects new undeclared overlaps, and blocks merge if an unknown pair appears.
- `scripts/architecture/consolidation/generate-service-wrappers.ts` -- Script that for each validated pair: (1) confirms hash equivalence, (2) replaces the `services/` copy with a `@lovable:migrated-wrapper` re-export pointing to `core-services/`, (3) logs the operation.
- `scripts/architecture/consolidation/verify-no-dangling-imports.ts` -- Post-consolidation verifier that searches the entire codebase for imports of removed paths.

**Modified files:**

- `src/platform/architecture/component-duplication-map.ts` -- Extend `DUPLICATE_FAMILIES` to include service-level pairs (not just component-level).
- `src/lib/architecture/service-inventory.ts` -- Update sample inventory to reflect actual 37 pairs with correct classification and wave assignment.

**Migration model per pair:**

1. Hash-compare canonical (`core-services/X`) vs duplicate (`services/X`)
2. If identical: replace `services/X/index.ts` with wrapper re-export
3. If divergent: document differences, choose canonical behavior, add adapter
4. Search all importers of `services/X`, verify they work through wrapper
5. Add/verify tests around the canonical path
6. After validation window: delete wrapper, update all importers to canonical path
7. Update docs and architecture maps

### Phases

- Wave 1 (low risk, hash-identical): ~20 pairs where files are likely byte-identical wrappers already
- Wave 2 (medium risk, compatible API): ~10 pairs with minor differences
- Wave 3 (high risk, divergent): ~7 pairs requiring behavioral analysis and adapter layers

---

## Workstream B -- Resolve Wrapper/Deprecated Files and Define Retention Policy

### Current State

- 19 `@lovable:migrated-wrapper` files in `src/domains/types/` re-exporting from `src/lib/types/`
- 8 `@deprecated` marked files in `src/lib/`
- 6 files in `scripts/legacy/`
- Component duplication map tracks 14 families (7 MIGRATING, 3 FALSE_POSITIVE, 2 WRAPPED)

### Deliverables

**New files:**

- `src/lib/architecture/archive-inventory.ts` -- Complete inventory of every wrapper, deprecated, and legacy file with fields: `path`, `category` (migrated-wrapper/deprecated/legacy-script/false-positive), `lastModified`, `importerCount`, `safeToDelete`, `retentionReason`, `retentionDeadline`.
- `src/lib/architecture/archive-retention-policy.ts` -- Formal policy defining: retention categories (active-wrapper/deprecated-pending/historical-reference/compliance-hold), maximum retention periods, deletion approval requirements, metadata requirements, naming conventions.
- `scripts/architecture/checks/check-archive-health.ts` -- CI gate tracking: total archived count, files past retention deadline, unresolved items, deletion eligibility.
- `scripts/architecture/consolidation/batch-delete-archived.ts` -- Safe batch deletion script that: validates zero importers via code search, runs build check after each batch, logs every deletion, supports dry-run mode.

**Resolution plan for 19 domain/types wrappers:**

1. Search all importers of each `src/domains/types/*.ts` wrapper
2. For wrappers with zero importers: delete immediately
3. For wrappers with importers: update importers to point to `src/lib/types/` directly, then delete wrapper
4. Validate build after each batch of 5

**Resolution plan for legacy scripts:**

1. `scripts/legacy/migration-tools/consolidate-services.js` -- retain as reference until service consolidation complete, then delete
2. `scripts/legacy/archived-phase-scripts/RENAMING_MAP.md` -- migrate useful content to docs, delete file
3. `scripts/legacy/wrappers/` -- audit contents, delete if empty or superseded

---

## Workstream C -- Formalize Advisor / Boardroom / Brain Boundaries

### Current State

30 directories scatter advisor/boardroom/brain logic across 8 top-level locations: `src/components/`, `src/domains/`, `src/features/`, `src/lib/`, `src/lib/services/`, `src/lib/core-services/`, `src/packages/`, `src/pages/`. The existing `ai-domain-model.ts` defines correct conceptual boundaries but the code does not follow them.

### Deliverables

**New files:**

- `src/lib/architecture/advisor-boardroom-brain-audit.ts` -- Maps all 30 directories to their canonical domain assignment (advisor/boardroom/brain/cross-cutting) with current vs. target location, rename/merge/keep recommendation, and migration priority.
- `docs/ADVISOR_BOARDROOM_BRAIN_BOUNDARY.md` -- Authoritative boundary document with: definitions, ownership rules, what-belongs-where examples, anti-examples, decision tree, public vs. internal terminology guide, route ownership map, service ownership map, component ownership map.
- `src/lib/architecture/ai-concept-decision-tree.ts` -- Programmatic decision framework exported as a typed function that engineers call to classify new AI features.

**Modified files:**

- `src/lib/architecture/ai-domain-model.ts` -- Expand with: code/route mapping audit results, rename/refactor recommendations list, public/internal language alignment map.

**Audit results structure (30 directories mapped):**

```text
ADVISOR domain (canonical home: src/lib/advisors/, src/packages/advisor-*)
  Keep:  src/lib/advisors/
         src/packages/advisor-config/
         src/packages/advisor-runtime-contracts/
         src/packages/contracts/advisor/
         src/pages/advisors/
         src/components/advisors/
  Merge: src/lib/services/advisor-feedback/    -> src/lib/advisors/feedback/
         src/lib/services/advisor-knowledge/   -> src/lib/advisors/knowledge/
         src/lib/services/advisor-memory/      -> src/lib/advisors/memory/
         src/lib/advisor-intelligence/         -> src/lib/advisors/intelligence/
         src/lib/advisor-protocol/             -> src/lib/advisors/protocol/
         src/features/advisors/                -> src/lib/advisors/features/
         src/domains/advisors/                 -> src/lib/advisors/domain/

BOARDROOM domain (canonical home: src/lib/boardroom/)
  Keep:  src/lib/boardroom/
         src/packages/boardroom-contracts/
         src/pages/boardroom/
         src/components/sita/apps/boardroom/
  Merge: src/lib/services/boardroom/           -> src/lib/boardroom/services/
         src/lib/services/boardroom-service/   -> src/lib/boardroom/service/
         src/features/boardroom/               -> src/lib/boardroom/features/
         src/domains/boardroom/                -> src/lib/boardroom/domain/
         src/lib/hooks/boardroom/              -> src/lib/boardroom/hooks/

BRAIN domain (canonical home: src/lib/core-services/brain-core/)
  Keep:  src/lib/core-services/brain-core/
  Merge: src/lib/services/brain-core/          -> wrapper to core-services/brain-core/
```

**Rename recommendations for alignment:**

- `src/components/business/advisor-board/` -- Rename to `advisor-panel/` (it is single-advisor, not boardroom)
- `src/components/admin/boardroom/` -- Keep (admin analytics for boardroom)
- `src/lib/services/boardroom/` vs `src/lib/services/boardroom-service/` -- Consolidate into one

---

## Phase Plan

### Phase 1 -- Discovery and Safety Net

- Generate all three registries/inventories (duplicate pairs, archive inventory, AI concept audit)
- Add CI gates for duplicate detection and archive health
- Add tests around the 10 highest-traffic canonical services before any consolidation
- No destructive changes

### Phase 2 -- Model Clarification

- Publish `ADVISOR_BOARDROOM_BRAIN_BOUNDARY.md`
- Finalize canonical service targets for all 37 pairs
- Define archive retention policy
- Ship decision tree for engineers

### Phase 3 -- Low-Risk Cleanup

- Consolidate Wave 1 duplicate pairs (~20 hash-identical)
- Delete zero-importer domain/types wrappers
- Validate build/tests after each batch

### Phase 4 -- Medium/High-Risk Cleanup

- Consolidate Wave 2-3 duplicate pairs with adapters where needed
- Resolve remaining archive items
- Begin advisor/boardroom directory consolidation (move scattered services into canonical homes)

### Phase 5 -- Hardening

- Remove all compatibility wrappers after validation window
- Enforce new architecture rules via CI
- Publish final cleanup summary with before/after metrics

---

## Technical Details

### New Files (~10)

- `src/lib/architecture/duplicate-service-registry.ts`
- `src/lib/architecture/service-equivalence-reports.ts`
- `src/lib/architecture/archive-inventory.ts`
- `src/lib/architecture/archive-retention-policy.ts`
- `src/lib/architecture/advisor-boardroom-brain-audit.ts`
- `src/lib/architecture/ai-concept-decision-tree.ts`
- `docs/ADVISOR_BOARDROOM_BRAIN_BOUNDARY.md`
- `scripts/architecture/checks/check-duplicate-service-pairs.ts`
- `scripts/architecture/checks/check-archive-health.ts`
- `scripts/architecture/consolidation/generate-service-wrappers.ts`
- `scripts/architecture/consolidation/verify-no-dangling-imports.ts`
- `scripts/architecture/consolidation/batch-delete-archived.ts`

### Modified Files

- `src/platform/architecture/component-duplication-map.ts`
- `src/lib/architecture/service-inventory.ts`
- `src/lib/architecture/ai-domain-model.ts`

### No Database Changes Required

This is purely codebase structure and documentation work.

### Design Direction

All new registries follow existing patterns (`ServiceEntry`, `DuplicateFamily`) with typed enums, exhaustive classification, and exported query functions for CI consumption. CI gates use the established `ViolationCollector` pattern.

