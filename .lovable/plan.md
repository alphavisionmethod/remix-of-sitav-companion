

# Fix: TS2552 — Double-Prefixed Type Names in Cost Circuit Breaker

## Root Cause

`src/lib/services/ai-economics/index.ts` exports `BudgetConfig` and `BudgetPeriod`. `src/lib/services/ai-economics/cost-circuit-breaker.ts` also exports `BudgetConfig` (different interface, same name). Both files are re-exported through `src/lib/services/index.ts`. The build system auto-prefixes the child module's exports with `Cost` to disambiguate, turning `CostBreakerState` into `CostCostBreakerState` and `CostBudgetPeriod` into `CostCostBudgetPeriod`.

## Fix (1 file edit)

**`src/lib/services/ai-economics/cost-circuit-breaker.ts`** — Rename the 3 conflicting types:

| Current Name | New Name | Reason |
|---|---|---|
| `CostBreakerState` | `BreakerState` | Avoids `Cost` + `Cost` doubling |
| `CostBudgetPeriod` | `BreakerBudgetPeriod` | Conflicts with parent's `BudgetPeriod` |
| `BudgetConfig` | `BreakerBudgetConfig` | Conflicts with parent's `BudgetConfig` |

Update all internal references in the same file (lines 12, 23, 28, 53, 101, 212 and the `BudgetConfig` interface name). No other files import these types directly — they are only consumed internally.

