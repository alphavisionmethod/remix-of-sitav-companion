

# Finance App Audit — Spec vs Implementation

## Current State: 31 sub-pages, 6,472 total lines. Very strong baseline.

### Coverage Matrix

| Spec Section | Implementation | Lines | Status |
|---|---|---|---|
| 4. Finance Home | `MoneyOverview.tsx` | 507 | **Full** — WhatMattersNow, PreparedActions, QuickActionBar, WhatChangedFeed, cockpit gauges, cash flow river, money twin, stress radar, bento grid, fraud sentinel, advisor |
| 5. Bills & Obligations | `BillsWorkspace.tsx` | 367 | **Full** — CRUD, payment timeline, status tracking, simulation, approval, form drawer, advisor |
| 6. Spending Pulse | `SpendingPulse.tsx` | 193 | **Full** — pulse state banner, category breakdown, recurring pattern changes, weekly comparison |
| 7. Accounts & Cash | `CashTiming.tsx` + `CashAllocator.tsx` + `NetWorthOffice.tsx` | 158+125+233 | **Full** — safe-to-spend, stress windows, cash flow chart, allocation, net worth |
| 8. Invoices & Receivables | `ReceivablesObligations.tsx` | 128 | **Implemented** but lighter than spec — no aging view, no reminder drafts, no collection queue, no expected cash timeline |
| 9. Payments & Approvals | `MoneyApprovals.tsx` | 121 | **Full** — risk-tiered approvals, impact analysis, policy display, approve/reject/simulate |
| 10. Budgets & Planning | `BudgetEnvelopeOffice.tsx` | 147 | **Full** — YNAB-style envelope budgeting, pace tracking, overspent warnings, advisor |
| 11. Subscriptions & Recurring | `SubscriptionsWaste.tsx` | 466 | **Full** — CRUD, waste detection, trends chart, category chart, advisor, duplicate detection |
| 12. Reserves / Savings | `ReservesSavings.tsx` | 152 | **Full** — progress charts, goal tracking, CRUD, advisor |
| 13. Financial Documents | `MoneyDocuments.tsx` | 171 | **Full** — file list, tabs by type, sensitivity labels, search, detail sidebar |
| 14. Reconciliation & Review | **NOT IMPLEMENTED** | 0 | **MISSING** — no reconciliation workspace exists |
| 15. Automations | **NOT IMPLEMENTED** | 0 | **MISSING** — no finance-specific automations workspace |
| 16. Finance Boardroom | `MoneyBoardroom.tsx` | 140 | **Implemented** but lighter — has weekly/reserve/waste/monthly modes, KPIs, advisor. Could be deeper. |
| 18. Proof / Receipts | `MoneyProof.tsx` | 153 | **Full** — tabbed proof items, detail view, verification badges |

### Beyond-Spec Pages (already implemented)
- `InvestmentOffice.tsx` (519), `TaxEstimator.tsx` (227), `DebtCreditOffice.tsx` (186), `HouseholdMoneyOffice.tsx` (133), `FinancialHealthPulse.tsx` (355), `MoneyAdvisorBoard.tsx` (276), `ScenarioPlanner.tsx` (170), `StressRadar.tsx` (155), `LifeMoneyEngine.tsx` (233), `MoneyModes.tsx` (123), `TrustGraph.tsx` (126), `OpportunityCost.tsx` (97), `MoneyRituals.tsx` (199), `PeaceScore.tsx` (122), `FinancialBoundaryMonitor.tsx` (212), `TransactionIntelligence.tsx` (151)

## What's Missing / Needs Enhancement (4 items)

### 1. Reconciliation & Review Workspace (Spec Section 14) — **MISSING**
No page exists. Need:
- Review queue for mismatched, uncategorized, unclear items
- Reconciliation support by issue type, date, amount, domain
- Proof-linked review history
- Changed recurring items needing review

### 2. Finance Automations Workspace (Spec Section 15) — **MISSING**
No finance-specific automations page. The Business app has AutopilotHub/RevenueAutopilot — Finance has nothing equivalent. Need:
- Automation library with active/suggested/paused/failed
- Finance-specific automation rules (bill review prep, overdue reminder prep, recurring charge review, reserve alerts, subscription review)
- Simulation previews, trust levels, proof outputs

### 3. Receivables Enhancement (Spec Section 8) — **THIN**
Current `ReceivablesObligations.tsx` at 128 lines is significantly thinner than spec requires. Missing:
- Aging view
- Reminder draft preparation
- Collection queue with escalation
- Expected cash timeline
- AI advisor for receivables
- Customer context in detail

### 4. Boardroom Enhancement (Spec Section 16) — **COULD BE DEEPER**
Current at 140 lines. Spec calls for daily pulse, weekly review, household review, founder mode, receivables-focused review, subscription review. Has 4 tabs but content within tabs is light.

---

## Implementation Plan

### Phase 1 — Finance Reconciliation Workspace (NEW)
**Create `src/pages/money/ReconciliationReview.tsx`**
- KPI strip: Items needing review, Mismatches, Uncategorized, Recurring changes
- Tabs: All, Mismatches, Uncategorized, Recurring Changes, Resolved
- Demo data: 8-10 reconciliation items with various issue types
- Detail sidebar with issue context, linked transactions, resolution actions
- AI Reconciliation Advisor card
- ~250 lines

### Phase 2 — Finance Automations Workspace (NEW)
**Create `src/pages/money/FinanceAutomations.tsx`**
- Automation library with 8-10 finance-specific rules
- Active/Suggested/Paused/Failed tabs
- Rule cards showing trigger, conditions, trust level, last run, proof count
- Detail sidebar with simulation preview, recent runs, edit/pause
- AI Automation Advisor card
- ~280 lines

### Phase 3 — Enhance Receivables (REWRITE)
**Rewrite `src/pages/money/ReceivablesObligations.tsx`**
- Add aging view (30/60/90 day buckets)
- Add reminder draft preparation with approve/send actions
- Add collection queue tab with escalation ladder
- Add expected cash timeline visualization
- Add AI receivables advisor
- Add customer context in detail sidebar
- ~350 lines (up from 128)

### Phase 4 — Enhance Boardroom (REWRITE)
**Rewrite `src/pages/money/MoneyBoardroom.tsx`**
- Add daily pulse mode with quick morning summary
- Deepen weekly review with actionable recommendations
- Add household finance review tab
- Add founder mixed-mode tab
- Add receivables-focused review
- More content per tab — risk cards, opportunity cards, prepared actions
- ~300 lines (up from 140)

### Phase 5 — Wire New Pages
**Modify `src/pages/MoneyCenter.tsx`**
- Add `reconciliation` and `automations` to SubPage type
- Import new components
- Add to pages map
- Add tabs to appropriate TAB_GROUPS (Core group for Reconciliation, Office group for Automations)

**Modify `src/App.tsx`**
- Add `/money/reconciliation` and `/money/automations` routes

---

## File Summary

| Action | File |
|---|---|
| Create | `src/pages/money/ReconciliationReview.tsx` |
| Create | `src/pages/money/FinanceAutomations.tsx` |
| Rewrite | `src/pages/money/ReceivablesObligations.tsx` |
| Rewrite | `src/pages/money/MoneyBoardroom.tsx` |
| Modify | `src/pages/MoneyCenter.tsx` — add 2 tabs + imports |
| Modify | `src/App.tsx` — add 2 routes |

