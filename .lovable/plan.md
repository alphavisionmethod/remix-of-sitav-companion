

# SITA OS — End-to-End Data Wiring & User-Facing Page Completion

## Current State

**Hooks exist but are NOT consumed by any page:**
- `useCashflowAnalysis()`, `useCashflowForecast()`, `useSafeToSpend()`, `useBurnRate()` — defined in `use-backend-actions.ts`, never imported by any page
- `useTaxEstimate()`, `useTaxDeductions()` — defined in `use-backend-actions.ts`, never imported by any page
- `useCRMSync()` (syncLeads, syncCustomers, syncOpportunities, healthCheck) — defined in `use-backend-actions.ts`, never imported by any page

**Pages use mock/demo data or direct Supabase queries instead:**
- `CashTiming.tsx` — uses `useCashTimingWindows()` from mock data service, NOT the `cashflow-calculate` edge function
- `MoneyOverview.tsx` — uses `useMoneyKPIs()` from mock data, hardcoded fraud sentinel demo data
- `BusinessOverview.tsx` — hardcoded callbacks, proof items, activity changes
- `LeadsInbox.tsx` — already wired to Supabase `leads` table (✅) but no CRM sync button
- `CustomersPage.tsx` — already wired to Supabase `customers` table (✅) but no CRM sync
- `OpportunitiesCenter.tsx` — already wired to Supabase `opportunities` table (✅) but no sync
- No tax page exists at all

**Desktop/Profile:**
- `DesktopSurface.tsx` exists with mock data for boardroom summaries, today items
- `DailyPulse.tsx` (home `/`) uses demo data adapters, not live edge functions
- Settings page has profile section wired to `profiles` table (✅)

## Implementation Plan (7 Steps)

### Step 1 — Wire CashTiming to `cashflow-calculate` edge function

**File:** `src/pages/money/CashTiming.tsx`

Replace `useCashTimingWindows()` and `useMoneyKPIs()` with:
- `useSafeToSpend()` from `use-backend-actions` for the safe-to-spend KPI
- `useCashflowForecast()` for the timeline data
- `useCashflowAnalysis()` for liquid/receivable/overdue KPIs
- Keep existing UI layout, just swap data source
- Fallback to demo data when edge function returns empty (no accounts)

### Step 2 — Wire MoneyOverview to `cashflow-calculate` edge function

**File:** `src/pages/money/MoneyOverview.tsx`

- Import `useCashflowAnalysis()` and `useBurnRate()` from `use-backend-actions`
- Use edge function data for KPIs (total balance, safe-to-spend, burn rate) when available
- Keep existing fraud sentinel demo as-is (it's a feature demo)
- Merge edge function results with existing local bill/invoice/subscription data

### Step 3 — Create Tax Estimator page + wire to `tax-estimate` edge function

**Create:** `src/pages/money/TaxEstimator.tsx`

- Full tax estimation page with form: gross income, filing status, SE income, deduction choice
- Calls `tax-estimate` edge function's `summary` action
- Displays: federal tax breakdown, SE tax, quarterly estimates, effective/marginal rates
- Premium SITA styling with KPI tiles, breakdown table, quarterly payment cards
- Add advisor card for tax guidance

**Modify:** `src/pages/MoneyCenter.tsx` — add "Tax" tab routing to TaxEstimator

**Modify:** `src/App.tsx` — add route `/money/tax`

### Step 4 — Add CRM Sync buttons to Business pages

**Files:** `LeadsInbox.tsx`, `CustomersPage.tsx`, `OpportunitiesCenter.tsx`, `BusinessOverview.tsx`

- Import `useCRMSync()` from `use-backend-actions`
- Add "Sync" button to LeadsInbox header that calls `syncLeads.mutate(leads)`
- Add "Sync" button to CustomersPage header that calls `syncCustomers.mutate(customers)`
- Add CRM health indicator to BusinessOverview using `healthCheck` query
- Show sync status/last sync timestamp from health check data

### Step 5 — Wire DailyPulse desktop to live edge function data

**File:** `src/pages/DailyPulse.tsx`

- Import `useCashflowAnalysis()` from `use-backend-actions`
- Use live cashflow data for finance KPIs when available (fallback to existing adapters)
- Import `useCRMSync().healthCheck` for CRM health indicator in the business section
- Keep existing cross-domain intelligence and domain engine calls

### Step 6 — Complete Profile shell in Settings

**File:** `src/pages/SettingsPage.tsx`

- The identity section already loads/saves profile data — verify it handles: display name, avatar URL, timezone, locale
- Add profile photo upload using Supabase storage `documents` bucket
- Add account stats section (member since, last login, data counts from live queries)
- Ensure all settings persist to `profiles.preferences` JSONB column

### Step 7 — Wire DesktopSurface to live data

**File:** `src/components/sita/shell/DesktopSurface.tsx`

- Replace hardcoded `boardroomSummaries` with data from `useCashflowAnalysis()` and `useCRMSync().healthCheck`
- Replace hardcoded `todayItems` with data from pending approvals and upcoming bills queries
- Keep quick actions as-is (they're navigation links)

## Files Created
| File | Purpose |
|---|---|
| `src/pages/money/TaxEstimator.tsx` | Full tax estimation page wired to `tax-estimate` edge function |

## Files Modified
| File | Change |
|---|---|
| `src/pages/money/CashTiming.tsx` | Swap mock data hooks → `useCashflowAnalysis/Forecast/SafeToSpend` |
| `src/pages/money/MoneyOverview.tsx` | Add `useCashflowAnalysis()` + `useBurnRate()` for live KPIs |
| `src/pages/business/LeadsInbox.tsx` | Add CRM sync button using `useCRMSync().syncLeads` |
| `src/pages/business/CustomersPage.tsx` | Add CRM sync button using `useCRMSync().syncCustomers` |
| `src/pages/business/BusinessOverview.tsx` | Add CRM health indicator |
| `src/pages/DailyPulse.tsx` | Wire finance KPIs to `cashflow-calculate` edge function |
| `src/components/sita/shell/DesktopSurface.tsx` | Replace hardcoded summaries with live data |
| `src/pages/SettingsPage.tsx` | Add profile photo upload + account stats |
| `src/pages/MoneyCenter.tsx` | Add Tax tab |
| `src/App.tsx` | Add `/money/tax` route |

## What Won't Change
- Edge functions themselves (already complete and deployed)
- `use-backend-actions.ts` hooks (already complete)
- Database schema (tables already exist)
- Existing CRUD on leads/customers/opportunities pages (already wired)

