# Finance OS — Module Manifest

**Pillar**: 3 of 4
**Route group**: `/money/*` (canonical) — `/finance/*` reserved as alias for future migration
**Primary surface**: `src/pages/MoneyCenter.tsx` (windowed App-in-OS shell)
**Sub-apps under this pillar**: Investment Office, Tax, Family Office, Budgeting, Cash Timing, Net Worth, Wealth Command Center, Capital Allocation, Scenario Lab.

## Owned Sub-Domains

| Sub-domain         | Surface(s)                                          | Service(s)                              |
| ------------------ | --------------------------------------------------- | --------------------------------------- |
| Budgeting          | `src/pages/money/MoneyCenter` (budgets tab)         | `src/lib/services/finance-os/budget-*`  |
| Cash flow / timing | `src/pages/money/CashTiming` (within MoneyCenter)   | `src/lib/services/finance-os/cash-*`    |
| Net worth          | `src/pages/money/NetWorth*`                          | `src/lib/services/finance-os/net-*`     |
| Investment Office  | `src/pages/investment-office/**` (sub-app)          | `src/lib/services/integration-hub`      |
| Capital allocation | `src/pages/CapitalAllocationPage.tsx`               | `src/lib/services/capital-allocation`   |
| Tax                | `src/pages/money/Tax*`                               | `src/lib/services/finance-os/tax-*`     |
| Family office      | `src/pages/money/FamilyOffice*`                      | `src/lib/services/family-command-center`|
| Approvals (money)  | `src/pages/money/MoneyApprovals.tsx`                | DELEGATES → `_trust/approvals`          |
| Trust Graph        | `src/pages/money/TrustGraph.tsx`                    | DELEGATES → `_trust`                    |
| Bills / subscriptions | `src/pages/money/Bills`, `Subscriptions`         | `src/lib/services/finance-os/bills-*`   |
| Receivables        | `src/pages/money/Receivables`                       | `src/lib/services/finance-os/ar-*`      |
| Scenarios          | `src/pages/ScenarioLabPage.tsx`                     | `src/lib/services/life-simulation`      |

## Owned Components
- `src/components/finance/**` · `src/components/money/**` · `src/components/investment/**`

## Forbidden Imports
- ❌ `src/modules/business/**` · `src/modules/concierge/**` · `src/modules/health/**`
- ✅ `src/modules/_shared/**` · `src/modules/_trust/**`

## Trust Integration
ALL money movement (transfers, payments, investment trades, allocations) MUST be receipted and routed through approvals when above the user-set threshold. The `MoneyApprovals` and `TrustGraph` pages are user-facing windows into the Trust Layer, scoped to financial actions.