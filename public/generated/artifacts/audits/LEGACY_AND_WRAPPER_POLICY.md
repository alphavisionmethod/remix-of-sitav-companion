# SITA OS — Legacy and Wrapper Policy

> Defines how `src/legacy/` and compatibility wrappers are governed during and after the `src/lib` decomposition.

## `src/legacy/` is NOT a trash folder

Every file in `src/legacy/` must:

1. Have an entry in `generated/lib-decomposition/SRC_LIB_WRAPPER_MAP.md` (or successor) documenting **why** it is legacy.
2. Be classified into a sub-folder:
   - `src/legacy/canonical-backend/` — superseded backend experiments
   - `src/legacy/simulation/` — simulation/experimental code not yet promoted
   - `src/legacy/unclassified/` — flagged by the audit for manual review
   - `src/legacy/deprecated-bridges/` — temporary compatibility shims pending removal
3. Have a removal condition (e.g. "remove after Wave 9 verification" or "remove after consumers migrate to `src/platform/governance/`").

Files cannot live in `src/legacy/` indefinitely without a tracked removal target.

## Wrapper shim policy

A **wrapper shim** is a file at the *old* `src/lib/...` path whose only contents are re-exports from the canonical new home, plus a `@deprecated` JSDoc.

### Required wrapper shape

```ts
/**
 * @deprecated Moved to `@/platform/policy/policy-engine` in Wave 4.
 * This wrapper exists for back-compat and will be removed after consumers migrate.
 * Tracked in: generated/lib-decomposition/src-lib-wrapper-map.json
 */
export * from "@/platform/policy/policy-engine";
```

### Rules

- **≤ 25 lines of code.** Enforced by `scripts/architecture/checks/check-deprecated-wrappers.ts`.
- **Only `import` and `export` statements.** No logic, no defaults wrapping calls, no transformations.
- **Must reference its canonical** (the audit script verifies this).
- **Must be tracked** in `src-lib-wrapper-map.json` with: `oldPath`, `canonicalPath`, `wave`, `removalCondition`.
- **Must not become a second canonical location.** If two consumers disagree on the path, the wrapper wins back-compat but the canonical is the only one allowed in new code.

### Removal

A wrapper is removed when:

1. `scripts/architecture/checks/check-legacy-wrapper-usage.ts` reports zero remaining external consumers, AND
2. The removal-condition expression in `src-lib-wrapper-map.json` is satisfied.

Removal happens in the next migration wave following zero-consumer detection — not silently mid-wave.

## Allowed `src/lib/` residents (post-decomposition)

Only these may live under `src/lib/`:

- `src/lib/utils.ts` — the 763-importer hot-path utility
- `src/lib/utils/` — true shared helpers (string, format, time, …)
- `src/lib/internal/` — bridges/wrappers explicitly created by the migration

Anything else added to `src/lib/` after Wave 8 fails CI via `check-lib-ownership-drift.ts`.

## Audit cadence

The wrapper map is regenerated on every wave. The `os-release-readiness` aggregator reports wrapper count as a release-health metric — declining count over time is a positive signal; growing count blocks release.
