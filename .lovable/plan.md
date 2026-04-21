

# SITA OS Three-Pillar Innovation: Explainability UX, Unified Command Palette, Simulation/Sandbox

## Summary

Elevate three existing but scattered capabilities into unified, system-wide primitives. The project already has: a full Explainability Engine (`src/lib/services/explainability/`), an ExplainabilityDrawer, BoardroomExplainability, ScoreExplainabilityDrawer, and WhyThisResult; a 970-line UniversalCommandSurface with 200+ commands, live Supabase entity search, intent detection, capture mode, and AI ask mode; and a Monte Carlo simulation engine with particle canvas, market intelligence grounding, and scenario comparison. The work is to unify, cross-wire, and elevate these into coherent system-wide primitives.

---

## Pillar 1 -- Explainability UX (Unify and Elevate)

### What Already Exists
- `src/lib/services/explainability/index.ts` -- Full engine with 7 explanation types, reasoning chains, sources, alternatives, feedback
- `src/components/intelligence/ExplainabilityDrawer.tsx` -- Sheet drawer with reasoning chain, sources, alternatives, feedback buttons
- `src/components/sita/apps/boardroom/BoardroomExplainability.tsx` -- 8 rich explainable questions (Why/What/Who/How)
- `src/components/business/lead-inbox/ScoreExplainabilityDrawer.tsx` -- Lead scoring breakdown
- `src/components/sita/shell/WhyThisResult.tsx` -- Compact result-level reasoning indicator
- `src/components/ai/AIEmbeddedRecommendation.tsx` -- Inline AI recommendation card

### What to Build

**New shared components** (`src/components/explainability/`):

- `ExplainabilityCard.tsx` -- Compact inline card showing recommendation summary, confidence badge, and "Why?" toggle. Reusable across Advisory, Boardroom, Simulation results, CRM recommendations. Wraps the existing `Explanation` type.
- `TradeoffExplorer.tsx` -- Side-by-side comparison of alternatives with confidence/risk deltas. Consumes `explanation.alternatives` plus structured tradeoff metadata.
- `ConfidenceRiskMeter.tsx` -- Unified visual showing confidence % and risk level with color bands (green/amber/red). Replaces ad-hoc confidence displays.
- `ReasoningChainTimeline.tsx` -- Vertical timeline rendering of `explanation.reasoningChain` with step numbering and source links. Extracts the pattern from ExplainabilityDrawer into a standalone reusable.
- `WhatWouldChangePanel.tsx` -- Lists conditions that would alter the recommendation. Powered by a new `invalidators` field on the Explanation type.
- `ExplainabilityTrigger.tsx` -- Small "Why?" button that opens the ExplainabilityDrawer for any entity. Drop-in for any card/row.

**Extend the Explainability Engine** (`src/lib/services/explainability/index.ts`):

- Add `tradeoffs: Array<{option: string; pros: string[]; cons: string[]; confidence: number}>` to `Explanation`
- Add `invalidators: string[]` (conditions that would change the recommendation)
- Add `receiptId?: string` linking explanation to a trust receipt
- Add `explainSimulation(scenarioId, result, variables)` method for simulation-originated explanations

**Wire into existing surfaces:**

- Boardroom: Replace inline question data with calls to explainability engine; connect "Explain" tab to new shared components
- Advisory pages: Add ExplainabilityTrigger to every advisor recommendation card
- AI Chat: Add collapsible "Why this answer?" section using ExplainabilityCard
- Simulation Results: Generate explanation after each simulation run linking variables, assumptions, and confidence
- Command Palette: Show ExplainabilityTrigger on advisor-suggested results (already tagged via WhyThisResult)

---

## Pillar 2 -- Unified Command Palette (Consolidate and Extend)

