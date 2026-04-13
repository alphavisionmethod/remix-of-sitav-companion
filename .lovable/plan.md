

# Simulation Engine — More Presets + User-Created Scenarios

## What We're Building

Expand the simulation engine with 10+ built-in scenario presets across all domains, plus a "Create Custom Scenario" builder so users can define their own variables, formulas, and save them for reuse.

## Current State

- 3 hardcoded presets: Hire Engineers, Raise Prices, Enter New Market
- All in Business/Finance/Investment domains — nothing for "Life"
- No way for users to add their own scenarios
- Variables are editable but structure is fixed to the preset

## Plan

### Step 1: Add 10+ new presets to `monte-carlo-engine.ts`

New presets across all domains:

**Business:** Launch New Product, Pivot Business Model, Open Second Location
**Finance:** Refinance Mortgage, Emergency Fund Strategy, Debt Payoff vs Invest
**Investment:** Real Estate Purchase, Crypto Allocation, Diversify Portfolio
**Life:** Career Change, Relocate to New City, Start a Family, Early Retirement

Each with 3-5 variables and a meaningful formula.

### Step 2: Add Custom Scenario Builder to `SimulationControls.tsx`

A "Create Your Own" button at the bottom of the presets list that opens an inline builder:

- **Name & question** fields
- **Add Variable** button: user types label, sets min/max/mean, picks distribution
- **Formula builder**: Simple dropdown combining variables with operations (sum, multiply, subtract) — no code writing needed. E.g., "Variable A × Variable B − Variable C"
- **Save** button stores custom scenarios in localStorage (and optionally to the database for persistence across devices)
- Custom scenarios appear alongside built-in presets, tagged with a "Custom" badge
- Edit/delete actions on custom scenarios

### Step 3: Minor UX improvements

- Search/filter bar above presets when list gets long
- "Popular" badge on the most-used presets
- Domain filter now properly shows "Life" presets

## Files

- **Edit**: `src/lib/simulation/monte-carlo-engine.ts` — add 10+ new presets
- **Edit**: `src/components/simulation/SimulationControls.tsx` — add custom scenario builder UI, search, localStorage save/load
- **Create**: `src/components/simulation/CustomScenarioBuilder.tsx` (~180 lines — the inline builder form)

## Technical Details

- Custom scenarios stored in `localStorage` under key `sita-custom-simulations`
- Formula builder uses a simple AST: `{ type: "multiply"|"add"|"subtract", operands: [varId, varId] }` compiled to a JS function at runtime
- No database migration needed — localStorage is sufficient for MVP, can be upgraded to cloud persistence later

