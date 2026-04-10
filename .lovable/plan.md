
# AI Economics & Compute Governance — Full Wiring Plan

## Current State

**Already built and solid:**
- Backend engines: 6 files in `src/lib/compute-governance/` (model-routing, budget-policy, plan-entitlements with 5 tiers, context-compression, margin-protection, mission-cost-tracker) — ~2,000 lines of pure logic
- Admin board: `ComputeGovernanceBoard.tsx` — 1,026 lines, 11 tabs (CG01–CG11)
- Admin AIG pages: 9 pages (AIG01–AIG09) for providers, models, routing, budget, receipts, launch truth, diagnostics, runtime verification
- DB tables: `ai_budget_policies`, `ai_usage_ledger`, `ai_token_usage`, `user_ai_budgets`, `ai_model_registry`, `ai_provider_registry`, `ai_capability_routing`
- DB functions: `check_ai_budget_policies`, `update_ai_budget_usage`, `aggregate_ai_daily_spend`
- User-facing: `AIEconomicsPage.tsx` (277 lines) — basic spend/routing/anomaly view

**What is missing:**

1. **User-facing "My Plan & Usage" page** — Users have no page showing their plan tier, capacity language, usage bars, upgrade path, or "deep mode" button. The spec demands users see capability language (not tokens).

2. **ComputeGovernanceBoard uses hardcoded demo data** — All 11 tabs render static arrays. None query the real `ai_usage_ledger`, `ai_budget_policies`, or `user_ai_budgets` tables.

3. **No budget enforcement edge function** — The DB function `check_ai_budget_policies` exists but nothing calls it from the app before AI invocations. Need a lightweight edge function that gates AI calls.

4. **No real-time margin tracking hook** — The margin-protection engine exists as pure functions but no React hook queries real spend data to compute live margins.

5. **AIEconomicsPage uses in-memory demo seeding** — It calls `engines.tokens.recordUsage()` with fake data instead of reading from `ai_usage_ledger`.

## Plan

### 1. Create user-facing "My Plan & AI Usage" page
**New file:** `src/pages/settings/MyPlanUsage.tsx`

Shows:
- Current plan tier with capability language (from `plan-entitlements.ts`)
- Usage bars: deep reasoning minutes, connected systems, active automations, advisor sessions, self-healing scope
- "Deep Mode" trigger button for premium reasoning
- Upgrade path with upsell add-ons
- Fair use status indicator
- No token counters — only capacity language

Wire to route `/settings/plan-usage` in `App.tsx`.

### 2. Wire ComputeGovernanceBoard to real DB data
**Edit:** `src/pages/admin/ComputeGovernanceBoard.tsx`

Replace hardcoded demo arrays with React Query hooks that read:
- `ai_usage_ledger` → spend by model, domain, capability
- `ai_budget_policies` → active policies and thresholds
- `user_ai_budgets` → budget utilization
- `ai_token_usage` → token-level breakdown
- Use `aggregate_ai_daily_spend` RPC for aggregated views

Keep demo data as fallback when no real data exists (demo mode).

### 3. Create compute governance React hooks
**New file:** `src/hooks/use-compute-governance.ts`

Hooks:
- `useComputeBudgetStatus()` — reads `user_ai_budgets` + `ai_budget_policies`, returns budget health
- `useAISpendSummary(period)` — calls `aggregate_ai_daily_spend` RPC
- `useMarginSnapshot()` — computes live margin from spend data using margin-protection engine
- `useFairUseStatus(planTier)` — evaluates fair use from real usage
- `useModelRoutingStats()` — aggregates routing decisions from `ai_usage_ledger`

### 4. Create budget enforcement edge function
**New file:** `supabase/functions/check-ai-budget/index.ts`

Before any AI invocation, the app calls this function with `{ capability_key, estimated_cost_usd }`. It:
- Calls DB function `check_ai_budget_policies`
- Returns `{ allowed, should_downgrade, fallback_model_id, reason }`
- Client-side wrapper in `src/lib/core-services/ai-gateway.ts` calls this before routing

### 5. Wire AIEconomicsPage to real data
**Edit:** `src/pages/AIEconomicsPage.tsx`

Replace the in-memory `useDemoEconomics()` seeding with the new `useAISpendSummary` and `useModelRoutingStats` hooks. Keep demo fallback for empty state.

### 6. Add sidebar navigation for user plan page
**Edit:** `src/components/layout/AppSidebar.tsx`

Add "Plan & Usage" link under Settings group pointing to `/settings/plan-usage`.

## Files Changed

| File | Action |
|------|--------|
| `src/pages/settings/MyPlanUsage.tsx` | Create — user-facing plan & capacity page |
| `src/hooks/use-compute-governance.ts` | Create — 5 hooks for real data |
| `supabase/functions/check-ai-budget/index.ts` | Create — budget enforcement edge function |
| `src/pages/admin/ComputeGovernanceBoard.tsx` | Edit — wire to real DB queries |
| `src/pages/AIEconomicsPage.tsx` | Edit — wire to real data hooks |
| `src/components/layout/AppSidebar.tsx` | Edit — add Plan & Usage nav link |
| `src/App.tsx` | Edit — add route for MyPlanUsage |

## Technical Notes
- All existing backend logic (routing engine, budget engine, plan entitlements, compression, margin protection, mission cost tracker) is reused — no duplication
- All existing DB tables and functions are reused — no new migrations needed
- Demo mode fallback preserved everywhere via `useDataMode()`
- Edge function uses existing `check_ai_budget_policies` DB function
