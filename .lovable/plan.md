

# Enhancement Plan: Emotional Tagging + Multi-Layer Explainability

## What's Already Working (23 of 25 features ✅)

All 25 pages exist, compile clean, and are routed. The following are fully implemented with rich data and interactive UIs:
- Capital Twin, Operating Modes, Conviction Engine, Disagreement Engine, What Would Break, Decision Theater, Time Machine Review, Capital Purpose, Investment Constitution, Opportunity Map, Catalyst War Room, Portfolio Shock Simulator (in RiskOffice), Behavioral Firewall, Intelligence Dossier, Event Probability Lab, Family Office, Market Memory Feed, Cross-Asset Story Engine, Position Sizing Coach, Decision Readiness, Strategy DNA, Post-Trade Loop, and "Invisible Complexity" (embodied in boardroom/synthesis UX)

## Two Gaps to Fix

### Gap 1: Trade Journal with Emotional Tagging (#17)

**Current state**: ThesisJournal.tsx shows theses with rationale, assumptions, risk factors, and catalysts — but zero emotional metadata. No confidence slider, no stress level, no urgency tag, no FOMO flag, no "long-term conviction vs short-term reaction" indicator.

**Fix**:
- Add `DEMO_JOURNAL_ENTRIES` to `investment.tsx` with emotional tags per trade: `confidence` (1-5), `stressLevel` (low/moderate/high), `urgency` (patient/moderate/urgent), `fomoFlag` (boolean), `emotionNote` (free text), `convictionType` ("thesis-driven" | "reactive" | "mixed")
- Enhance `ThesisJournal.tsx` with an "Emotional Profile" section per thesis showing these tags as colored chips and bars
- Add a "Patterns" summary card at the top showing aggregated emotional trends (e.g., "3 of 4 entries were thesis-driven", "Average stress: moderate")

**Files**: `src/lib/demo-data/investment.tsx` (~30 lines), `src/pages/investment-office/ThesisJournal.tsx` (~50 lines added)

### Gap 2: Multi-Layer Explainability (#19)

**Current state**: No implementation anywhere. Advisor insights are shown at one depth level only. The spec requires 5 depth views: Simple, Analyst, Committee, Execution, Risk.

**Fix**:
- Add `EXPLAINABILITY_LAYERS` data to `mock-data.ts` — for 2-3 sample recommendations, provide the same insight written at all 5 depth levels
- Add a dedicated "Explainability" toggle/tab system to `IntelligenceDossier.tsx` (the most natural home) — a row of 5 depth buttons (Simple → Analyst → Committee → Execution → Risk) that re-renders the recommendation text at the selected depth
- Each layer gets a distinct visual treatment: Simple = large text, few words; Analyst = structured bullet points; Committee = multi-advisor synthesis; Execution = actionable steps; Risk = risk-focused framing

**Files**: `src/lib/investment-office/mock-data.ts` (~50 lines), `src/pages/investment-office/IntelligenceDossier.tsx` (~40 lines added)

## Technical Approach

- All changes are additive — no restructuring
- Uses existing demo data patterns and component styles
- Zero new dependencies
- Will verify with `npx tsc --noEmit` after changes

## Summary

| Feature | Status | Action |
|---------|--------|--------|
| 1-16, 18, 20-25 | ✅ Complete | No changes |
| 17. Emotional Tagging | ❌ Missing | Add to ThesisJournal |
| 19. Multi-Layer Explainability | ❌ Missing | Add to IntelligenceDossier |

Total: ~170 lines across 4 files.

