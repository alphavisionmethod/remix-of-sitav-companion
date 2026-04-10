

# Money Office — Comprehensive Audit & Gap Closure Plan

## Audit Results (20 Features)

### Fully Implemented as Dedicated Pages or Sections (14/20)

| # | Feature | Location | Status |
|---|---------|----------|--------|
| 1 | Money Twin | `MoneyOverview.tsx` (flow bars) | Basic — needs upgrade |
| 2 | Financial Stress Radar | `StressRadar.tsx` + `stress-radar.service.ts` | Full page + engine |
| 3 | Life-to-Money Impact Engine | `LifeMoneyEngine.tsx` | Full page, 11 events |
| 4 | Founder Split Brain Protection | `FinancialHealthPulse.tsx` (boundary section) + `MoneyRituals.tsx` (separation ritual) | Partial — needs full Split Brain section |
| 5 | Cashflow Storyline | `CashTiming.tsx` (narrative section) | Implemented |
| 6 | Money Operating Modes | `MoneyModes.tsx` | Full page, 10 modes |
| 7 | Cash Allocation AI | `CashAllocator.tsx` + `cash-allocator.service.ts` | Full page + engine |
| 9 | Decision Simulator | `ScenarioPlanner.tsx` | Full page |
| 10 | Money Rituals | `MoneyRituals.tsx` | Full page, 7 rituals |
| 11 | Invisible Waste Detector | `MoneyOverview.tsx` (waste section) + `SubscriptionsWaste.tsx` (leak radar) | Implemented |
| 13 | Income Quality Score | `income-quality.service.ts` engine exists | Engine only — no UI |
| 17 | Financial Trust Graph | `TrustGraph.tsx` | Full page |
| 18 | Opportunity Cost Dashboard | `OpportunityCost.tsx` | Full page |
| 20 | Financial Peace Score | `PeaceScore.tsx` + `peace-score.service.ts` | Full page + engine |

### Missing or Incomplete (6/20)

| # | Feature | What's Missing |
|---|---------|---------------|
| 8 | **Financial Boundary Monitor** | No page exists. No search results. Completely missing. |
| 12 | **Emotional Finance Layer** | No panic/guilt/avoidance/feast-famine detection anywhere. The `EmotionalPattern` type exists in contracts but no UI or service uses it. |
| 13 | **Income Quality Score UI** | The `income-quality.service.ts` engine exists but NO page renders it. Was supposed to be added to `FinancialHealthPulse.tsx` but wasn't. |
| 14 | **Subscription Negotiation/Downgrade Advisor** | Was supposed to be added to `SubscriptionsWaste.tsx` but never was. No downgrade paths, cancellation ordering, or alternatives section exists. |
| 15 | **Tax Shock Prevention** | Was supposed to be added to `TaxEstimator.tsx` but never was. No under-set-aside detection, irregular income tax risk, or quarter-end danger section. |
| 19 | **Adaptive Advisor Personality** | MoneyAdvisorBoard.tsx shows 9 advisors but with static tone. No mode badge, no tone adaptation based on current Money Mode. Was supposed to be enhanced but wasn't. |

### Upgrade Needed (2/20)

| # | Feature | Gap |
|---|---------|-----|
| 1 | **Money Twin** | Currently just 5 flow bars. Missing: committed vs flexible vs risky vs safe vs decaying vs improving model. Missing stress radar summary lane and peace score badge. |
| 4 | **Founder Split Brain Protection** | Current boundary section only shows co-mingling detection. Missing: fake profitability detection, delayed reimbursements, dangerous founder optimism, payroll/operating reserve weakness. |

## Implementation Plan

### 1. New Page: Financial Boundary Monitor
**`src/pages/money/FinancialBoundaryMonitor.tsx`** — New page detecting: blurred household/business finances, budget leakage, obligations without category ownership, purposeless money movement, large unexplained drains, reimbursement drift, hidden credit dependency, obligations not in plans. KPIs + signal cards + advisor.

### 2. Enhance: FinancialHealthPulse.tsx
- Add **Emotional Finance Layer** section: detect panic, guilt, avoidance, stress-float, defer-pattern, feast-famine patterns. Show severity, frequency, guidance, and suggested mode for each.
- Add **Income Quality Score** section: render the existing `computeIncomeQuality()` engine output with 6 dimension bars + composite grade.
- Expand **Founder Split Brain Protection**: add fake profitability alert, delayed reimbursement tracker, dangerous founder optimism indicator, payroll/operating reserve weakness.

### 3. Enhance: SubscriptionsWaste.tsx
- Add **Negotiation/Downgrade Advisor** section after Leak Radar: for each subscription, show downgrade path, better billing cycle, cancellation ordering, timing recommendation, alternatives, and monthly burn impact.

### 4. Enhance: TaxEstimator.tsx
- Add **Tax Shock Prevention** section: under-set-aside detection, irregular income tax risk, founder draw tax distortion, under-categorized deductible expenses, documentation weakness, quarter-end danger alerts.

### 5. Enhance: MoneyAdvisorBoard.tsx
- Add **Adaptive Personality** system: show current Money Mode badge on the page, and adjust each advisor's recommendation text and tone indicator based on the active mode (recovery = gentle, debt-attack = aggressive, etc.).

### 6. Enhance: MoneyOverview.tsx
- Upgrade **Money Twin** from basic flow bars to full model with committed/flexible/risky/safe/decaying/improving breakdown.
- Add **Stress Radar Summary Lane** (top 3 signals with severity badges and link to full Stress Radar page).
- Add **Peace Score Mini-Badge** in the KPI strip.

### 7. Wire New Page
- Add `FinancialBoundaryMonitor` as tab "Boundaries" in `MoneyCenter.tsx`
- Add route `/money/boundaries` in `App.tsx`

### File Summary

| File | Action |
|------|--------|
| `src/pages/money/FinancialBoundaryMonitor.tsx` | New — financial integrity monitoring page |
| `src/pages/money/FinancialHealthPulse.tsx` | Enhance — Emotional Finance + Income Quality Score + full Founder Split Brain |
| `src/pages/money/SubscriptionsWaste.tsx` | Enhance — Negotiation/Downgrade Advisor section |
| `src/pages/money/TaxEstimator.tsx` | Enhance — Tax Shock Prevention section |
| `src/pages/money/MoneyAdvisorBoard.tsx` | Enhance — Adaptive Personality system |
| `src/pages/money/MoneyOverview.tsx` | Enhance — full Money Twin + stress lane + peace badge |
| `src/pages/MoneyCenter.tsx` | Add 1 tab (Boundaries) |
| `src/App.tsx` | Add 1 route |

**Total: 8 file changes (1 new, 7 enhanced). Uses existing services (income-quality, stress-radar, peace-score) and existing contract types (EmotionalPattern). No new services or DB tables needed.**

