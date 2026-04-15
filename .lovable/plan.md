

# SITA Business OS — Advanced Board of Advisors Implementation

## Summary

Transform the existing Business Advisor Board page into a full executive advisory boardroom with 10 specialized advisors, a multi-layer intelligence engine, autonomous action pipeline, profitability intelligence, and a premium cinematic UI — all wired into the existing Business OS shell.

## What Already Exists

- **BusinessAppShell** with sidebar entry `advisor-board` routing to `BusinessAdvisorBoardPage`
- **business-advisor-engine.ts** (772 lines) — stateless engine with `AdvisorOutput` types, board synthesis, escalation packets, disagreement detection
- **advisor-orchestration.ts** (221 lines) — multi-advisor registry with 9 core advisors, escalation rules, handoff protocols
- **advisor-config/registry.ts** — 26-advisor registry with capabilities, blocked actions, maturity levels
- **advisor-intelligence/** — confidence model, context assembler, council deliberation, hallucination taxonomy, memory lifecycle
- **advisor-board/** components — `BusinessAdvisorBoardPanel`, `AdvisorDisagreementCard`, `EscalationPacketPreview`, `ModuleAdvisorPanel`
- **Boardroom bridge** already wired for escalation and decisions

## What's Missing (The Build)

The current system is a read-only synthesis dashboard. It lacks:
1. The 10 distinct advisor personas with personality-driven outputs
2. The executive boardroom surface (Today/At Risk/Revenue/Cash/Clients/Ops/Team modules)
3. The 6-layer autonomy model with action execution pipeline
4. The profitability intelligence engine
5. Live AI-powered advisor recommendations via Lovable AI
6. The action queue with approval/simulation/proof workflow
7. Daily/weekly brief composers wired to real data
8. Premium cinematic UI with advisor portraits, presence indicators, trust mode controls

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                  Business Advisor Board                   │
│  ┌──────────┬──────────┬──────────┬──────────┬────────┐ │
│  │Executive │ Today's  │ At Risk  │ Revenue  │  Cash  │ │
│  │  Brief   │ Priorities│  Panel  │  Panel   │ Panel  │ │
│  ├──────────┼──────────┼──────────┼──────────┼────────┤ │
│  │ Clients  │   Ops    │   Team   │ Oppty    │ Action │ │
│  │  Panel   │  Panel   │  Panel   │  Panel   │ Queue  │ │
│  └──────────┴──────────┴──────────┴──────────┴────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │          Advisor Presence Bar (10 Advisors)          │ │
│  │  CEO · COO · Sales · Marketing · Finance · Client   │ │
│  │  Success · EA · People · Risk · Strategy             │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌──────────┬──────────┬──────────┬──────────┐          │
│  │Recommend │Simulation│ Approval │  Proof   │          │
│  │ Center   │  Queue   │  Queue   │ Timeline │          │
│  └──────────┴──────────┴──────────┴──────────┘          │
└─────────────────────────────────────────────────────────┘
```

## Implementation Plan (8 Steps)

### Step 1: Advisor Persona Engine
**File**: `src/lib/engines/business-advisor-personas.ts`

Define the 10 advisors with distinct personas — each with: role, personality traits, communication style, decision style, risk tolerance, domain scope, recommendation patterns, escalation rules. This is the "soul" file. Each advisor has a deterministic portrait URL (pravatar.cc), a color accent, and a structured prompt template for Lovable AI calls.

### Step 2: Business Profitability Intelligence Engine
**File**: `src/lib/engines/business-profitability-engine.ts`

Pure stateless engine with functions:
- `detectRevenueLeaks()` — missed leads, delayed follow-ups, quote delays, pipeline holes
- `detectMarginPressure()` — underpriced patterns, subscription waste, over-servicing
- `assessCashAwareness()` — bill calendar, invoice aging, receivables, reserve monitoring
- `assessCapacityIntelligence()` — overloaded schedules, workflow congestion, team gaps
- `assessRetentionRisk()` — neglected clients, churn signals, delivery delays
- `assessGrowthOpportunity()` — best lead sources, conversion timing, bottlenecks
- `computeBusinessHealthScore()` — composite 0-100 score
- `generateProfitabilityBrief()` — structured narrative for the executive brief

All functions work with the existing CRM, leads, invoices, and customer data structures.

### Step 3: Autonomy Policy Engine
**File**: `src/lib/engines/business-autonomy-engine.ts`

Implements the 6-level autonomy model:
- Level 1 (Observe) → Level 6 (Full Executive Automation)
- Domain permission scoping (email, files, finance, CRM, calendar, messaging, scheduling)
- Approval threshold rules (outbound comms, finance actions, schedule changes, destructive ops)
- Emergency pause mechanism
- Trust mode state machine
- Action proof logging interface

### Step 4: Action Execution Pipeline
**File**: `src/lib/engines/business-action-pipeline.ts`

The action layer that connects advisor recommendations to execution:
- `ActionQueue` — structured queue with status (proposed → simulated → approval-ready → approved → executing → completed → verified)
- `simulateAction()` — preview consequences before execution
- `requestApproval()` — route to approval queue
- `executeAction()` — run approved actions with proof emission
- `rollbackAction()` — reverse when possible
- Integration with existing `advisor_action_queue` DB table

### Step 5: Edge Function — Advisor Intelligence
**File**: `supabase/functions/business-advisor-intelligence/index.ts`

Edge function that calls Lovable AI (gemini-3-flash-preview) with persona-specific prompts to generate advisor recommendations. Accepts business context (leads, pipeline, invoices, clients, schedules) and returns structured `AdvisorOutput[]`. Handles rate limits (429/402) and logs to `ai_inference_receipts`.

### Step 6: Executive Boardroom Surface (Main UI)
Replace the current `BusinessAdvisorBoardPage` with a full executive boardroom. New components:

- **`src/pages/business/BusinessAdvisorBoardPage.tsx`** — Rewritten as the main orchestrator with tab navigation (Boardroom / Advisors / Actions / Proof / Briefs)
- **`src/components/business/advisor-board/ExecutiveBriefCard.tsx`** — Calm high-level business summary
- **`src/components/business/advisor-board/AdvisorPresenceBar.tsx`** — 10 advisors with portraits, status dots, confidence scores, click to expand
- **`src/components/business/advisor-board/BoardroomModuleGrid.tsx`** — The 12-module grid (Today, At Risk, Revenue, Cash, Clients, Ops, Team, Opportunities, Recommendations, Action Queue, Proof Stream, Health Score)
- **`src/components/business/advisor-board/ActionQueuePanel.tsx`** — Executable actions with approve/simulate/reject controls
- **`src/components/business/advisor-board/AdvisorDetailSheet.tsx`** — Deep-dive into single advisor with persona, history, recommendations, trust settings
- **`src/components/business/advisor-board/AutonomyLevelControl.tsx`** — Visual control for setting autonomy level per domain
- **`src/components/business/advisor-board/TrustModeIndicator.tsx`** — Always-visible indicator showing current autonomy posture
- **`src/components/business/advisor-board/ProfitLeakCard.tsx`** — Revenue/margin/cash leak visualization
- **`src/components/business/advisor-board/RevenueRecoveryCard.tsx`** — Recovery opportunity cards with one-click actions
- **`src/components/business/advisor-board/BusinessHealthScoreCard.tsx`** — Composite health with sparkline trend
- **`src/components/business/advisor-board/ProofTimelinePanel.tsx`** — Recent advisor actions with full audit trail
- **`src/components/business/advisor-board/RecommendationCard.tsx`** — Cross-advisor ranked recommendation with confidence, rationale, simulate button
- **`src/components/business/advisor-board/DailyBriefView.tsx`** — Morning brief and end-of-day review
- **`src/components/business/advisor-board/WeeklyReviewView.tsx`** — Weekly operating review with profit/risk summary

### Step 7: Hook — useBusinessAdvisorBoard
**File**: `src/hooks/useBusinessAdvisorBoard.ts`

Central hook that:
- Calls the edge function for AI-powered recommendations
- Runs local profitability engine for real-time signals
- Manages action queue state
- Manages autonomy level per domain
- Provides trust mode state
- Handles approve/reject/simulate flows
- Emits proof receipts to database

### Step 8: Wire Into Business OS Shell
- Add new sidebar entries under Intelligence group: split `advisor-board` into sub-pages (Boardroom, Advisor Council, Actions, Briefs, Autonomy Settings)
- Register the new pages in the `pages` map in `BusinessAppShell.tsx`
- Add advisor presence strip to the Business OS shell header area
- Wire profitability signals to the existing Boardroom bridge for cross-OS escalation

## Design Philosophy (Frontend)

- **Dark glassmorphic** boardroom aesthetic matching existing SITA design tokens
- **Premium advisor portraits** (96px circular, pravatar.cc) with speaking indicators and status dots
- **Calm modular layout** — no noise, no clutter, scannable in 5 seconds
- **Confidence visualizations** — green/amber/orange/red bars with numeric scores
- **Action cards** with approve/simulate/reject as primary CTAs
- **Animated transitions** — framer-motion stagger, subtle scale-in for cards
- **Trust mode strip** always visible — shows what's autonomous vs. requires approval
- **Profitability prominently featured** — revenue at risk, margin leaks, cash pressure shown as first-class metrics
- **Advisor personality visible** — each advisor card shows their communication style and decision approach

## Database (No New Tables)

Uses existing tables: `advisor_requests`, `advisor_action_queue`, `ai_inference_receipts`, `boardroom_items`, `boardroom_recommendations`. No new migrations needed.

## Files Changed/Created

| File | Action |
|---|---|
| `src/lib/engines/business-advisor-personas.ts` | Create — 10 advisor personas |
| `src/lib/engines/business-profitability-engine.ts` | Create — profitability intelligence |
| `src/lib/engines/business-autonomy-engine.ts` | Create — 6-level autonomy model |
| `src/lib/engines/business-action-pipeline.ts` | Create — action execution pipeline |
| `supabase/functions/business-advisor-intelligence/index.ts` | Create — AI edge function |
| `src/hooks/useBusinessAdvisorBoard.ts` | Create — central board hook |
| `src/pages/business/BusinessAdvisorBoardPage.tsx` | Rewrite — full boardroom surface |
| `src/components/business/advisor-board/ExecutiveBriefCard.tsx` | Create |
| `src/components/business/advisor-board/AdvisorPresenceBar.tsx` | Create |
| `src/components/business/advisor-board/BoardroomModuleGrid.tsx` | Create |
| `src/components/business/advisor-board/ActionQueuePanel.tsx` | Create |
| `src/components/business/advisor-board/AdvisorDetailSheet.tsx` | Create |
| `src/components/business/advisor-board/AutonomyLevelControl.tsx` | Create |
| `src/components/business/advisor-board/TrustModeIndicator.tsx` | Create |
| `src/components/business/advisor-board/ProfitLeakCard.tsx` | Create |
| `src/components/business/advisor-board/RevenueRecoveryCard.tsx` | Create |
| `src/components/business/advisor-board/BusinessHealthScoreCard.tsx` | Create |
| `src/components/business/advisor-board/ProofTimelinePanel.tsx` | Create |
| `src/components/business/advisor-board/RecommendationCard.tsx` | Create |
| `src/components/business/advisor-board/DailyBriefView.tsx` | Create |
| `src/components/business/advisor-board/WeeklyReviewView.tsx` | Create |
| `src/components/sita/apps/business/BusinessAppShell.tsx` | Modify — add new sidebar entries + page registrations |

