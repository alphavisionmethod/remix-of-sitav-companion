
# Money Office — Advanced Feature Implementation Plan

## Audit Summary

**Already implemented (10 features):** Money Twin (basic), Founder Boundary Monitor, Cashflow Storyline, Subscription Leak Radar, Bill Shock Prevention, Scenario Planner, Financial Health Pulse, 9 Advisors, Waste Detector, Money Time Machine.

**Missing (13 features need new pages or major enhancements):**

## Implementation

### Phase 1: New Services (4 files)

**`src/lib/services/finance-os/stress-radar.service.ts`**
Deterministic engine detecting: cash squeeze windows, bill collisions, reserve weakness, debt inflection points, cashflow fragility, founder draw instability, tax shortfall risk, subscription creep, float reliance, utilization danger. Returns typed `StressSignal[]` with severity/timing/impact.

**`src/lib/services/finance-os/income-quality.service.ts`**
Scores income on: recurring reliability, client concentration, seasonality, payment delay risk, one-time dependency, household dependency on unstable inflows. Returns `IncomeQualityScore` with composite + per-dimension breakdown.

**`src/lib/services/finance-os/cash-allocator.service.ts`**
Given available cash, recommends allocation across bills, tax reserve, emergency reserve, debt payoff, sinking funds, payroll reserve, discretionary, investments, expansion. Returns conservative/balanced/aggressive plans with amounts and reasoning.

**`src/lib/services/finance-os/peace-score.service.ts`**
Composite "Financial Peace Score" from: reserve strength, bill safety, debt burden, tax preparedness, income predictability, obligation pressure, discretionary breathing room, household coordination. Distinct from Health Pulse (which is clinical — Peace Score is emotional).

### Phase 2: Contract Types (1 file enhancement)

**`src/packages/finance-contracts/advanced-intelligence.ts`** (new)
Types for: `StressSignal`, `LifeEvent`, `LifeMoneyImpact`, `MoneyMode`, `CashAllocationPlan`, `IncomeQualityScore`, `PeaceScoreResult`, `FinancialTrustNode`, `OpportunityCostEntry`, `MoneyRitual`, `EmotionalPattern`. Export from finance-contracts index.

### Phase 3: New Pages (8 files)

**`src/pages/money/StressRadar.tsx`** — Full stress detection dashboard. KPIs for active stress signals, severity breakdown. Timeline of upcoming squeeze windows. Bill collision calendar. Reserve weakness alerts. Utilization danger zones. Advisor card.

**`src/pages/money/LifeMoneyEngine.tsx`** — Life event selector (moving, child, hiring, home purchase, job change, etc.). Each event shows: cashflow impact, safe-to-spend change, reserve needs, budget shifts, bill pressure, risk windows, suggested setup changes. Uses scenario engine underneath.

**`src/pages/money/MoneyModes.tsx`** — Mode selector: Stable, Tighten, Recovery, Growth, Expansion, Debt Attack, Tax Protection, Founder Conservation, Household Protection, Launch Mode. Each mode shows changed behaviors: safe-to-spend posture, warning thresholds, reserve targets, advisor tone, bill prioritization logic. Mode selection persists.

**`src/pages/money/CashAllocator.tsx`** — Shows current available cash and three allocation plans (conservative/balanced/aggressive) with bar visualizations per bucket. User can adjust and see ripple effects. Advisor card for recommendation.

**`src/pages/money/TrustGraph.tsx`** — Financial dependency graph: bills tied to accounts, debt tied to reserves, family commitments tied to cashflow, payroll tied to receivables, card utilization tied to spending, tax obligations tied to inflows. Visual node-link layout using CSS grid (no D3 needed). Color-coded by health.

**`src/pages/money/OpportunityCost.tsx`** — For each spending category shows: what it prevented (reserve growth delayed, debt payoff delayed, goal progress traded away). "What if you hadn't spent X" counterfactuals. Monthly and cumulative views.

**`src/pages/money/MoneyRituals.tsx`** — Guided ritual system: Weekly Reset, Month Close, Bill Planning, Debt Check, Subscription Cleanup, Founder Cash Separation, Tax Reserve. Each ritual has steps, checklist, completion state, and schedule. Premium feel.

