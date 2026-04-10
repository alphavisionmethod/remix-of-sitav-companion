

# Investment Office Part 2 — Enhancement Plan

## Audit Result

All 17 IO screens from the spec are implemented and functional. The advisor system has deep Part 3 spec coverage (watches, horizons, prior views, uncertainty, debate positions, synthesis). No missing screens, no duplicates, no stubs.

## Gaps Identified for Enhancement

### 1. InstrumentDetail (IO04) — Missing Sections
Currently 184 lines. Missing from spec:
- **Section 1: "What it is"** — plain-language explainer for beginners
- **Section 7: Scenario simulator preview** — upside/base/downside with portfolio impact
- **Section 9: Platform availability** — where user can trade this instrument
- Needs a risk profile section with volatility, liquidity, correlation data

**Fix**: Add 3 new sections (explainer card, scenario preview using existing SAMPLE_SCENARIOS, platform availability grid from PLATFORM_CONNECTIONS).

### 2. PortfolioOffice (IO05) — Missing Views
Currently 146 lines. Missing:
- **Allocation map by sector/theme/conviction** — only has basic summary cards
- **Performance timeline** — no day/week/month/YTD view
- **Correlation/concentration visualization** — only text warnings in RiskOffice
- **Cash & reserves section** — no dry powder policy display

**Fix**: Add allocation breakdown tabs (by class, sector, theme), a simple performance band, and a cash reserves card.

### 3. RiskOffice (IO06) — Missing Depth
Currently 131 lines. Missing:
- **Scenario stress tests** — "if rates spike", "if crypto falls X%"
- **User risk policy controls** — max position size, drawdown alerts
- **Risk advisor council section** — only shows single risk advisor, not multi-advisor risk views

**Fix**: Add a scenario stress grid with 5 predefined shocks and a risk policy settings card.

### 4. ResearchLibrary (IO09) — Thin
Only 79 lines. Missing:
- **Catalyst calendar** — exists in EventMarketsWorkspace but not in Research
- **Advisor memos section** — advisor-sourced research
- **Beginner explain mode** toggle

**Fix**: Add a catalyst calendar section and advisor memo cards sourced from INVESTMENT_ADVISORS insights.

### 5. InvestmentReceipts (IO15) — Missing Receipt Detail
Currently 104 lines. Has list view but:
- No **receipt detail expand** — clicking should show full proof with reasoning chain
- No **export per receipt**
- No **linked thesis/advisor snapshot** display

**Fix**: Add expandable receipt detail with full metadata and proof chain display.

### 6. PlatformConnections (IO14) — Missing "Value Unlocked" UX
Currently 92 lines. Missing:
- **Permissions display** per connection
- **"Value unlocked"** summary after connection
- **Sync history** log

**Fix**: Add permissions badges and a sync history section.

### 7. Beginner Mode (IO16) — Missing "Explain This" Pattern
Currently 107 lines. Has guided actions and learn topics but:
- No **"What this means" tooltip pattern** reusable across the office
- No **guided first investment flow** — step-by-step wizard

**Fix**: Add a 4-step "First Investment" wizard component with simulation-first guardrails.

## Implementation Approach

All enhancements are additive. No restructuring needed. Mock data extensions are backward-compatible. Total estimated additions: ~600 lines across 7 files.

### Files to Modify
- `src/pages/investment-office/InstrumentDetail.tsx` — add 3 new sections (~80 lines)
- `src/pages/investment-office/PortfolioOffice.tsx` — add allocation tabs, performance band, cash card (~100 lines)
- `src/pages/investment-office/RiskOffice.tsx` — add scenario stress grid, risk policy card (~90 lines)
- `src/pages/investment-office/ResearchLibrary.tsx` — add catalyst calendar, advisor memos (~60 lines)
- `src/pages/investment-office/InvestmentReceipts.tsx` — add expandable receipt detail (~50 lines)
- `src/pages/investment-office/PlatformConnections.tsx` — add permissions, sync history (~40 lines)
- `src/pages/investment-office/BeginnerMode.tsx` — add first investment wizard (~80 lines)
- `src/lib/investment-office/mock-data.ts` — add stress scenarios, risk policies, advisor memos data (~100 lines)

### No New Files Needed
All enhancements fit within existing pages and data structures.

