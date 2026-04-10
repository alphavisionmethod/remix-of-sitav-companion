

# Money Office Enhancement Plan

## Current State

MoneyCenter has 13 tabs and 33 backend services. Core capabilities (bills, subscriptions, reserves, tax, cash timing, receivables, investment office, approvals, proof, documents, boardroom, settings) are fully implemented with real CRUD, edge function wiring, and advisor cards.

## What's Missing

Seven major workspace pages and five "wow" features need to be added. No backend services need creation — the finance-os service layer already covers the logic. This is primarily a frontend expansion with MoneyCenter tab/route wiring.

## New Pages to Add

### 1. `src/pages/money/NetWorthOffice.tsx`
Balance sheet view: total net worth, asset vs liability breakdown, trend over time, account contributions to change, personal/business/household net worth split. Uses existing `AccountSummary.netWorth` from finance contracts and `useFinancialAccounts` hook.

### 2. `src/pages/money/DebtCreditOffice.tsx`
Credit cards, loans, mortgage, utilization monitoring, payoff plans, interest drag analysis, credit score pulse, debt payoff simulations. Pulls from existing `FinancialAccount` records where type is "credit" or "loan", plus new debt-specific computations.

### 3. `src/pages/money/BudgetEnvelopeOffice.tsx`
YNAB-style envelope budgeting: category budgets, "give every dollar a job", rollover logic, overspend handling, planned vs actual, monthly budget view. Uses existing `BudgetHealth` contract type.

### 4. `src/pages/money/TransactionIntelligence.tsx`
Transaction feed with categorization, merchant intelligence, recurring detection, anomaly detection, duplicate detection, split transactions, business vs personal classification, confidence scores. Uses existing `TransactionRecord` contract and `transaction-categorizer.service.ts`.

### 5. `src/pages/money/HouseholdMoneyOffice.tsx`
Shared accounts, household goals, family spending categories, partner visibility, shared budget views. Links to existing `HouseholdCommandCenter` data via `useHouseholds` hook.

### 6. `src/pages/money/FinancialHealthPulse.tsx`
Composite "money health" scoring: safe-to-spend, debt pressure, bill coverage, cash stability, savings progress, credit utilization, recurring burden, spending discipline, tax preparedness, reserve health. Synthesizes data from all other money hooks into a single health score.

### 7. `src/pages/money/MoneyAdvisorBoard.tsx`
Dedicated advisor surface with 8 specialized advisors: Cash Flow, Budget, Debt, Credit, Tax Readiness, Household Finance, Founder Money, Safe-to-Spend, plus Chief Money Strategist synthesis. Each uses `LiveAdvisorCard` with domain-specific intents.

### 8. `src/pages/money/ScenarioPlanner.tsx`
What-if engine: "cut subscriptions", "increase savings 10%", "revenue drops", "pay off debt X first", "hire someone". Uses existing `TreasuryScenarioResult` contract with interactive parameter controls.

## Wow Features (embedded in existing + new pages)

- **Money Twin**: Added as a visual section in MoneyOverview — a live Sankey-style flow map of income → bills → budgets → debt → reserves → goals
- **Cashflow Storyline**: Added to CashTiming — narrative flow of where money came from, went, what changed, what's coming
- **Subscription Leak Radar**: Enhanced in SubscriptionsWaste — duplicate detection, rising costs, forgotten renewals
- **Bill Shock Prevention**: Enhanced in BillsWorkspace — annual renewal detection, low-cash timing collision alerts
- **Founder Boundary Monitor**: Added to MoneyOverview or as section in new FinancialHealthPulse — personal/business co-mingling detection

## Wiring Changes

### `src/pages/MoneyCenter.tsx`
Add 8 new SubPage entries, imports, tab definitions, and route mapping.

### `src/App.tsx`
Add 8 new routes: `/money/net-worth`, `/money/debt-credit`, `/money/budgets`, `/money/transactions`, `/money/household`, `/money/health`, `/money/advisors`, `/money/scenarios`.

### `src/pages/__tests__/money-pages.test.tsx`
Add 8 new page entries to the test array.

## Finance Contracts Enhancement

### `src/packages/finance-contracts/index.ts`
Add new types:
- `DebtProfile` (credit cards, loans, utilization, payoff plan)
- `FinancialHealthScore` (composite scoring)
- `ScenarioInput` / `ScenarioOutput` (what-if parameters)
- `EnvelopeBudget` (YNAB-style envelope)
- `HouseholdFinanceSummary`

## Backend Services Enhancement

### `src/lib/services/finance-os/debt-analyzer.service.ts` (new)
Interest drag, payoff ordering (avalanche/snowball), utilization scoring, debt-to-income ratio.

### `src/lib/services/finance-os/financial-health.service.ts` (new)
Composite health score computation from all money dimensions.

### `src/lib/services/finance-os/scenario-engine.service.ts` (new)
What-if projection engine using existing cashflow/budget/reserve data.

### `src/lib/services/finance-os/envelope-budget.service.ts` (new)
Envelope allocation, rollover, overspend recovery logic.

## File Summary

| File | Action |
|------|--------|
| `src/packages/finance-contracts/index.ts` | Add 5 new contract types |
| `src/lib/services/finance-os/debt-analyzer.service.ts` | New — debt payoff engine |
| `src/lib/services/finance-os/financial-health.service.ts` | New — composite health scoring |
| `src/lib/services/finance-os/scenario-engine.service.ts` | New — what-if projections |
| `src/lib/services/finance-os/envelope-budget.service.ts` | New — YNAB-style envelope logic |
| `src/lib/services/finance-os/index.ts` | Update barrel exports |
| `src/pages/money/NetWorthOffice.tsx` | New — balance sheet page |
| `src/pages/money/DebtCreditOffice.tsx` | New — debt/credit/liability page |
| `src/pages/money/BudgetEnvelopeOffice.tsx` | New — YNAB-style budgets |
| `src/pages/money/TransactionIntelligence.tsx` | New — smart transaction feed |
| `src/pages/money/HouseholdMoneyOffice.tsx` | New — shared/family finances |
| `src/pages/money/FinancialHealthPulse.tsx` | New — composite health score |
| `src/pages/money/MoneyAdvisorBoard.tsx` | New — 8 specialized advisors |
| `src/pages/money/ScenarioPlanner.tsx` | New — what-if engine |
| `src/pages/MoneyCenter.tsx` | Add 8 tabs + imports + routing |
| `src/App.tsx` | Add 8 routes |
| `src/pages/__tests__/money-pages.test.tsx` | Add 8 test entries |
| `src/pages/money/MoneyOverview.tsx` | Enhance with Money Twin flow visualization |
| `src/pages/money/BillsWorkspace.tsx` | Enhance with Bill Shock Prevention alerts |
| `src/pages/money/SubscriptionsWaste.tsx` | Enhance with Subscription Leak Radar |
| `src/pages/money/CashTiming.tsx` | Enhance with Cashflow Storyline narrative |

All new pages use existing SITA primitives (SitaCard, KPITile, TrustBadge, ConfidenceBar, LiveAdvisorCard, DomainHeader), existing hooks, and existing finance-os services. No stubs — every component renders real computed data from deterministic engines.

