

# Advanced Simulation Engine — "Run a Million Futures"

## What Exists Today

- **ScenarioLabPage**: Basic scenario templates with 3 hardcoded outcomes (best/worst/likely)
- **Monte Carlo in RevenueForecast**: 1,000-iteration revenue simulation with histogram
- **GovernanceSimulatorService**: Policy-based what-if testing
- **LifeSimulator**: Life-shock stress testing

None of these deliver the cinematic "run millions of scenarios" experience. They're scattered, small-scale, and not visually immersive.

## What We're Building

A dedicated **Simulation Engine** page (`/simulation-engine`) — a cinematic, full-screen command center where users configure any decision, hit "Simulate", and watch millions of scenarios run in real-time with live-updating probability distributions, convergence animations, and outcome intelligence.

### Core Experience

**1. Decision Input Panel** (left sidebar)
- Natural language decision input: "Should I hire 3 engineers?" / "What if I raise prices 20%?"
- OR structured parameter sliders: revenue range, cost factors, time horizon, risk tolerance
- Domain selector: Business, Finance, Investment, Life
- Variable injection: drag in real data from Digital Twins, portfolio, cash flow
- Iteration count selector: 10K / 100K / 1M (with estimated run time)

**2. Live Simulation Viewport** (center — the wow)
- **Particle Storm**: Thousands of animated dots streaming across the screen, each representing a scenario outcome — they settle into a probability distribution curve in real-time
- **Convergence Animation**: Watch the mean/median/percentiles stabilize as iterations increase — a live-updating histogram that fills in like a waterfall
- **Heat Map Grid**: 2D grid showing outcome combinations (e.g., revenue × risk) with cells lighting up as scenarios hit them
- **Running Counter**: Large cinematic ticker showing iterations completed (e.g., "847,293 of 1,000,000") with scenarios/second speed indicator

**3. Results Intelligence Panel** (right sidebar)
- **Probability Distribution**: Final histogram with P10/P25/P50/P75/P90 markers
- **Outcome Clusters**: AI-identified clusters of scenarios ("In 34% of futures, you hit $1M+ revenue")
- **Risk Radar**: Spider chart showing risk dimensions across all scenarios
- **Sensitivity Analysis**: Which input variables had the most impact on outcomes
- **Decision Recommendation**: AI-synthesized verdict with confidence score
- **Tail Risk Alerts**: "In 3% of scenarios, cash reserves hit zero — here's why"

**4. Comparison Mode**
- Run two decisions side-by-side and overlay their distributions
- "Hire 3 engineers" vs "Hire 1 + outsource" — see which has better risk-adjusted outcomes
- Animated merge/split of distribution curves

**5. Simulation History**
- Every run saved with full parameters and results
- Replay any past simulation with one click
- Compare historical runs

### Technical Approach

- **Monte Carlo Engine**: Pure JS, runs in `requestAnimationFrame` batches (1000 iterations per frame) to keep UI responsive while animating
- **Canvas Renderer**: HTML5 Canvas for the particle storm and convergence animation — no WebGL needed
- **Web Worker** (optional enhancement): Offload heavy iterations to a worker thread for 1M+ runs
- **Framer Motion**: For panel transitions, result reveals, and comparison overlays
- **AI Integration**: Uses existing `chat-advisor` edge function to generate natural-language decision recommendations from simulation results

## Files

- **Create**: `src/pages/SimulationEnginePage.tsx` (~500 lines — full page with all panels)
- **Create**: `src/components/simulation/SimulationCanvas.tsx` (~200 lines — particle storm + convergence canvas)
- **Create**: `src/components/simulation/SimulationControls.tsx` (~150 lines — input panel with sliders and NLP input)
- **Create**: `src/components/simulation/SimulationResults.tsx` (~200 lines — results intelligence panel)
- **Create**: `src/lib/simulation/monte-carlo-engine.ts` (~150 lines — configurable multi-variable Monte Carlo with batched execution)
- **Edit**: `src/App.tsx` (add `/simulation-engine` route)

## Visual Design

- Dark cinematic background with subtle grid lines
- Primary accent: electric blue particles transitioning to purple/gold based on outcome quality
- Running counter uses monospace font with digit-flip animation
- Distribution curve glows and pulses as it stabilizes
- "Simulation Complete" moment: brief flash + particle burst + results slide in

