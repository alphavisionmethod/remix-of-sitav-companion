

# Money Office → 100% Fully Advanced

## Current Gaps (Page-by-Page)

| Page | Current State | Gap |
|---|---|---|
| **MoneyOverview** | Hardcoded `accounts`, `upcomingBills`, `changes`, KPIs, fraud data | Replace all with DB queries; compute KPIs from bills/subscriptions/invoices/reserves |
| **CashTiming** | Hardcoded `windows[]` array, hardcoded safe-to-spend | Compute from bills + invoices DB data; deterministic projection |
| **ReceivablesObligations** | Hardcoded `receivables[]` and `obligations[]` | Query invoices (receivables) + bills (obligations) from DB |
| **MoneyBoardroom** | All hardcoded KPIs and review data | Derive from DB aggregates |
| **MoneyApprovals** | Hardcoded `approvals[]` array | Query `approval_queue` table filtered to money domain |
| **MoneyProof** | Hardcoded `proofItems[]` | Query `proof_records` / `execution_receipts` for money domain |
| **MoneyDocuments** | Hardcoded `documents[]` | Query `financial_documents` table with CRUD |
| **MoneySettings** | Hardcoded `policies[]` and `connectors[]` | Need new `money_policies` table + query `connector_accounts` |
| **BillsWorkspace** | Already DB-backed with CRUD | ~100% done |
| **SubscriptionsWaste** | Already DB-backed with CRUD | ~100% done |
| **ReservesSavings** | Partially DB-backed (reads reserves table) | Missing create/edit/delete mutations |
| **InvestmentOffice** | Uses mock data via `useInvestmentOfficeData` | Separate domain — leave as-is for now |

## DB Tables Needed

**New table: `financial_accounts`** — Bank/investment accounts for the overview
- id, user_id, name, institution, account_type, balance, currency, trend, last_synced_at, created_at, updated_at

**New table: `money_policies`** — User-configurable financial rules
- id, user_id, title, description, category, enabled, threshold, icon_key, created_at, updated_at

No new tables needed for receivables (use `invoices`), obligations (use `bills`), approvals (use `approval_queue`), proof (use existing proof tables), documents (use `financial_documents`).

## Implementation Plan

### 1. Migration: Create `financial_accounts` + `money_policies` tables with RLS

### 2. Expand `money-data-service.ts`
Add fetch functions for:
- `fetchFinancialAccounts` — from `financial_accounts`
- `fetchMoneyPolicies` — from `money_policies` + CRUD mutations
- `fetchCashTimingWindows` — computed from `bills` + `invoices` over next 15 days
- `fetchMoneyKPIs` — aggregate total balance, safe-to-spend, reserve health, burn rate from existing tables

### 3. Expand `use-domain-data.ts`
Add hooks: `useFinancialAccounts`, `useMoneyPolicies`, `useCashTimingWindows`, `useMoneyKPIs`

### 4. Rewrite pages to use DB hooks

**MoneyOverview.tsx**: Replace hardcoded accounts/bills/KPIs with `useFinancialAccounts`, `useBills`, `useMoneyKPIs`. Compute fraud summary from real transaction patterns.

**CashTiming.tsx**: Replace hardcoded windows with `useCashTimingWindows` (deterministic projection from bills + invoices).

**ReceivablesObligations.tsx**: Replace hardcoded arrays with `useInvoices` (receivables) + `useBills` (obligations). Add CRUD.

**MoneyBoardroom.tsx**: Derive all KPIs from `useMoneyKPIs` aggregate hook.

**MoneyApprovals.tsx**: Query `approval_queue` where domain = 'money'. Wire approve/reject mutations.

**MoneyProof.tsx**: Query proof/execution receipts for money domain.

**MoneyDocuments.tsx**: Query `financial_documents` with full CRUD (create, edit, delete).

**MoneySettings.tsx**: Query `money_policies` with toggle mutations + `connector_accounts` for connector status.

**ReservesSavings.tsx**: Add create/edit/delete mutations for `reserves` table.

### 5. Demo mode preservation
All hooks use the existing `resolveByMode` pattern — demo data as fallback, real DB queries in real mode.

## Files Changed

| File | Change |
|---|---|
| `supabase/migrations/...` | Create `financial_accounts`, `money_policies` with RLS |
| `src/lib/data-services/money-data-service.ts` | Add 6+ fetch/mutation functions |
| `src/hooks/use-domain-data.ts` | Add 4+ new money hooks |
| `src/pages/money/MoneyOverview.tsx` | Replace all hardcoded data with DB hooks |
| `src/pages/money/CashTiming.tsx` | Compute windows from DB |
| `src/pages/money/ReceivablesObligations.tsx` | DB-backed + CRUD |
| `src/pages/money/MoneyBoardroom.tsx` | DB-derived KPIs |
| `src/pages/money/MoneyApprovals.tsx` | Query approval_queue |
| `src/pages/money/MoneyProof.tsx` | Query proof tables |
| `src/pages/money/MoneyDocuments.tsx` | CRUD on financial_documents |
| `src/pages/money/MoneySettings.tsx` | CRUD on money_policies |
| `src/pages/money/ReservesSavings.tsx` | Add create/edit/delete |

