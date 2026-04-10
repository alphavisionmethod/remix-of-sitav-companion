

# Investment Office Part 4-6 Enhancement Plan

## Audit Summary

The advisor system already covers **most** of Parts 4-6. All 9 advisors have deep models (watches, uncertainty, whatWouldChangeMind, refusesToConclude, viewsByHorizon, priorViews, portfolioAwareness, beginnerExplanation, advancedAnalysis, dataSources, invalidationEvents). The Synthesis panel covers 4.3. Confidence/uncertainty system (4.4), time horizons (4.5), asset-class reasoning (4.6), portfolio awareness (4.7), beginner layer (4.8), event-driven memory (4.9), and recommendation discipline (4.10) are all fully implemented.

## Remaining Gaps

### 1. "Ask an Advisor" Interaction (Part 6.1) — MISSING
No way to ask a specific advisor a question. The detail panel shows static data but has no interactive Q&A. Need a set of pre-built questions users can click to get advisor-specific answers.

**Fix**: Add a "Quick Questions" section to `AdvisorDetailPanel` with 6 clickable prompts ("What matters most?", "Why are you cautious?", "Explain simply", "What would change your mind?", "How would you size this?", "What's the biggest hidden risk?"). Each maps to existing advisor data fields, displayed in a response card on click.

### 2. "Ask the Board" Interaction (Part 6.2) — MISSING
No board-wide Q&A. Need a way to ask the entire council and see aggregated responses.

**Fix**: Add a new "Ask the Board" view mode to AdvisorBoard with 4 clickable board questions ("What does the board think of this trade?", "What are the top disagreements?", "Where do you align?", "Strongest argument against this?"). Responses pull from existing synthesis data.

### 3. Advisor Dossier Memo (Part 5.3) — MISSING
Detail panel shows structured data but no long-form "memo" view that reads like a written intelligence brief.

**Fix**: Add a "Memo" tab to `AdvisorDetailPanel` that renders `advancedAnalysis` + `portfolioAwareness` + horizon views as a flowing document-style memo card.

### 4. Strategy Advisor Comments (Part 5.5) — MISSING
StrategyStudio has no advisor commentary on strategies.

**Fix**: Add an "Advisor Debate" section to StrategyStudio that shows how each advisor views the selected strategy template or current allocation, using existing advisor data.

### 5. Event Alerts Format (Part 5.6) — PARTIAL
Catalysts exist but no dedicated advisor event alert cards.

**Fix**: Add an "Upcoming Event Alerts" section to InvestmentBoardroom pulling catalyst data with the relevant advisor's view attached.

### 6. Post-Execution Review (Part 6.4) — MISSING
No advisor post-trade review capability.

**Fix**: Add a "Post-Trade Review" section to InvestmentReceipts that shows advisor commentary on completed trades (what was expected, what changed, thesis accuracy).

## Files Modified

- `src/pages/investment-office/AdvisorBoard.tsx` — Add "Ask the Board" view mode + "Ask" questions in detail panel + "Memo" tab (~120 lines)
- `src/pages/investment-office/StrategyStudio.tsx` — Add Advisor Debate section (~50 lines)
- `src/pages/investment-office/InvestmentBoardroom.tsx` — Add Event Alerts section (~40 lines)
- `src/pages/investment-office/InvestmentReceipts.tsx` — Add Post-Trade Review section (~50 lines)
- `src/lib/investment-office/mock-data.ts` — Add advisor event alerts + post-trade reviews data (~60 lines)

## Technical Approach

All enhancements are additive. No new components or dependencies. Advisor Q&A uses existing data fields mapped to question prompts (no AI API calls needed — this surfaces the deep advisor model data through interactive UX). Total: ~320 lines added across 5 files.

