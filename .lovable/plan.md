

# SITA OS — Budget Policy + Admin UI Enhancement Plan

## Current State
All 10 DB tables, 4 views, 3 DB functions, RLS policies, and 9 admin pages (AIG01-AIG09) exist. The budget policy schema is 100% complete (all columns per spec including `critical_threshold_percent`). The `check_ai_budget_policies` DB function handles all scope types, threshold checks, premium blocking, fallback, and alerting.

## Gaps Found

### Gap 1 — Missing dedicated Usage Ledger Explorer page
The spec requires **AIG05 — AI Usage Ledger Explorer** as a separate page showing recent invocations with filters for failures, fallbacks, demo mode, premium, and blocked requests. Currently AIG05 is the Receipts page (which should be AIG06 per spec). No dedicated ledger explorer exists.

### Gap 2 — AIG04 Budget Center lacks usage-ledger-based analytics
The spec requires: spend by capability, spend by model, premium vs economy split, blocked/downgraded request counts, and threshold progress bars. Currently AIG04 only shows legacy `ai_cost_ledger` data and portfolio allocations.

### Gap 3 — No consolidated top metrics bar
The spec requires top-level metric cards: providers healthy, active models, capabilities routed, budget burn today, premium spend %, fallback events today, failed invocations today, public-safe AI capabilities count. These don't exist as a unified section.

## Implementation Plan

### Step 1 — Create AIG05 Usage Ledger Explorer (new page)
New file: `src/pages/admin/AIG05UsageLedgerExplorer.tsx`
- Full table of `ai_usage_ledger` with all spec columns: timestamp, capability, provider, model, status, token counts, estimated cost, latency, user/workspace, mode
- Filter buttons: All, Failures, Fallbacks, Demo Mode, Premium, Blocked
- Summary cards: total invocations, success rate, total cost, avg latency, blocked count
- Uses `getUsageLedger()` from existing budget.service

### Step 2 — Renumber existing pages in SubNav
Update `src/components/admin/AIGSubNav.tsx`:
- Insert "Usage Ledger" between Budget and Receipts
- Add route `/admin/aig/usage-ledger`
- Rename existing Receipts label to "Receipts/Traces" (AIG06)

### Step 3 — Add route for new page
Update router config to add `/admin/aig/usage-ledger` → `AIG05UsageLedgerExplorer`

### Step 4 — Enhance AIG04 Budget Center
Update `src/pages/admin/AIG04BudgetCenter.tsx`:
- Add usage-ledger-based spend cards: spend by capability, spend by model, premium vs economy split
- Add blocked/downgraded request counts from usage ledger (status = `blocked_budget` or `fallback_success`)
- Add threshold progress bars for active policies (daily spend / daily budget)
- Query `v_ai_budget_summary` view for aggregated data
- Add top metrics bar: providers healthy, active models, capabilities routed, budget burn today, premium %, fallback events today, failed today, public-safe count

### Step 5 — Enhance budget.service with missing queries
Add to `src/lib/services/ai-gateway/budget.service.ts`:
- `getUsageLedgerStats()` — aggregate from usage ledger: spend by capability, by model, premium vs economy, blocked/downgraded counts
- `getBudgetBurnToday()` — daily total from usage ledger

## Files Changed

| File | Change |
|------|--------|
| `src/pages/admin/AIG05UsageLedgerExplorer.tsx` | **New** — Usage Ledger Explorer with filters |
| `src/components/admin/AIGSubNav.tsx` | Add Usage Ledger nav item |
| `src/pages/admin/AIG04BudgetCenter.tsx` | Enhance with ledger analytics, progress bars, top metrics |
| `src/lib/services/ai-gateway/budget.service.ts` | Add `getUsageLedgerStats()`, `getBudgetBurnToday()` |
| Router config | Add route for new page |

## What This Does NOT Change
- No new database tables or columns (schema is complete)
- No new migrations
- No edge function changes
- No seed service changes
- No changes to existing working pages (AIG01-03, AIG06-09)

## Summary
1 new admin page, 3 file enhancements. Closes the Usage Ledger Explorer gap and upgrades the Budget Center with real ledger-based analytics, threshold progress bars, and consolidated top metrics.

