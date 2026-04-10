

# Investment Office Enhancement Plan

## Current State (Audit Complete)

The Investment Office is 100% implemented with 38 pages (4,879 lines), 27+ Supabase tables, 9 deeply-modeled advisors, and complete routing. All 10 spec layers are functional. No stubs, no placeholders, no duplicates.

## Enhancement Plan — Premium "Wow" Features

### 1. Sparkline Mini-Charts on Instrument Cards (Market Explorer, Boardroom, Watchlists)

Add inline SVG sparkline components to every instrument tile showing 7-day price movement. This is the single biggest visual upgrade to make it feel like a real terminal.

- Create `SparklineChart` component (SVG-based, ~40 lines)
- Add mock 7-day price history arrays to each instrument in mock-data
- Integrate into MarketExplorer instrument cards, Boardroom movers, Watchlist rows, and Portfolio holdings

### 2. Animated Ticker Ribbon on Boardroom

Add a horizontally scrolling price ticker at the top of InvestmentBoardroom showing all portfolio positions with live-feeling price animations. CSS marquee-style with staggered color transitions for gainers/losers.

### 3. Glowing Pulse on Advisor Confidence Badges

Add a subtle CSS pulse animation on advisor confidence badges — green glow for "high", amber for "moderate", red for "low". Makes the Advisor Board feel alive.

### 4. Trade Prep Receipt Sheet (Pre-Execution)

Enhance ExecutionDesk "review" state with a formal Trade Prep Receipt — a beautifully formatted document-style card showing intent, rationale, advisor views, risk assessment, and approval status before execution. This is the "every decision gets a receipt" wow moment.

### 5. "What Changed" Summary Card on Boardroom

Add a dedicated "Since Last Visit" card to the Boardroom showing portfolio changes, advisor view shifts, catalyst countdowns, and watchlist movements — with color-coded severity badges. Uses the existing MarketMemoryFeed data.

### 6. Conviction + Risk Overlay Badges on Holdings

Add small conviction/risk overlay indicators to every holding row in PortfolioOffice — showing thesis conviction level and risk contribution as compact inline badges, linking directly to the thesis journal.

### 7. Strategy Template Gallery in Strategy Studio

Add a "Strategy Templates" section to StrategyStudio with 6 pre-built allocation templates (Conservative Diversified, Growth & Innovation, Crypto Satellite, Event Speculation, Commodity Hedge, Income Preservation) — each showing target allocation bars and one-tap "Apply" simulation.

### 8. Cinematic Entry Animation on InvestmentGate

Enhance the Investment Office landing page with staggered entrance animations — fade-up hero, delayed stats, cascading navigation cards with scale-in transitions. Make the first impression feel premium.

## Technical Approach

- All enhancements are additive (no breaking changes)
- SparklineChart is a new reusable primitive component
- Mock data extensions are backward-compatible
- CSS animations use existing Tailwind keyframes + new custom ones
- No new database tables needed
- No new dependencies required

## Files Modified

- `src/components/sita/SparklineChart.tsx` (new)
- `src/lib/investment-office/mock-data.ts` (add sparkline data)
- `src/pages/investment-office/InvestmentBoardroom.tsx` (ticker + what-changed + sparklines)
- `src/pages/investment-office/MarketExplorer.tsx` (sparklines on cards)
- `src/pages/investment-office/PortfolioOffice.tsx` (conviction overlays)
- `src/pages/investment-office/ExecutionDesk.tsx` (trade prep receipt)
- `src/pages/investment-office/StrategyStudio.tsx` (template gallery)
- `src/pages/investment-office/AdvisorBoard.tsx` (pulse animations)
- `src/pages/investment-office/InvestmentGate.tsx` (cinematic entry)
- `src/pages/investment-office/WatchlistsSignals.tsx` (sparklines)
- `tailwind.config.ts` (pulse keyframes)

