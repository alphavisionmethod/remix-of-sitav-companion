

# Compute Governance — Remaining Gaps & Fixes

## What's Already Solid (no changes needed)
- All 6 backend engine files in `src/lib/compute-governance/` (2,000+ lines)
- All 10 core systems from Part 3 exist as pure logic
- 11-tab Compute Governance Board (CG01–CG11) with full UI
- 5 React Query hooks in `use-compute-governance.ts`
- Edge function `check-ai-budget` deployed
- User-facing `MyPlanUsage.tsx` (395 lines)
- DB functions: `check_ai_budget_policies`, `update_ai_budget_usage`, `aggregate_ai_daily_spend`

## Gaps Found

### 1. `classifyTask()` returns incomplete output
The spec (3.2) requires: `taskClass`, `estimatedCostBand`, `allowedModelTiers`, `maxContextBudget`, `syncOrAsyncPreference`, `escalationPolicy`. Currently it only returns a `CostClass` string.

**Fix:** Create a `TaskClassification` interface and a richer `classifyTaskFull()` function that returns all 6 fields by combining `classifyTask` + `COST_CLASS_SPECS` lookup.

### 2. CG sub-components use only hardcoded mock data
`CG04MarginProtectionTab`, `CG06MissionCostTab`, and `CG10PricingSimulatorTab` have zero hook integration — they render inline mock arrays only. The main board partially uses hooks but CG01 still has inline hardcoded spend-by-plan, spend-by-workspace, cache stats, and optimization suggestions.

**Fix:** Wire these components to the existing governance hooks. Add a `useMissionCostData()` hook and a `useMarginProtectionFeed()` hook. Keep mock data as demo-mode fallback.

### 3. JSX rendering bug in CG07
Line 702 has broken nested JSX: `<p>...{<p>...</p>}%</p>` — the Fair Use Pressure "Premium Escalation" card renders incorrectly.

**Fix:** Remove the nested `<p>` tag and fix the display.

### 4. No client-side AI gateway wrapper
The `check-ai-budget` edge function exists but nothing in the app calls it before AI invocations. There's no `enforceAIBudget()` wrapper.

**Fix:** Create `src/lib/ai-gateway/budget-gate.ts` with an `enforceAIBudget(capabilityKey, estimatedCost)` function that calls the edge function and returns allow/deny/downgrade. Wire it into existing AI invocation paths.

### 5. Missing `useMissionCostData` and `useMarginProtectionFeed` hooks
CG06 and CG04 need hooks to query `ai_usage_ledger` grouped by mission/workflow and to track margin protection actions.

**Fix:** Add these 2 hooks to `use-compute-governance.ts`.

## Files Changed

| File | Action |
|------|--------|
| `src/lib/compute-governance/model-routing-engine.ts` | Edit — add `TaskClassification` interface and `classifyTaskFull()` |
| `src/hooks/use-compute-governance.ts` | Edit — add `useMissionCostData()` and `useMarginProtectionFeed()` hooks |
| `src/lib/ai-gateway/budget-gate.ts` | Create — client-side budget enforcement wrapper |
| `src/components/admin/compute-governance/CG04MarginProtectionTab.tsx` | Edit — wire to `useMarginProtectionFeed()` with demo fallback |
| `src/components/admin/compute-governance/CG06MissionCostTab.tsx` | Edit — wire to `useMissionCostData()` with demo fallback |
| `src/pages/admin/ComputeGovernanceBoard.tsx` | Edit — fix CG07 JSX bug (line 702), wire CG01 metrics to hooks |

## Technical Notes
- No new DB tables or migrations needed — all existing tables are sufficient
- No duplication — all new code calls existing engine functions
- Demo fallback preserved everywhere via `useDataMode()`
- Budget gate uses `supabase.functions.invoke()` per edge function best practices

