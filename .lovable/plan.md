

# Lead Scoring & Prioritization Engine — Implementation Plan

## What We're Building

A fully wired, explainable lead scoring engine that replaces static mock scores with a living prioritization system. It powers intelligent ranking, urgency detection, stale-risk alerts, recovery identification, and Boardroom escalation — all with beautiful, premium UI that matches SITA OS's dark glassmorphic design.

## Current State

- **Lead Inbox exists** with 12 mock leads, static `quality_score`, triage actions, detail panel, bulk bar, duplicate drawer
- **No scoring engine** — scores are hardcoded in mock data
- **Feature governance specs** exist for `business.lead-scoring` but no actual implementation
- **Business Profile Engine** exists with archetype detection (ecommerce, service, brick-and-mortar, etc.)

## Architecture

```text
InboxItem data
     ↓
┌─────────────────────────────┐
│  Lead Scoring Engine        │
│  src/lib/engines/           │
│  lead-scoring-engine.ts     │
│                             │
│  15 weighted factors        │
│  × business-mode adapters   │
│  = explainable score result │
└─────────────────────────────┘
     ↓
LeadScoreResult {
  priorityScore, priorityTier, conversionLikelihood,
  urgencyBand, heatStatus, staleRisk, recoveryPotential,
  boardroomWorthy, confidenceLevel, nextBestAction,
  topPositiveFactors[], topNegativeFactors[],
  explanation, whatChanged[]
}
     ↓
┌──────────────────────────────────────────────┐
│  UI Components (6 new + 4 enhanced)          │
│  - PriorityStack (ranked view)               │
│  - ScoreExplainabilityDrawer                 │
│  - LeadHeatIndicator                         │
│  - PriorityEvolutionTimeline                 │
│  - ScoringDashboard (overview cards)         │
│  - LeadTriageCard (enhanced with live score) │
│  - LeadDetailPanel (enhanced with drawer)    │
│  - LeadInboxHeader (enhanced KPIs)           │
└──────────────────────────────────────────────┘
```

## Implementation Batches

### Batch 1 — Scoring Engine Core (~400 lines)
**File: `src/lib/engines/lead-scoring-engine.ts`**

- `LeadScoreResult` interface with all output fields
- `ScoreFactor` type with name, rawValue, normalizedScore (0-100), weight, polarity, explanation
- 15 scoring factors: sourceQuality, responseSpeed, recency, engagement, fit, valuePotential, appointmentStatus, quoteIntent, communicationQuality, ownerResponsiveness, businessProfileRelevance, urgencyWindow, leadAge, priorHistory, reactivationPotential
- Business-mode weight adapters (ecommerce, service, brick-and-mortar, employee-heavy, hybrid) pulling from BusinessProfileContext
- `computeLeadScore(item, businessMode)` → `LeadScoreResult`
- `computeBatchScores(items, businessMode)` → sorted scored list
- Priority tiers: Critical Now, High Priority, Active Watch, Nurture, Recovery Candidate, Low Priority
- Urgency bands: Heating Up, Needs Response Today, At Risk of Cooling, Quiet but Recoverable, Stable
- Confidence levels based on data completeness
- `getNextBestAction()` logic
- Boardroom-worthiness threshold

### Batch 2 — Enhanced Mock Data & Hook (~200 lines)
**File: `src/components/business/lead-inbox/mock-inbox-data.ts`** — Add scoring-relevant fields to InboxItem (responseTime, lastActivity, engagementEvents, appointmentBooked, quoteRequested, priorCustomer, ownerAssigned, ownerLastAction, estimatedValue, leadAgeHours, communicationCount)

**File: `src/components/business/lead-inbox/useLeadInbox.ts`** — Wire scoring engine into the hook; compute scores on every data change; add `scoredItems` sorted by priority; add filter for recovery candidates

### Batch 3 — Priority Stack & Heat Indicators (~350 lines)
**File: `src/components/business/lead-inbox/LeadPriorityStack.tsx`** — Beautiful ranked stack view showing top leads with priority tier badges, heat indicators, urgency language, advisor whispers, and smooth reorder animations

**File: `src/components/business/lead-inbox/LeadHeatIndicator.tsx`** — Refined heat/urgency display with elegant labels (not gamified meters), subtle color gradients, and momentum arrows

**File: `src/components/business/lead-inbox/LeadPriorityBadge.tsx`** — Tier badges (Critical Now through Low Priority) with appropriate colors matching SITA design tokens

### Batch 4 — Explainability Drawer & Confidence (~350 lines)
**File: `src/components/business/lead-inbox/ScoreExplainabilityDrawer.tsx`** — Slide panel showing: top positive/negative factors with bar visualizations, confidence indicator, timing sensitivity, business-mode logic used, what changed recently, comparable context, next best action recommendation

**File: `src/components/business/lead-inbox/LeadConfidenceDisplay.tsx`** — Shows Strong/Moderate/Low confidence with supporting explanation text

### Batch 5 — Scoring Dashboard & Evolution Timeline (~300 lines)
**File: `src/components/business/lead-inbox/LeadScoringDashboard.tsx`** — Overview cards replacing/enhancing existing overview: Priority Distribution (visual tier breakdown), Conversion Pipeline (likelihood bands), Stale Risk Monitor (at-risk count with trend), Recovery Opportunities (recoverable leads), Boardroom Candidates

**File: `src/components/business/lead-inbox/PriorityEvolutionTimeline.tsx`** — Small visual trend showing if lead is rising/steady/cooling/recovering as a sparkline

### Batch 6 — Full Wiring & Page Integration (~250 lines)
**Enhance: `src/components/business/lead-inbox/LeadTriageCard.tsx`** — Replace static quality_score with live priority tier badge, heat indicator, and score from engine

**Enhance: `src/components/business/lead-inbox/LeadDetailPanel.tsx`** — Add explainability drawer trigger, show full score breakdown, next best action, confidence, what-changed section

**Enhance: `src/pages/business/LeadsInbox.tsx`** — Add Priority Stack view toggle, wire scoring dashboard, add recovery filter tab, connect all new components

**Enhance: `src/components/business/lead-inbox/LeadInboxHeader.tsx`** — Add "At Risk" and "Recovery" KPI cards from scoring output

## Technical Details

- Scoring engine lives in `src/lib/engines/` per project convention (scoring boundary CI check)
- Uses `BusinessProfileCtx` for business-mode-aware weight adaptation
- All scores are deterministic and explainable — no randomness
- Factor weights are transparent and documented in the engine
- Confidence degrades gracefully with sparse data
- No new dependencies required
- ~1,850 lines of new/modified code across 6 batches