### What Already Exists
- `src/components/sita/shell/UniversalCommandSurface.tsx` -- 970-line fully functional command surface with 200+ commands, 6 categories (capture/action/navigate/advisor/system), live Supabase entity search, AI ask mode, intent detection, keyboard navigation, recent commands, context suggestions
- `src/components/admin/AdminCommandPalette.tsx` -- Separate admin-only Cmd-K palette using shadcn CommandDialog
- `src/components/business/adaptive/AdaptiveCommandPalette.tsx` -- Business app-specific palette
- `src/shell-runtime/command-profile.ts` -- Profile-based command filtering (user/operator)
- `src/shell-runtime/launcher-profile.ts` -- App filtering for command palette

### What to Build

**Consolidate into one system** -- The UniversalCommandSurface is already the superior implementation. Extend it rather than maintaining three separate palettes.

**New command categories to add to COMMAND_INDEX:**

- `simulate` category: "Run business simulation", "Run finance scenario", "Test a decision", "Compare scenarios"
- `explain` category: "Why was this recommended?", "Show reasoning for last action", "View explanation history"
- Quick-launch simulation scenarios from command palette (navigate to SimulationEnginePage with preset)

**New file: `src/lib/command-registry/action-registry.ts`**

Typed action registry replacing the inline `COMMAND_INDEX` array:
```
ActionEntry {
  id, label, sublabel, icon, category, domain,
  keywords, path?, action?, riskLevel?,
  requiredPermission?, profiles?: DeploymentProfileKey[],
  sensitivity?: "public" | "internal" | "restricted",
  analyticsEvent?: string
}
```

Move the 200+ commands from inline JSX into this registry. Wire `filterCommandsForProfile` (already exists in `command-profile.ts`) into the UniversalCommandSurface so it respects user/operator deployment profiles.

**Extend UniversalCommandSurface:**

- Add `simulate` intent detection: queries starting with "what if", "test", "simulate", "scenario" route to simulation launch
- Add `explain` intent detection: queries starting with "why", "explain", "reasoning" open explainability history or trigger explanation for last action
- Add role-aware filtering using existing `filterCommandsForProfile`
- Add simulation quick-launch: selecting a simulate command opens SimulationEnginePage with the relevant preset
- Add command analytics: track which commands are used most (localStorage-based initially)

**Remove duplicate palettes:**

- `AdminCommandPalette` -- Merge its admin-specific routes into the action registry with `profiles: ["operator"]`
- `AdaptiveCommandPalette` -- Merge business-specific commands with `domain: "business"`
- Both become thin wrappers that render UniversalCommandSurface with filtered context

---

## Pillar 3 -- Simulation / Sandbox (Extend and Cross-Wire)

### What Already Exists
- `src/domains/simulation/monte-carlo-engine.ts` -- Full Monte Carlo engine: Box-Muller, batched execution, histograms, VaR, CVaR, sensitivity analysis, convergence detection, 576 lines
- `src/domains/simulation/market-intelligence.ts` -- Market data grounding for simulation variables
- `src/pages/SimulationEnginePage.tsx` -- Full cinematic page with canvas, controls, results, intelligence panel, comparison overlay
- `src/components/simulation/` -- 7 components (Canvas, Controls, Results, Advisor, CustomScenarioBuilder, MarketIntelligence, Comparison)
- `src/hooks/useSimulationEngine.ts` -- Hook wrapping scenario packs, dry runs, what-if, chaos, digital twins
- `src/lib/operations/recovery-simulation-policy.ts` -- 10 operational simulation scenarios (AI outage, DB failover, etc.)
- `SIMULATION_PRESETS` in monte-carlo-engine -- Existing presets for financial scenarios

### What to Build

**New domain scenario presets** (`src/domains/simulation/domain-scenarios.ts`):

Add three flagship scenario families to SIMULATION_PRESETS:

1. **Business Scenarios**: "Delay this hire", "Cut SaaS spend", "Restructure payment timing", "Adopt SITA as operating layer", "Slip this obligation"
2. **Concierge/Life Scenarios**: "Shift these obligations", "Automate more approvals", "What conflicts disappear?", "Delegate this to SITA"
3. **Finance/Planning Scenarios**: "Accelerate debt paydown", "Change loan term", "Compare mortgage paths", "Rebalance allocation", "Change budget rule"

Each scenario: id, label, domain, variables with sensible defaults, output formula, description.

