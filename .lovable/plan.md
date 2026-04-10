

# Money Office — Full Audit Report & Enhancement Plan

## Audit Findings

### Fully Implemented & Working (21 pages, 34 services, all contracts)

**Pages (21 tabs):** Overview, Bills, Subscriptions, Budgets, Transactions, Net Worth, Debt & Credit, Reserves, Cash Timing, Receivables, Health Pulse, Household, Scenarios, Investment Office, Tax, Advisors, Approvals, Proof, Documents, Boardroom, Settings — all wired in MoneyCenter.tsx with route mapping in App.tsx.

**Backend Services (34):** All exported from `src/lib/services/finance-os/index.ts` including debt-analyzer, financial-health, scenario-engine, envelope-budget, plus 30 original services.

**Contracts:** All 6 contract sub-modules exported: reserves, subscriptions, family-office, investment-office, debt-credit, health-score, envelope-budget, scenario.

**Routes:** All 8 new routes confirmed in App.tsx (lines 861-868).

### Issues Found (3 bugs)

**Bug 1: TransactionIntelligence.tsx exports wrong component name**
Line 151: `export default DebtCreditOffice;` — the component function is also named `DebtCreditOffice` (line 36) instead of `TransactionIntelligence`. This is a naming collision. The file works because MoneyCenter imports it as `TransactionIntelligence` from the file path, and the default export is what matters, but the internal function name is confusing and would cause issues in React DevTools. The function name on line 36 should be `TransactionIntelligence` and the export on line 151 should match.

**Bug 2: HouseholdMoneyOffice.tsx missing 2 KPI tiles**
Line 46-48 only shows 2 KPITiles (Household Income, Shared Expenses) out of 4 grid columns. The plan called for 4: surplus, savings rate, shared budget health, and member count. The `grid-cols-4` layout looks sparse with only 2 tiles.

**Bug 3: MoneyOverview.tsx missing "wow" features**
The plan specified adding Money Twin (Sankey-style flow visualization) to MoneyOverview, Cashflow Storyline to CashTiming, Subscription Leak Radar to SubscriptionsWaste, and Bill Shock Prevention to BillsWorkspace. None of these "wow" features were added to the existing pages — they were only built into the NEW pages (FinancialHealthPulse has Founder Boundary, BudgetEnvelopeOffice has pace tracking, etc.). The 4 planned enhancements to existing pages were skipped.

### What's Missing (4 "wow" feature enhancements to existing pages)

1. **Money Twin section in MoneyOverview.tsx** — A visual Sankey-style flow map showing income → bills → budgets → debt → reserves → goals. Not present.

2. **Cashflow Storyline in CashTiming.tsx** — A narrative-driven section describing where money came from, went, what changed, what's coming. Not present.

3. **Subscription Leak Radar enhancement in SubscriptionsWaste.tsx** — The page already has waste detection and duplicate detection via `enrichSub()`, but lacks the explicit "Leak Radar" section showing rising costs, forgotten renewals, and downgrade opportunities as a distinct visual panel.

4. **Bill Shock Prevention in BillsWorkspace.tsx** — No section for detecting unusually large incoming charges, annual renewals colliding, or low-cash timing risks.

## Fix Plan

### Fix 1: TransactionIntelligence.tsx — rename function
- Line 36: rename `DebtCreditOffice` → `TransactionIntelligence`
- Line 151: rename export `DebtCreditOffice` → `TransactionIntelligence`

### Fix 2: HouseholdMoneyOffice.tsx — add missing KPIs
- Add 2 more KPITiles: "Monthly Surplus" and "Budget Health" to fill the 4-column grid

### Fix 3: MoneyOverview.tsx — add Money Twin section
- Add a "Money Flow" visual section after the KPI strip showing income allocation flow with horizontal bars for: Bills → Subscriptions → Debt → Reserves → Savings → Safe-to-Spend. This is the Money Twin concept rendered as a deterministic flow breakdown rather than a full Sankey (which would require a charting library not in the stack).

### Fix 4: CashTiming.tsx — add Cashflow Storyline
- Add a narrative card section after the chart that summarizes in plain language: "This month, $X came in from Y sources. $Z went to obligations. Your biggest change was [item]. Coming up: [upcoming large items]."

### Fix 5: SubscriptionsWaste.tsx — add Leak Radar panel
- Add a "Subscription Leak Radar" card section showing: rising cost subscriptions, renewals in next 30 days, cost trend over 3 months. Uses existing subscription data + enrichment.

### Fix 6: BillsWorkspace.tsx — add Bill Shock Prevention
- Add a "Bill Shock Alerts" card detecting: bills significantly larger than their average, annual renewals coming up, days where multiple large bills collide, low-cash timing risks.

### File Summary

| File | Action |
|------|--------|
| `src/pages/money/TransactionIntelligence.tsx` | Rename function + export (2 lines) |
| `src/pages/money/HouseholdMoneyOffice.tsx` | Add 2 KPITiles (line 48) |
| `src/pages/money/MoneyOverview.tsx` | Add Money Twin flow visualization section |
| `src/pages/money/CashTiming.tsx` | Add Cashflow Storyline narrative section |
| `src/pages/money/SubscriptionsWaste.tsx` | Add Subscription Leak Radar panel |
| `src/pages/money/BillsWorkspace.tsx` | Add Bill Shock Prevention alerts |

All fixes use existing data hooks, existing primitives (SitaCard, KPITile, SitaSectionHeader), and existing service logic. No new services, contracts, or routes needed.

