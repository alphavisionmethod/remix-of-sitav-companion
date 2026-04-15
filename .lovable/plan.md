

# Part 2: Board of Advisors — Deep Intelligence Layer

## Summary

Add 7 new engines, 6 new UI components, and 1 new edge function to transform the existing Board of Advisors from a recommendation dashboard into a full cognitive operating system with memory, business-type adaptation, cross-advisor coordination, continuous profit loop, confidence scoring, and owner control.

## What Exists (Part 1 — Complete)

- 10 advisor personas with distinct personalities (`business-advisor-personas.ts`, 326 lines)
- Profitability engine with leak/cash/capacity/retention/growth analysis (`business-profitability-engine.ts`, 320 lines)
- 6-level autonomy model with domain permissions (`business-autonomy-engine.ts`, 136 lines)
- Action execution pipeline with simulate/approve/execute/rollback (`business-action-pipeline.ts`, 166 lines)
- Edge function for AI recommendations via Lovable AI (`business-advisor-intelligence`)
- Full boardroom UI: 6-tab page, 15 components, presence bar, health score, proof timeline

## What Part 2 Adds

### Engines (7 new files in `src/lib/engines/`)

**1. `advisor-memory-engine.ts`** — Multi-layer memory architecture
- Short-term: active tasks, current boardroom state, open decisions, pending approvals
- Mid-term: client histories, pipeline patterns, recurring failures, scheduling patterns
- Long-term: business goals, strategic priorities, risk patterns, seasonal shifts
- Preference: communication style, approval tolerance, detail depth, reminder sensitivity
- Procedural: what workflows work, what automations are allowed, what "done correctly" looks like
- All stored in-memory with `getMemorySnapshot()`, `correctMemory()`, `archiveMemory()` methods
- Memory items tagged with advisor, confidence, and expiry

**2. `business-context-graph.ts`** — Shared Business Context Model
- Unified graph containing: business identity, revenue engine, client model, financial model, operations model, people model, trust/governance model, performance model
- All advisors query one `SharedBusinessContext` instance
- Continuously updated from leads, invoices, tasks, clients, schedules
- Exposes `getBusinessSnapshot()` for edge function context injection

**3. `business-archetype-engine.ts`** — Business-Type Adaptation
- 12 archetypes: solo provider, local service, agency, consulting, appointment-based, project-based, recurring service, e-commerce, field ops, small team, hybrid, household-blend
- Each defines: priority advisors, top risks, profit leaks, key workflows, automation opportunities, important metrics
- `adaptBoard(archetype)` reshapes advisor weighting and module visibility
- Auto-detected from business context or manually selected

**4. `cross-advisor-coordinator.ts`** — Cross-Advisor Synthesis
- De-duplicates overlapping recommendations from multiple advisors
- Conflict resolution: when Sales and Client Success both surface same client, merges into single coherent action
- Produces ranked `CoordinatedRecommendation[]` with primary owner, contributing advisors, merged rationale
- Generates board-level `EscalationBundle` for multi-advisor consensus items

**5. `confidence-risk-scorer.ts`** — Decision Confidence & Risk Scoring
- 8-dimension scoring: confidence, urgency, business impact, reversibility, profitability relevance, relationship risk, operational risk, clarity
- Each recommendation/action gets a `ConfidenceProfile`
- Scores determine: recommendation ranking, surfacing priority, automation eligibility, approval requirements, boardroom display prominence
- Thresholds gated by autonomy level

**6. `continuous-profit-engine.ts`** — Continuous Profitability Loop
- Runs perpetual cycle: detect leaks → identify recoveries → prioritize easiest wins → simulate → recommend/execute → track outcome → learn
- Monitors 14 profit levers: missed leads, slow response, unclosed loops, quote delays, no-shows, underused calendar, overdue invoices, pricing weakness, client neglect, hidden costs, inefficient scheduling, over-servicing, subscription waste, team imbalance
- Output categories: recover revenue now, prevent loss, improve margin, improve efficiency, improve retention, improve capacity
- Integrates with memory engine to learn which profit actions actually worked

**7. `advisor-reflection-engine.ts`** — Reflection & Learning
- Tracks: what owner approved, what owner ignored, what improved outcomes, what should be tuned
- Learning signals stored as preference updates in memory engine
- Generates `ReflectionSummary` for weekly review: wins, misses, patterns detected, advisor accuracy scores
- Learning is visible, bounded, editable, never autonomous

### Edge Function (1 new)

**`supabase/functions/advisor-deep-intelligence/index.ts`**
- Extended AI function that accepts full business context graph + memory snapshot + archetype
- Generates persona-specific recommendations using advisor prompt templates enriched with memory context
- Returns structured output with 8-dimension confidence profiles
- Handles advisor coordination (de-dup, merge) server-side for richer synthesis
- Logs to `ai_inference_receipts` with extended metadata

