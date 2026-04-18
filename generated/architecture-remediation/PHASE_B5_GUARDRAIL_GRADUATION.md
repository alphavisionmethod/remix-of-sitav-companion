# Phase B5 — Guardrail Graduation Report

**Date:** 2026-04-18
**Status:** ✅ COMPLETE — 3 checks promoted from `warn` → `block`

## Summary

The architecture-remediation guardrails introduced in Phase B2 began as
warn-level so they could be safely landed without breaking the build.
After two stable cycles of zero violations, three checks have been
graduated to **block-level** (process exit 1 on regression).

## Graduated Checks

| Check | Previous | New | Current Value | Budget |
|---|---|---|---|---|
| `check-plane-import-graph.ts` | warn (baseline 5) | **block** | **0** | 0 |
| `check-contract-topology.ts` | warn (budget 250) | **block** | **0** | 0 |
| `check-route-wrapper-usage.ts` | warn | **block** | 0 undeclared | 0 |

Any future regression in these three areas will now fail CI hard,
preventing the architecture from drifting back.

## Remaining Warn-Level Checks

These intentionally stay at warn-level because their underlying values
are non-zero baselines that must be reduced gradually:

| Check | Current | Budget | Reason |
|---|---|---|---|
| `check-service-topology.ts` | 178 | 200 | Service-like utilities in `src/lib/` — long-term migration target |
| `check-plane-transitive.ts` | 12 | 50 | 1-hop shared-module leakage — graph noise |
| `check-route-truth.ts` | 26 | — | Lazy-import false positives, never blocks |
| `check-dead-pages.ts` | 53 | 150 | Pages awaiting nav-registry coverage |

## Final Verification

```
tsc --noEmit                           : 0 errors
check-plane-import-graph (block)       : 0 / 0   OK
check-contract-topology (block)        : 0 / 0   OK
check-route-wrapper-usage (block)      : 0 undeclared   OK
check-service-topology (warn)          : 178 / 200   OK
check-plane-transitive (warn)          : 12 / 50   OK
check-route-truth (warn)               : 26 unresolved (FP-heavy)
check-dead-pages (warn)                : 53 / 150   OK
```

## Deployment Status

- **Build**: GREEN
- **Type check**: GREEN
- **Constitutional checks**: 3 BLOCK + 4 WARN, all passing
- **Plane isolation**: Provably enforced at zero direct violations
- **Contract isolation**: Provably enforced at zero drift
- **Route-wrapper truth**: Fully declared
- **Deployable**: TRUE

## Files Modified in B5

- `scripts/architecture/checks/check-plane-import-graph.ts` (warn → block)
- `scripts/architecture/checks/check-contract-topology.ts` (warn → block)
- `scripts/architecture/checks/check-route-wrapper-usage.ts` (warn → block)
- `generated/plane-import-graph.json` (regenerated)
- `generated/contract-topology-drift.json` (regenerated)
- `generated/route-wrapper-usage.json` (regenerated)
