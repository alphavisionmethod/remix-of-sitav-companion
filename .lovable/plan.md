

# Simulation Engine — Intelligence-Grade Upgrade

## What We're Adding

Transform the simulation engine from a standalone calculator into an **intelligence-grade decision system** that pulls real-world data, uses validated mathematical models, and provides grounded (non-hallucinating) analysis.

## 5 Upgrades

### 1. Real-Time Market Intelligence Feed
A news and data panel inside the simulation engine that fetches live information before and during simulations.
- **Market data sidebar tab**: Pull real-time stock prices, crypto rates, forex, interest rates via the Perplexity connector (already available) — searches like "current S&P 500 price", "US 30-year mortgage rate today"
- **News sentiment scanner**: Before running a simulation, fetch relevant news headlines and extract sentiment scores (bullish/bearish/neutral) that auto-adjust variable ranges
- **"Ground My Assumptions" button**: One click fetches current real-world values for all variables in a preset (e.g., actual average engineer salary, actual mortgage rates) and updates sliders automatically
- Uses existing Perplexity connector for web search + Lovable AI for sentiment extraction

### 2. Validated Financial Formula Library
Replace naive formulas with mathematically correct, peer-reviewed models.
- **DCF (Discounted Cash Flow)**: Proper NPV calculation with discount rates and terminal value
- **Black-Scholes**: Option pricing for investment scenarios
- **Kelly Criterion**: Optimal position sizing for risk scenarios
- **Compound Interest**: Exact TVM (time value of money) formulas instead of linear approximations
- **CAPM (Capital Asset Pricing Model)**: Risk-adjusted expected returns
- **Sharpe Ratio**: Risk-adjusted performance measurement
- Each formula tagged with a `formulaType` identifier and unit-tested for mathematical correctness
- New test file validates every formula against known analytical solutions

### 3. Confidence & Grounding System (No-Hallucination Layer)
Integrate the existing no-hallucination framework into simulation results.
- Every simulation result shows a **grounding badge**: "Grounded in real data" vs "Based on user assumptions"
- Variables that were auto-filled from real data get a green verified icon; user-guessed ones get an amber warning
- **Data freshness indicator**: Shows when market data was last fetched
- **Assumption transparency**: Every output shows exactly which inputs drove it — no black box
- Links to the existing `createConfidenceEnvelope` and `buildGroundingReport` from `no-hallucination.ts`

### 4. Multi-Run Comparison & Convergence Analytics
Advanced statistical tools for serious decision-making.
- **Side-by-side comparison**: Run two scenarios and overlay their distributions on the same canvas — animated merge/diverge visualization
- **Convergence diagnostic**: Show whether the simulation has converged (mean stability within 0.1% over last 10K iterations) — warns if results are still volatile
- **Correlation matrix**: When running multi-variable simulations, show which variables are driving outcomes together
- **Value at Risk (VaR)**: Standard financial risk metric calculated at 95% and 99% confidence levels
- **Expected Shortfall (CVaR)**: Average loss in the worst X% of scenarios

### 5. AI Decision Advisor Integration
Post-simulation AI analysis using the existing advisor infrastructure.
- After simulation completes, automatically generates a **plain-English decision brief** via Lovable AI
- Brief includes: "Based on 1M scenarios, hiring 3 engineers has a 73% chance of positive ROI within 18 months. The key risk factor is ramp-up time (sensitivity: 42%). Current market conditions (tech hiring market cooling) suggest the lower end of salary estimates is achievable."
- Uses existing `chat-advisor` edge function with the simulation results as structured context
- Includes a "Challenge This" button that runs a devil's advocate analysis

## Files

- **Create**: `src/lib/simulation/financial-formulas.ts` — Validated DCF, Black-Scholes, Kelly, CAPM, Sharpe, VaR, CVaR (~200 lines)
- **Create**: `src/lib/simulation/market-intelligence.ts` — Perplexity-powered data fetching, sentiment extraction, assumption grounding (~150 lines)
- **Create**: `src/components/simulation/MarketIntelligencePanel.tsx` — News feed, data grounding UI, freshness indicators (~180 lines)
- **Create**: `src/components/simulation/ComparisonOverlay.tsx` — Multi-run comparison with overlaid distributions (~120 lines)
- **Create**: `src/components/simulation/SimulationAdvisor.tsx` — AI decision brief panel post-simulation (~130 lines)
- **Create**: `src/test/financial-formulas.test.ts` — Unit tests validating every formula against known solutions
- **Edit**: `src/lib/simulation/monte-carlo-engine.ts` — Add convergence diagnostics, VaR/CVaR to results, formula library presets
- **Edit**: `src/components/simulation/SimulationResults.tsx` — Add grounding badges, VaR display, advisor brief
- **Edit**: `src/components/simulation/SimulationControls.tsx` — Add "Ground My Assumptions" button, formula type selector
- **Edit**: `src/pages/SimulationEnginePage.tsx` — Wire up intelligence panel, comparison mode, advisor

## Technical Notes
- Perplexity connector provides real-time web search without API key hassle
- Financial formulas are pure deterministic math — no LLM involvement, no approximation
- Convergence detection uses rolling window standard deviation of the running mean
- All grounding metadata follows existing `no-hallucination.ts` patterns
- AI advisor brief is the only LLM-generated part — clearly labeled as "AI Analysis" with confidence scoring

