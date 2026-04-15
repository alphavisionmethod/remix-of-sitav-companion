

# Board of Advisors Part 2 — Advanced Intelligence Layer Implementation

## Current State

The system already has substantial infrastructure built across 5 implementation parts:

**Engines (20+ files in `src/lib/engines/`):**
- `business-context-graph.ts` (248 lines) — shared context with all required models
- `continuous-profit-engine.ts` (161 lines) — profit leak detection loop
- `advisor-memory-engine.ts` (210 lines) — 5-layer memory architecture
- `cross-advisor-coordinator.ts` (136 lines) — de-duplication and ranking
- `business-autonomy-engine.ts` (136 lines) — 6-level autonomy with domain policies
- `advisor-tool-execution-engine.ts` (435 lines) — tool registry, approval gates, rollback
- `confidence-risk-scorer.ts` (110 lines) — 8-dimension scoring
- `business-archetype-engine.ts` (224 lines) — 12 business archetypes
- `advisor-reflection-engine.ts` (150 lines) — outcome tracking and learning
- `business-radar-engine.ts`, `strategic-planning-engine.ts`, `client-intelligence-engine.ts`, `advisor-performance-engine.ts`, `decision-journal-engine.ts`

**UI (37 components in `src/components/business/advisor-board/`):**
16-tab boardroom page with Boardroom, Insights, Chat, Scenarios, Debates, Actions, Proof, Tools, Radar, Planning, Clients, Performance, Journal, Memory, Report, Autonomy

**Edge Functions (2):**
- `advisor-deep-intelligence` — AI recommendation generation via Lovable AI Gateway
- `business-advisor-intelligence` — Authenticated version with receipt logging

**Hook:** `useBusinessAdvisorBoard.ts` (427 lines) orchestrating all engines

## What Is Missing

Despite the breadth, the system has critical gaps that prevent it from being "production-grade advanced":

### 1. Backend Persistence (all engines use in-memory state)
All engines (`AdvisorMemoryEngine`, `ContinuousProfitEngine`, `ActionPipeline`, `ReflectionEngine`, `ToolExecutionEngine`) use local class instances that reset on page reload. No data persists to the database.

### 2. Backend API Layer
No edge function exists for: boardroom state panels, memory CRUD, action lifecycle, approval queue, proof timeline, health scoring, profitability signals, autonomy policy management, tool permissions.

### 3. Cognitive Pipeline Edge Function
The `advisor-deep-intelligence` function is a single-shot prompt — it lacks the 8-layer cognitive pipeline (Perception → Normalization → Contextualization → Reasoning → Synthesis → Planning → Action → Reflection).

### 4. Admin Control Plane
No admin pages exist for: advisor catalog management, prompt/policy admin, recommendation monitoring, tool access admin, memory inspection, model routing console.

### 5. Database Tables for Board of Advisors
Missing tables: `advisor_memory`, `advisor_actions`, `advisor_recommendations`, `advisor_tool_executions`, `business_health_scores`, `profit_signals`, `advisor_policies`, `advisor_reflections`.

---

## Implementation Plan

### Phase 1: Database Schema (Migration)
Create 8 new tables with RLS policies:

- **`advisor_memory`** — Persists the 5-layer memory (short/mid/long/preference/procedural) per user
- **`advisor_recommendations`** — Persists AI-generated recommendations with confidence profiles, status tracking (new/accepted/dismissed/snoozed/executed)
- **`advisor_actions`** — Full action lifecycle (proposed → simulated → approved → executed → rolled_back) with proof records
- **`advisor_tool_executions`** — Tool execution log with approval state, parameters, results, rollback records
- **`business_health_scores`** — Time-series health dimension scores (revenue, cash, operations, clients, team, focus)
- **`profit_signals`** — Continuous profit engine signals with resolution tracking
- **`advisor_reflections`** — Owner action tracking (approved/rejected/ignored/modified) per recommendation
- **`advisor_autonomy_policies`** — Per-user domain autonomy levels and global settings

All tables: `user_id` scoped, RLS policy `auth.uid() = user_id`, timestamps.

### Phase 2: Unified Board API Edge Function
Create `business-board-api` edge function — a single authenticated endpoint handling all board operations via action routing:

**Boardroom state endpoints:**
- `GET summary` — Aggregated executive brief from real data
- `GET today` / `at-risk` / `revenue` / `cash` / `clients` / `operations` / `team` / `opportunities`
- `GET health` — Business health scores
- `GET action-queue` / `approval-queue` / `proof-timeline`

**Advisor endpoints:**
- `GET advisors` / `GET advisors/:id/recommendations` / `GET advisors/:id/memory`
- `PATCH advisors/:id/intensity` / `PATCH advisors/:id/enabled`

**Recommendation lifecycle:**
- `POST recommendations/generate` — Triggers the cognitive pipeline
- `POST recommendations/:id/approve` / `deny` / `snooze` / `dismiss`

