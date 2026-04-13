

# Investment Office Wow Upgrade — War Room, Live Trading Floor, and Advisor Integration

## Current State

The Investment Office has 39 pages — the richest domain in SITA OS. However:
- The **AdvisorBoard** (791 lines) is a standalone implementation with its own view modes, NOT using the new `AdvisorCouncilShell` with Meeting Room, Voice, and Personality features
- Pages like **Decision Theater**, **Capital Twin**, and **Boardroom** are functional but visually flat — standard cards and grids without the premium animations used elsewhere
- There is no **live trading floor** visual experience or **War Room** for crisis/opportunity moments

## Plan

### Step 1: Upgrade Investment AdvisorBoard to use AdvisorCouncilShell

Replace the 791-line custom implementation with the shared `AdvisorCouncilShell`, giving Investment advisors instant access to: Meeting Room (with voice synthesis), Debate View, Ask Chat, Timeline, Detail Drawer with Personality Editor — all the features Money and Business already have.

Map the 5 existing investment advisors (`INVESTMENT_ADVISORS`) into `AdvisorConfig` format. Keep the existing Council and Compare views as custom tabs within the shell.

### Step 2: Create a Live Trading Floor visualization

Create `src/pages/investment-office/TradingFloor.tsx` — an immersive real-time market visualization:
- **Heatmap grid**: Asset classes as colored blocks (green/red intensity by performance), inspired by finviz treemaps
- **Live ticker ribbon** (reuse existing `TickerRibbon` component)
- **Sector rotation radar**: Animated radar chart showing capital flow between sectors
- **Volume pulse**: Subtle background pulse animation synced to simulated market activity
- **Quick-action hotspots**: Click any asset block to jump to its instrument detail or initiate a trade review

### Step 3: Create an Investment War Room

Create `src/pages/investment-office/WarRoom.tsx` — activates when high-conviction events occur:
- **Threat/Opportunity dashboard**: Split-screen with red (risks) and green (opportunities) panels
- **Advisor rapid-response**: Shows all 5 advisors' instant takes on the event, streaming in real-time via `chat-advisor`
- **Impact simulation**: Visual showing portfolio impact (before/after bars) of the event
- **Action panel**: Pre-drafted trades with behavioral firewall status, ready for one-click review
- **Crisis timeline**: Horizontal timeline of cascading events with severity indicators
- Premium dark UI with amber/red accent lighting for urgency

### Step 4: Create a Portfolio Globe / 3D Asset Map

Create `src/components/investment/PortfolioGlobe.tsx` — a visual "globe" of your portfolio:
- CSS-based 3D rotating ring of asset cards arranged in a circle
- Each card shows symbol, allocation %, and a sparkline
- Size of each card proportional to position size
- Hover expands the card with full details
- Center shows total portfolio value with animated count-up
- Embed this as a hero section in the Investment Boardroom dashboard

### Step 5: Upgrade Decision Theater with cinematic mode

Enhance `DecisionTheater.tsx`:
- **Spotlight animation**: When reviewing a trade, dim everything except the active decision card (theatrical spotlight effect)
- **Advisor voting panel**: Each advisor casts a vote (approve/reject/abstain) with animated card flip reveal
- **Countdown timer**: Optional decision deadline with a dramatic countdown ring
- **Sound design hooks**: Visual "audio wave" indicators (no actual sound unless voice is enabled)

### Step 6: Add routes and navigation

Register `TradingFloor` and `WarRoom` in the router. Add navigation entries in the Investment Office sidebar/menu.

## Files

- **Edit**: `src/pages/investment-office/AdvisorBoard.tsx` (replace with AdvisorCouncilShell)
- **Create**: `src/pages/investment-office/TradingFloor.tsx` (~250 lines)
- **Create**: `src/pages/investment-office/WarRoom.tsx` (~300 lines)
- **Create**: `src/components/investment/PortfolioGlobe.tsx` (~150 lines)
- **Edit**: `src/pages/investment-office/DecisionTheater.tsx` (cinematic upgrades)
- **Edit**: `src/pages/investment-office/InvestmentBoardroom.tsx` (add PortfolioGlobe hero)
- **Edit**: Router config (add new routes)

## Technical Details

- Investment advisors mapped to `AdvisorConfig`: Macro Strategist, Risk Sentinel, Thesis Analyst, Behavioral Coach, Execution Specialist
- Trading Floor heatmap uses CSS Grid with `background-color` interpolated from performance data
- Portfolio Globe uses CSS `transform: rotateY()` with `perspective` for 3D ring, animated via Framer Motion
- War Room streams advisor responses via staggered `chat-advisor` calls (same pattern as Meeting Room)
- Decision Theater spotlight uses `box-shadow` with large spread + dark overlay