**`src/pages/money/PeaceScore.tsx`** — Financial Peace Score dashboard. Composite score with dimension breakdown (reserve strength, bill safety, debt burden, tax prep, income predictability, obligation pressure, breathing room, household coordination). Trend over time. Comparison to goals. Advisor guidance.

### Phase 4: Enhancements to Existing Pages (5 files)

**`src/pages/money/MoneyOverview.tsx`** — Enhance Money Twin from basic bars to full model showing: committed vs flexible vs risky vs safe vs decaying vs improving categories. Add Financial Stress Radar summary lane (top 3 stress signals with link to full page). Add Peace Score mini-badge.

**`src/pages/money/FinancialHealthPulse.tsx`** — Add Emotional Finance Layer section: detect panic/guilt/avoidance/feast-famine patterns from spending data. Add Income Quality Score section. Enhance Founder Boundary Monitor with full Split Brain Protection (fake profitability detection, delayed reimbursements, dangerous optimism).

**`src/pages/money/TaxEstimator.tsx`** — Add Tax Shock Prevention section: under-set-aside detection, irregular income tax risk, founder draw tax distortion, under-categorized deductibles, documentation weakness, quarter-end danger alerts.

**`src/pages/money/SubscriptionsWaste.tsx`** — Add Negotiation/Downgrade Advisor section: downgrade paths, better billing cycles, cancellation ordering, timing, alternatives, monthly burn impact.

**`src/pages/money/MoneyAdvisorBoard.tsx`** — Add Adaptive Personality system: advisor tone changes based on current Money Mode (recovery = gentle/supportive, growth = ambitious, debt attack = aggressive/focused, etc.). Show current mode badge on each advisor.

### Phase 5: Wiring (2 files)

**`src/pages/MoneyCenter.tsx`** — Add 8 new tabs: "Stress Radar", "Life Impact", "Modes", "Allocator", "Trust Graph", "Opportunity Cost", "Rituals", "Peace Score". Wire imports and route mapping.

**`src/App.tsx`** — Add 8 new routes: `/money/stress-radar`, `/money/life-impact`, `/money/modes`, `/money/allocator`, `/money/trust-graph`, `/money/opportunity-cost`, `/money/rituals`, `/money/peace-score`.

## File Summary

| File | Action |
|------|--------|
| `src/packages/finance-contracts/advanced-intelligence.ts` | New — all advanced types |
| `src/packages/finance-contracts/index.ts` | Add export |
| `src/lib/services/finance-os/stress-radar.service.ts` | New — stress detection engine |
| `src/lib/services/finance-os/income-quality.service.ts` | New — income scoring engine |
| `src/lib/services/finance-os/cash-allocator.service.ts` | New — allocation engine |
| `src/lib/services/finance-os/peace-score.service.ts` | New — peace score engine |
| `src/lib/services/finance-os/index.ts` | Add 4 new exports |
| `src/pages/money/StressRadar.tsx` | New page |
| `src/pages/money/LifeMoneyEngine.tsx` | New page |
| `src/pages/money/MoneyModes.tsx` | New page |
| `src/pages/money/CashAllocator.tsx` | New page |
| `src/pages/money/TrustGraph.tsx` | New page |
| `src/pages/money/OpportunityCost.tsx` | New page |
| `src/pages/money/MoneyRituals.tsx` | New page |
| `src/pages/money/PeaceScore.tsx` | New page |
| `src/pages/money/MoneyOverview.tsx` | Enhance — full Money Twin + stress lane + peace badge |
| `src/pages/money/FinancialHealthPulse.tsx` | Enhance — emotional layer + income quality + full founder protection |
| `src/pages/money/TaxEstimator.tsx` | Enhance — tax shock prevention |
| `src/pages/money/SubscriptionsWaste.tsx` | Enhance — negotiation advisor |
| `src/pages/money/MoneyAdvisorBoard.tsx` | Enhance — adaptive personality |
| `src/pages/MoneyCenter.tsx` | Add 8 tabs + imports |
| `src/App.tsx` | Add 8 routes |

**Total: 22 file changes (12 new, 10 enhanced). All using existing SITA primitives, existing hooks, deterministic engines. No new DB tables needed.**
