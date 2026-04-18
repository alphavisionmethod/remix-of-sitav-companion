

The user wants the post-decomposition remediation pass for `src/lib`. This is the second-round closure work after the initial migration. Looking at the build errors and current state:

1. There are still active build errors with `src/domains/engines/shared/aging.ts` and several engine type imports.
2. ~1,499 legacy wrapper imports remain across the codebase.
3. ~1,172 deprecated wrapper shims exist in `src/lib`.
4. 14 known duplicate fingerprint groups (core-services vs services).
5. No `generated/lib-remediation/` artifacts exist yet.

I need to present a focused, phased plan in chat mode (read-only).

# SITA OS — `src/lib` Post-Decomposition Remediation Plan

## Current State Snapshot

| Metric | Value |
|---|---|
| Files migrated to canonical roots | ~1,000 |
| Wrapper shims remaining in `src/lib` | ~1,172 |
| Active legacy wrapper imports | 1,499 |
| Known duplicate fingerprint groups | 14 (core-services ↔ services) |
| Active TypeScript build errors | 43 (engine type resolution + arithmetic) |
| Existing remediation reports | 0 |

## Active Build Blockers (must fix first)

The errors all trace to two root causes:

1. **`src/domains/engines/shared/aging.ts` line 7** imports `../../types/meta-governance.types` — that file IS the wrapper, so it should import directly from `@/lib/types/meta-governance.types` (or the canonical resolved type).
2. **`readiness-engine.ts` / `invisible-labor-engine.ts`** have `unknown`-typed arithmetic. Root cause: `Object.entries(record)` returns `unknown` values when the source type isn't properly threaded through the wrapper chain. Wrappers re-export `* from "@/lib/types/..."` but type narrowing context can be lost.

These will be fixed in Phase 0.

## Remediation Phases

### Phase 0 — Unblock the build (immediate)
- Rewrite `src/domains/engines/shared/aging.ts` to use absolute `@/lib/types/...` import (avoids relative path through wrapper folder).
- Fix `readiness-engine.ts` and `invisible-labor-engine.ts` `unknown` type issues by adding explicit type assertions on `Object.entries`/record iteration where needed.
- Confirm all 19 wrapper files in `src/domains/types/` resolve via tsconfig path mapping.

### Phase 1 — Resolve 14 duplicate fingerprint groups
Each pair (e.g., `src/lib/core-services/approval-engine/*` vs `src/lib/services/approval-engine/*`) is byte-identical. Plan:
- Pick canonical home per architecture rules: approval-engine → `src/platform/governance/`; brain-core → `src/platform/orchestration/`; conscience-gate → `src/platform/policy/`.
- Move canonical implementation; replace BOTH old paths with thin wrappers.
- Run `rewire-consumers` to update all importers.

### Phase 2 — Consumer rewire wave 4 (target: 1,499 → <500)
- Re-run universal `rewire-consumers-wave3.ts` engine across all `// @lovable:migrated-wrapper` files.
- Manually rewire the top 30 most-imported legacy paths (from `legacy-wrapper-usage-report.json`).

### Phase 3 — Wrapper removal pass
- For every wrapper with **0 remaining consumers**, delete the wrapper file.
- Update `src-lib-wrapper-map.json` with `removed` status.
- Target: reduce wrapper count from ~1,172 toward <300.

### Phase 4 — Finish ownership migration for unclassified `src/lib` residents
Run `classify-services-unclassified.ts` for any remaining un-migrated subtrees:
- `src/lib/app-platform/` → `src/platform/app-platform/`
- `src/lib/storage/` → `src/data/persistence/`
- `src/lib/customer-journey/` → `src/domains/customer-journey/`
- `src/lib/integrations/` → `src/integrations/external/`
- Any leftover engines → `src/domains/engines/`

### Phase 5 — Stale reference cleanup
Repo-wide grep + rewrite for remaining old-path imports in:
- `scripts/**` (especially `scripts/architecture/checks/`)
- `src/test/**` and `src/__tests__/**`
- `docs/**` markdown references
- Admin dashboards reading from `generated/` paths
- CI workflows in `.github/`

### Phase 6 — Generate remediation report bundle
Create `generated/lib-remediation/` with all 12 required artifacts:
- `SRC_LIB_REMEDIATION_PLAN.md`
- `SRC_LIB_WRAPPER_REMOVAL_STATUS.md`
- `SRC_LIB_DUPLICATE_RESOLUTION_REPORT.md`
- `SRC_LIB_REMAINING_LEGACY_JUSTIFICATION.md`
- `SRC_LIB_CANONICAL_OWNERSHIP_FINAL.md`
- `SRC_LIB_STALE_REFERENCE_CLEANUP.md`
- `SRC_LIB_HARDENING_STATUS.md`
- `SRC_LIB_FINAL_VERIFICATION_RESULTS.md`
- 4 corresponding `.json` machine-readable companions.

### Phase 7 — Add hardening guardrails
New CI checks:
- `check-residual-lib-canonicality.ts` — fails if any non-allowlisted file appears in `src/lib/`.
- Tighten existing `check-lib-ownership-drift.ts` to error (not warn) on new additions.
- Wire all 6 lib-decomposition checks into `check-os-release-readiness.ts` aggregator as **error gates** (currently advisory).

### Phase 8 — Define final role of `src/lib`
Adopt **Option B** (narrow shared utility layer):
- Allowed: `utils.ts`, `utils/`, `internal/` (migration bridges), `hooks/` (legacy hooks pending move).
- Everything else → wrapper or removed.
- Update `docs/architecture/CANONICAL_OWNERSHIP_MODEL.md` to lock this in.

### Phase 9 — Final verification
- `tsc --noEmit` clean
- All architecture checks green
- `legacy-wrapper-usage-report.json` shows downward trend confirmed
- All 12 remediation reports generated and consistent

## Expected End State

| Metric | Before | After (target) |
|---|---|---|
| TS errors | 43 | 0 |
| Duplicate groups | 14 | 0 |
| Wrapper shims | ~1,172 | <300 |
| Legacy imports | 1,499 | <500 |
| `src/lib/` top-level entries | 30+ | ≤4 (allowlisted) |
| Remediation reports | 0 | 12 |
| Hardening checks (errors not warnings) | 0 | 6 |

## Technical Notes

- All wrapper files use the `// @lovable:migrated-wrapper` marker, which the universal rewire engine auto-detects — no manual config needed per file.
- Phase 1 duplicate consolidation is safe because fingerprints are byte-identical (verified in `SRC_LIB_DUPLICATE_AND_AMBIGUOUS_MODULES.md`).
- Phase 3 wrapper removal is gated on zero-consumer detection; no aggressive deletion.
- The `tsconfig.json` `paths` mapping for `@/*` already resolves both `src/lib/*` and canonical roots, so wrapper indirection has no runtime cost — only build-time.
- No database migrations required; this is pure code architecture work.