### UI Components (6 new in `src/components/business/advisor-board/`)

**1. `MorningExecutiveBrief.tsx`** — Full morning brief surface
- Opens with time-aware greeting and business health pulse
- Top 3 priorities from profit engine
- Revenue at risk summary
- Cash pressure forecast
- Blocked workflows
- One strategic insight from Strategy Advisor
- One action SITA can take now (with approve button)
- Replaces the simpler `DailyBriefView`

**2. `RevenueRescuePanel.tsx`** — Revenue rescue moment
- When leads are slipping, shows: ranked callback list, draft follow-ups, schedule blocks, urgency explanation, expected recovery impact
- Prominent CTA: "Recover $X pipeline" with one-click action bundle

**3. `BusinessArchetypeSelector.tsx`** — Business type selector
- Premium card-based selector for 12 archetypes
- Shows what changes per archetype: priority advisors, key metrics, automation opportunities
- Persisted in context graph

**4. `AdvisorMemoryInspector.tsx`** — Memory inspection & correction
- Browse memory by advisor, layer (short/mid/long/preference/procedural)
- Edit/correct/archive individual memory items
- Shows confidence and expiry for each item

**5. `CrossAdvisorReasoningView.tsx`** — Cross-advisor synthesis display
- Shows how multiple advisors contributed to a recommendation
- Primary owner, supporting advisors, merged rationale, confidence breakdown
- Visual: advisor portraits with contribution badges

**6. `ExecutiveResetMode.tsx`** — Overload relief surface
- Detects owner overload (too many items, low clarity score)
- Narrows board to essentials only
- Shows only critical actions, fades non-essential surfaces
- CEO and EA advisors take prominence

### Hook Enhancement

**`useBusinessAdvisorBoard.ts`** — Extended with:
- Business context graph integration
- Memory engine state
- Archetype selection and adaptation
- Cross-advisor coordination pipeline
- Continuous profit loop signals
- Confidence profiles on all recommendations
- Reflection/learning data for weekly review
- Morning brief vs full boardroom mode toggle

### Page Enhancement

**`BusinessAdvisorBoardPage.tsx`** — Extended with:
- New tab: "Memory" for memory inspector
- Morning Brief mode (auto-activates before noon on first visit)
- Revenue Rescue panel in boardroom tab when pipeline risk > threshold
- Executive Reset Mode overlay when overload detected
- Archetype selector in autonomy tab
- Cross-advisor reasoning view on recommendation cards

## Architecture Flow

```text
Business Context Graph ──┬── Archetype Engine ── Advisor Weighting
                         ├── Memory Engine ────── Context Enrichment
                         ├── Profit Engine ────── Leak/Recovery Signals
                         └── Confidence Scorer ── Risk Profiles
                                    │
                         ┌──────────▼──────────┐
                         │  advisor-deep-       │
                         │  intelligence (AI)   │
                         └──────────┬──────────┘
                                    │
                         Cross-Advisor Coordinator
                                    │
                         ┌──────────▼──────────┐
                         │  Action Pipeline     │
                         │  (simulate/approve)  │
                         └──────────┬──────────┘
                                    │
                         Reflection Engine ── Memory Updates
```

## Files Created/Modified

| File | Action |
|---|---|
| `src/lib/engines/advisor-memory-engine.ts` | Create |
| `src/lib/engines/business-context-graph.ts` | Create |
| `src/lib/engines/business-archetype-engine.ts` | Create |
| `src/lib/engines/cross-advisor-coordinator.ts` | Create |
| `src/lib/engines/confidence-risk-scorer.ts` | Create |
| `src/lib/engines/continuous-profit-engine.ts` | Create |
| `src/lib/engines/advisor-reflection-engine.ts` | Create |
| `supabase/functions/advisor-deep-intelligence/index.ts` | Create |
| `src/components/business/advisor-board/MorningExecutiveBrief.tsx` | Create |
| `src/components/business/advisor-board/RevenueRescuePanel.tsx` | Create |
| `src/components/business/advisor-board/BusinessArchetypeSelector.tsx` | Create |
| `src/components/business/advisor-board/AdvisorMemoryInspector.tsx` | Create |
| `src/components/business/advisor-board/CrossAdvisorReasoningView.tsx` | Create |
| `src/components/business/advisor-board/ExecutiveResetMode.tsx` | Create |
| `src/hooks/useBusinessAdvisorBoard.ts` | Extend |
| `src/pages/business/BusinessAdvisorBoardPage.tsx` | Extend |

## No Database Changes

All memory, context, and archetype state managed in-memory and via existing tables (`ai_inference_receipts`, `advisor_action_queue`). No new migrations needed.

