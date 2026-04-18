# SITA OS — Hardening Status (Wave 4)

Generated: 2026-04-18

## Active CI Guardrails

| Check | File | Mode | Purpose |
|---|---|---|---|
| Ownership drift | `scripts/architecture/checks/check-lib-ownership-drift.ts` | warn (tracked) | Detects new top-level entries in `src/lib/`. |
| Legacy wrapper usage | `scripts/architecture/checks/check-legacy-wrapper-usage.ts` | warn (tracked) | Counts every consumer import targeting non-allowlisted `src/lib/*`. Target: trend to 0. |
| Residual canonicality | `scripts/architecture/checks/check-residual-lib-canonicality.ts` | **error** (NEW) | Fails CI when **new** files (not pre-existing in baseline) are added under `src/lib/` outside the Option B allowlist. |

## Wave 4 additions

- ✅ `check-residual-lib-canonicality.ts` — error gate against regressions.

## Pending (Wave 5)

- Promote ownership-drift and legacy-wrapper-usage from `warn` to `error` once decomposition migration completes (top-level count from 103 → ≤ allowlist size).
- Add `check-misplaced-runtime-logic.ts`, `check-misplaced-data-logic.ts`, `check-misplaced-domain-logic.ts` once domain migration backlog finishes.