**Action lifecycle:**
- `POST actions/simulate` / `execute` / `approve` / `deny` / `cancel` / `revert`
- `GET actions/:id/proof`

**Memory CRUD:**
- `GET memory` / `POST memory/correct` / `POST memory/archive` / `POST memory/reset-slice`

**Autonomy/Policy:**
- `GET autonomy` / `PATCH autonomy` / `POST autonomy/emergency-stop` / `POST autonomy/resume`

**Profitability:**
- `GET profitability` / `GET profitability/revenue-leaks` / `POST profitability/recompute`

### Phase 3: Advanced Cognitive Pipeline
Upgrade `advisor-deep-intelligence` edge function to implement the full 8-layer cognitive architecture:

1. **Perception** — Query real user data (CRM contacts, invoices, tasks, calendar) from database
2. **Normalization** — Transform raw data into structured business signals (lead-stale, invoice-overdue, workflow-blocked)
3. **Contextualization** — Enrich signals with business archetype, goals, cash condition, owner preferences from `advisor_memory`
4. **Reasoning** — Per-advisor persona-specific interpretation using advisor persona prompts
5. **Synthesis** — Cross-advisor de-duplication and consensus scoring
6. **Planning** — Generate executable action plans with dependency chains
7. **Action** — Propose tool executions through the approval pipeline
8. **Reflection** — Update memory and learning from outcomes

The function will query real tables (`contacts`, `invoices`, `tasks`, etc.) and memory, then pass enriched context to the AI model.

### Phase 4: Wire Frontend to Real Backend
Update `useBusinessAdvisorBoard.ts` to:
- Replace all in-memory engine singletons with `supabase.functions.invoke("business-board-api", ...)` calls
- Persist actions, memory, reflections, tool executions to database
- Load state from database on mount
- Add optimistic updates with rollback
- Add realtime subscriptions for `advisor_actions` and `advisor_recommendations`

### Phase 5: Model Routing in Edge Function
Add task-type-based model routing in the cognitive pipeline:

| Task | Model | Rationale |
|------|-------|-----------|
| Signal classification | `gemini-2.5-flash-lite` | Fast, cheap |
| Recommendation generation | `gemini-3-flash-preview` | Balanced |
| Strategic synthesis | `gpt-5-mini` | Strong reasoning |
| Draft writing | `gemini-2.5-flash` | Good prose |
| Financial risk analysis | `gpt-5` | High accuracy needed |

Fallback chains: primary → secondary → cached result.

### Phase 6: Admin Control Plane Pages
Create 6 admin pages under `/admin/advisor-board/`:

1. **Advisor Catalog** — Enable/disable advisors, set intensity, domain scope, archetype weights
2. **Recommendation Monitor** — Live recommendation feed, confidence distribution, collision detection, suppression
3. **Action/Approval Admin** — Recent actions, approval history, failed actions, policy evaluations
4. **Memory Inspector** — Browse/correct/archive memory by advisor, layer, confidence
5. **Autonomy Policy Editor** — Domain permission matrix, threshold editor, emergency controls
6. **Profitability Dashboard** — Profit signal quality, leak patterns, recovery tracking

### Phase 7: Wow Experience Upgrades
Enhance existing components with persistence-backed features:

- **Morning Executive Brief** — Generated from real overnight data, cached daily
- **Weekly Board Review** — Aggregated from real week's recommendations, actions, outcomes
- **Executive Reset Mode** — Persists focus state, auto-triggers based on overload score threshold
- **Revenue Rescue** — Queries real stale leads and overdue invoices
- **Profit Leak Reveal** — Sources from real `profit_signals` table

---

## Technical Details

### Database Migration SQL (~200 lines)
8 tables with composite indexes, RLS policies using `auth.uid()`, `updated_at` triggers.

### Edge Function Architecture
Single `business-board-api` function (~600 lines) using action-based routing pattern:
```
POST /business-board-api
Body: { action: "recommendations.generate", payload: {...} }
```
This avoids 50+ separate edge functions while keeping the API clean.

### Realtime
Enable realtime on `advisor_actions` and `advisor_recommendations` for live board updates.

### File Count
- 1 migration file
- 2 edge functions (1 new `business-board-api`, 1 upgraded `advisor-deep-intelligence`)
- 1 updated hook (`useBusinessAdvisorBoard.ts`)
- 6 new admin pages
- ~2 updated components for real data wiring

### Execution Order
1. Database migration (tables + RLS + triggers)
2. `business-board-api` edge function
3. Upgrade `advisor-deep-intelligence` with cognitive pipeline
4. Wire `useBusinessAdvisorBoard.ts` to real backend
5. Create admin pages
6. Add realtime subscriptions
7. Verify end-to-end with TypeScript check

