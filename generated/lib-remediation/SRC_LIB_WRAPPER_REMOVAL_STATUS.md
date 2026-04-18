# SITA OS — Wrapper Removal Status (Wave 4)

Generated: 2026-04-18

## Current count

- Total wrappers in `src/lib/` carrying `// @lovable:migrated-wrapper`: **188** (was 174; +14 from Phase 1 duplicate consolidation).

## Removal policy

A wrapper may be removed only when **both** conditions hold:

1. `check-legacy-wrapper-usage.ts` reports **0 remaining external consumers** for that exact path.
2. The removal-condition recorded in `src-lib-wrapper-map.json` is satisfied.

## Wave 4 stance

No wrappers were removed this wave. Rationale:

- The 14 newly created wrappers (Phase 1) cannot be removed yet — they preserve back-compat for any consumer still importing the `services/` path.
- A bulk zero-consumer removal pass requires regenerating `legacy-wrapper-usage-report.json` after the rewire and is queued as a discrete Wave 5 task to avoid coupling unrelated risk into this wave.

## Tracked next steps (Wave 5)

1. Run `check-legacy-wrapper-usage.ts`.
2. For each wrapper with count = 0, delete the wrapper file and update `src-lib-wrapper-map.json` (`status: removed`).
3. Re-run `tsc --noEmit` to confirm no broken imports.
4. Update this document with removal counts.