**New component: `src/components/simulation/SimulationScenarioPicker.tsx`**

Premium scenario selection grid showing the three domain families with:
- Domain-colored cards (business/concierge/finance)
- Scenario description and variable count
- "Quick Run" and "Customize" buttons
- Recent simulations section

**New component: `src/components/simulation/ScenarioDeltaView.tsx`**

Before/after comparison showing:
- Baseline state (current metrics)
- Hypothetical change (what the scenario modifies)
- Modeled outcome (simulation result summary)
- Risk shift meter
- Recommendation from simulation

**New component: `src/components/simulation/SimulationMemoCard.tsx`**

Saveable summary card for a completed simulation:
- Scenario summary, key outcomes, confidence
- "Save to Boardroom" action (creates a boardroom intake item)
- "Generate Receipt" action (links to trust/proof)
- "Share with Advisor" action

**Boardroom integration:**

- New Boardroom tab or section: "Simulation Lab" -- run scenarios directly from within a boardroom session
- When a simulation completes inside the Boardroom, auto-generate an explainability entry
- Boardroom advisors can "interpret" simulation results (using existing advisor consultation patterns)

**Command Palette integration:**

- "what if I delay this hire?" in the command palette triggers intent=simulate, opens SimulationEnginePage with the relevant business preset
- "run a scenario" lists available scenario families

**Explainability integration:**

- Every completed simulation auto-generates an Explanation via `explainSimulation()` with the variables, assumptions, and confidence as the reasoning chain
- SimulationResults shows an ExplainabilityTrigger linking to the full explanation

---

## Cross-Wiring: How the Three Work Together

```text
Command Palette ──→ "what if I cut SaaS spend?" ──→ Simulation Engine
                                                         │
                                                         ▼
                                                   SimulationResults
                                                         │
                                                         ▼
                                                ExplainabilityCard
                                                  (Why this outcome?)
                                                         │
                                                         ▼
                                              Save to Boardroom ──→ Advisor interpretation
                                                         │
                                                         ▼
                                                    Receipt emitted
```

---

## Technical Details

### New Files (~12)

- `src/lib/command-registry/action-registry.ts` -- Typed action registry (extracted from UniversalCommandSurface)
- `src/components/explainability/ExplainabilityCard.tsx`
- `src/components/explainability/TradeoffExplorer.tsx`
- `src/components/explainability/ConfidenceRiskMeter.tsx`
- `src/components/explainability/ReasoningChainTimeline.tsx`
- `src/components/explainability/WhatWouldChangePanel.tsx`
- `src/components/explainability/ExplainabilityTrigger.tsx`
- `src/domains/simulation/domain-scenarios.ts`
- `src/components/simulation/SimulationScenarioPicker.tsx`
- `src/components/simulation/ScenarioDeltaView.tsx`
- `src/components/simulation/SimulationMemoCard.tsx`

### Modified Files (~6)

- `src/lib/services/explainability/index.ts` -- Add tradeoffs, invalidators, receiptId, explainSimulation
- `src/components/sita/shell/UniversalCommandSurface.tsx` -- Add simulate/explain intents, wire action registry, add profile filtering
- `src/pages/SimulationEnginePage.tsx` -- Add ScenarioPicker, MemoCard, explainability trigger
- `src/components/sita/apps/boardroom/BoardroomAppShell.tsx` -- Add "Simulation" tab wiring
- `src/domains/simulation/monte-carlo-engine.ts` -- Export domain scenario presets
- `src/components/simulation/SimulationResults.tsx` -- Add ExplainabilityTrigger after completion

### No Database Changes Required

All three pillars use existing client-side services and patterns. The explainability engine persists via `universal-service-persistence`. Simulation uses the existing Monte Carlo engine. Command registry is static TypeScript.

### Design Direction

All new components follow the existing glassmorphic, dark-theme, premium aesthetic. Explainability components use the established confidence color bands (green >= 80%, amber >= 60%, red < 60%). Simulation scenario cards use domain-specific accent colors matching the existing Business/Finance/Concierge palette. The command palette retains its current premium overlay treatment.

