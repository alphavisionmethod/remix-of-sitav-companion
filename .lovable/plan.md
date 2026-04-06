
# Convert All Mock-Data Domains to Real Supabase Data — Phase Plan

## Scope Assessment

**40+ pages** across 6 domains currently use hardcoded mock data. Existing Supabase tables already cover most domains:

| Domain | Pages | Existing DB Tables | Status |
|---|---|---|---|
| **Investment/Money** | 12 pages | `asset_master`, `capital_allocations`, `capital_purpose_buckets`, `bills`, `budgets`, `connected_investment_platforms`, `asset_market_snapshots` | Tables exist, pages use mock imports |
| **Business/CRM** | 15 pages | `customers`, `deals`, `invoices`, `revenue_leak_items`, `revenue_bookings`, `revenue_campaigns`, `revenue_funnels`, `communications` | Tables exist, pages use mock imports |
| **Owner Center** | 8 pages | `approval_queue`, `audit_logs`, `council_decisions` + many governance tables | Partially connected, some mock imports remain |
| **Revenue/Calling** | 3 pages | `revenue_*` tables, `communication_log` | Tables exist, mock data used |
| **Workspace** | 5 pages | No content tables yet | Need new tables: `documents`, `sheets`, `slides` |
| **Boardroom** | 2 pages | Many tables exist but page uses hardcoded arrays | Need data service wiring |

## Implementation Strategy

For each domain, the pattern is:
1. **Data Service** — `src/lib/data-services/{domain}-data-service.ts` with mode-aware queries
2. **React Query Hook** — `src/hooks/use-{domain}-data.ts` wrapping the service
3. **Page Update** — Replace mock imports with hook calls, add loading/empty states

### Batch 1: Investment Office + Money Overview (highest value)
- Create `src/lib/data-services/investment-data-service.ts` querying `asset_master`, `capital_allocations`, `capital_purpose_buckets`, `asset_market_snapshots`, `connected_investment_platforms`
- Create `src/hooks/use-investment-data.ts` with hooks: `useCapitalBuckets()`, `usePositions()`, `useTheses()`, `useAssetSnapshots()`
- Update `InvestmentOffice.tsx` — replace `MOCK_CAPITAL_BUCKETS`, `MOCK_POSITIONS`, `MOCK_THESES` with hooks
- Update `MoneyOverview.tsx`, `MoneyBoardroom.tsx` — wire to same hooks

### Batch 2: Business CRM + Revenue
- Create `src/lib/data-services/business-data-service.ts` querying `customers`, `deals`, `invoices`, `revenue_leak_items`, `revenue_campaigns`
- Create `src/hooks/use-business-data.ts` with hooks: `useCustomers()`, `useDeals()`, `useInvoices()`, `useRevenuLeaks()`, `useRevenueCampaigns()`
- Update `RevenueAutopilot.tsx` — replace `MOCK_LEAKAGE_INPUT`, `MOCK_RECOVERED_VALUES`, `MOCK_RAW_OPPORTUNITIES`
- Update `BusinessBoardroom.tsx`, `CollectionsCommandCenter.tsx`, `RevenueForecast.tsx`
- Update `RevenueCallingPage.tsx` — replace mock call lists

### Batch 3: Owner Center cleanup
- Replace remaining `buildMockSimResult` import with direct hook
- Wire remaining mock arrays to existing governance hooks

### Batch 4: Workspace (requires new tables)
- Create migration for `workspace_documents`, `workspace_sheets`, `workspace_slides` tables
- Create data service + hooks
- Update `DocsWorkspace.tsx`, `SheetsWorkspace.tsx`, `SlidesWorkspace.tsx`

### Batch 5: Boardroom
- Wire `BusinessBoardroom.tsx` and `MoneyBoardroom.tsx` to aggregate hooks from batches 1-2

## Implementation Order
1. Batch 1 (Investment + Money) — 4 files
2. Batch 2 (Business + Revenue) — 6 files  
3. Batch 3 (Owner Center) — 2 files
4. Batch 4 (Workspace) — migration + 3 files
5. Batch 5 (Boardroom) — 2 files
6. Build verification

## Files Created/Changed (~25 files)

| File | Action |
|---|---|
| `src/lib/data-services/investment-data-service.ts` | New |
| `src/hooks/use-investment-data.ts` | New |
| `src/lib/data-services/business-data-service.ts` | New |
| `src/hooks/use-business-data.ts` | New |
| `src/lib/data-services/workspace-data-service.ts` | New |
| `src/hooks/use-workspace-data.ts` | New |
| `src/pages/money/InvestmentOffice.tsx` | Wire to hooks |
| `src/pages/money/MoneyOverview.tsx` | Wire to hooks |
| `src/pages/money/MoneyBoardroom.tsx` | Wire to hooks |
| `src/pages/business/RevenueAutopilot.tsx` | Wire to hooks |
| `src/pages/business/BusinessBoardroom.tsx` | Wire to hooks |
| `src/pages/business/CollectionsCommandCenter.tsx` | Wire to hooks |
| `src/pages/business/RevenueForecast.tsx` | Wire to hooks |
| `src/pages/RevenueCallingPage.tsx` | Wire to hooks |
| `src/pages/OwnerCenter.tsx` | Remove remaining mocks |
| `src/pages/workspace/DocsWorkspace.tsx` | Wire to hooks |
| `src/pages/workspace/SheetsWorkspace.tsx` | Wire to hooks |
| `src/pages/workspace/SlidesWorkspace.tsx` | Wire to hooks |
| + more secondary pages | Wire to shared hooks |
