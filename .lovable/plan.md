

# Money Office Onboarding — Financial Formation Ceremony

## What's Missing

The entire 10-step Money Office onboarding flow (MO-ONB-01 through MO-ONB-10) does not exist. Zero files, zero routes, zero components. The OS-level onboarding exists but has no money-specific ceremony.

## Implementation Plan

### 1. Create MoneyOnboarding orchestrator component
**`src/components/sita/money-onboarding/MoneyOnboardingFlow.tsx`**

A self-contained 10-step flow using the existing `SetupShell` + `SetupStageHeader` + `PremiumProgressRail` primitives. State machine managing steps 1-10, persisting selections to local state, with animated transitions between steps. Integrates with existing `useDataMode()` for demo/live awareness.

### 2. Create 10 step components

Each step follows the existing onboarding pattern (card-based, single-action, animated):

| File | Step | Key UI |
|------|------|--------|
| `MoneyWelcomeStep.tsx` | MO-ONB-01 | Welcome message + 4 path cards (Personal / Founder / Household / Hybrid) |
| `MoneyIdentityStep.tsx` | MO-ONB-02 | Money mode selection, business toggle, household toggle — outputs money mode + advisor activation |
| `FinancialPrioritiesStep.tsx` | MO-ONB-03 | 9 priority chips (multi-select): control spending, understand flows, build reserves, reduce debt, avoid bill stress, separate biz/personal, tax readiness, household, goals |
| `ConnectAccountsStep.tsx` | MO-ONB-04 | Account connection cards (banks, cards, loans, business, household, CSV) with trust state + permission scope display |
| `MoneyStructureStep.tsx` | MO-ONB-05 | Structure mapping — bills, recurring, debt, goals, reserves, household commitments, tax, payroll/draw — builds initial Money Twin skeleton |
| `BudgetStyleStep.tsx` | MO-ONB-06 | Budget style chooser: envelope / category / lightweight / advisor-guided + rollover + sinking fund toggles |
| `FounderBoundaryStep.tsx` | MO-ONB-07 | Conditional (founder mode) — business accounts, draw habits, payroll, tax reserve, reimbursements, blur points |
| `HouseholdSharingStep.tsx` | MO-ONB-08 | Conditional (household mode) — shared vs private, partner visibility, shared goals, permission boundaries |
| `OperatingModeStep.tsx` | MO-ONB-09 | 10 operating mode cards (Stable, Tighten, Recovery, Growth, Expansion, Debt Attack, Tax Protection, Founder Conservation, Household Protection, Launch) |
| `MoneyOfficeRevealStep.tsx` | MO-ONB-10 | Animated reveal showing Boardroom, Safe-to-Spend, first stress signals, advisor summary, connected accounts, first obligations, first opportunities + "Enter Money Office" CTA |

All files in `src/components/sita/money-onboarding/` with barrel export.

### 3. Create entry page + route

**`src/pages/MoneyOnboarding.tsx`** — wrapper page using `SetupShell` + `DemoModeBadge` + `MoneyOnboardingFlow`.

Add route `/money/onboarding` in `App.tsx`.

### 4. Wire entry point

Add a check in `MoneyCenter.tsx`: if user hasn't completed money onboarding (check local storage flag or a simple state), redirect to `/money/onboarding`. After completion, set flag and navigate to `/money`.

### 5. Design details

- Uses existing SITA brand: sita-purple, sita-gold, trust-safe colors
- Uses existing primitives: `SetupShell`, `SetupStageHeader`, `PremiumProgressRail`, `ChapterTransition`, `SignatureWowMoment`
- Step 7 (Founder) and Step 8 (Household) are conditionally shown based on Step 2 selections
- Step 10 reveal uses `SignatureWowMoment` for the wow effect
- Progress rail shows chapters: Welcome → Identity → Priorities → Connect → Structure → Style → [Founder] → [Household] → Mode → Reveal
- All selections stored in a single `MoneyOnboardingState` object, persisted via `localStorage`
- Reduced motion support via `useReducedMotion()`

### File Summary

| File | Action |
|------|--------|
| `src/components/sita/money-onboarding/MoneyOnboardingFlow.tsx` | New — orchestrator |
| `src/components/sita/money-onboarding/MoneyWelcomeStep.tsx` | New — MO-ONB-01 |
| `src/components/sita/money-onboarding/MoneyIdentityStep.tsx` | New — MO-ONB-02 |
| `src/components/sita/money-onboarding/FinancialPrioritiesStep.tsx` | New — MO-ONB-03 |
| `src/components/sita/money-onboarding/ConnectAccountsStep.tsx` | New — MO-ONB-04 |
| `src/components/sita/money-onboarding/MoneyStructureStep.tsx` | New — MO-ONB-05 |
| `src/components/sita/money-onboarding/BudgetStyleStep.tsx` | New — MO-ONB-06 |
| `src/components/sita/money-onboarding/FounderBoundaryStep.tsx` | New — MO-ONB-07 |
| `src/components/sita/money-onboarding/HouseholdSharingStep.tsx` | New — MO-ONB-08 |
| `src/components/sita/money-onboarding/OperatingModeStep.tsx` | New — MO-ONB-09 |
| `src/components/sita/money-onboarding/MoneyOfficeRevealStep.tsx` | New — MO-ONB-10 |
| `src/components/sita/money-onboarding/index.ts` | New — barrel export |
| `src/pages/MoneyOnboarding.tsx` | New — page wrapper |
| `src/App.tsx` | Add route `/money/onboarding` |
| `src/pages/MoneyCenter.tsx` | Add onboarding-complete check + redirect |

**Total: 14 new files, 2 enhanced files. No duplicates. Uses existing primitives and patterns.**

