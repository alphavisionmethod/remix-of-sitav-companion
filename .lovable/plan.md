

# Business Home: Premium Operating Room — Implementation Plan

## What We're Building
A complete replacement of the current `BusinessOverview.tsx` (113 lines of basic stat cards + chart) with a founder-grade command surface composed of 7 distinct zones, profile-aware, with premium dark glassmorphic design and real visual hierarchy.

## Architecture
The new Business Home will be a single orchestrating page (`BusinessOverview.tsx`) that imports purpose-built zone components. Each zone is a standalone file for maintainability.

```text
BusinessOverview.tsx (orchestrator)
├── HomeIdentityHeader.tsx        — Zone A: Business mode, trust posture, contextual summary
├── WhatMattersNowHero.tsx        — Zone B: Signature hero, ranked priorities, prepared actions
├── PressurePulseLayer.tsx        — Zone C: 6-domain pressure gauges with interconnection logic
├── OpportunityRecoveryLayer.tsx  — Zone D: Active opportunities, recovery candidates, momentum
├── ContinuityTimeline.tsx        — Zone E: What changed since last review, stage shifts
├── AdvisorSynthesisZone.tsx      — Zone F: Advisor stance, rationale, caution, escalation
└── BoardroomEntryZone.tsx        — Zone G: Strategic candidates with cinematic reveal
```

## Implementation — 3 Batches

### Batch 1: Foundation + Hero (Zones A, B, C)
**Files created**: 3 new components in `src/components/business/home/`
**File modified**: `BusinessOverview.tsx` — complete rewrite

- **Zone A — Identity Header**: Asymmetric header with business mode chip, trust posture badge, contextual summary sentence (adapts per archetype), ambient gradient glow matching domain accent color. Profile confidence indicator.
- **Zone B — What Matters Now Hero**: The signature area. Large asymmetric card with ranked priority items (at-risk revenue, overdue follow-ups, stalled deals). Each item: severity color bar, entity name, risk amount, days overdue, confidence badge, prepared action button. Max 5 items. Visual weight dominates the page. Glassmorphic card with subtle ambient glow.
- **Zone C — Pressure & Pulse**: 6 mini pressure gauges (Lead, Pipeline, Support, Collections, Operations, Schedule) rendered as animated radial progress arcs with severity coloring. Below each: one-line interpretation ("Growing — connected to pipeline stall"). Interconnection lines between related pressures.

### Batch 2: Opportunity + Continuity + Advisor (Zones D, E, F)
**Files created**: 3 new components

- **Zone D — Opportunity & Recovery**: Split layout — left side shows advancing opportunities (deal name, value, stage, momentum indicator), right side shows recovery candidates (stalled leads, reactivation signals, estimated recovery value). Warm accent colors, forward-looking tone.
- **Zone E — Continuity Timeline**: Vertical timeline with elegant transitions showing meaningful state changes since last review. Each entry: timestamp, description, severity chip, before/after state. Curated — not raw feed. Max 8 entries.
- **Zone F — Advisor Synthesis**: Premium glassmorphic panel with advisor avatar, stance indicator (confident/cautious/divided), summary paragraph, top 3 recommended actions, caution flags, escalation recommendation. Feels like a real advisor speaking.

### Batch 3: Boardroom + State Handling + Profile Adaptation
**Files created**: 1 new component, modifications to orchestrator

- **Zone G — Boardroom Entry**: Cinematic reveal interaction — collapsed shows count + top candidate title. On click, expands with strategic framing, risk factors, options, next steps. Premium border animation on hover.
- **State handling**: First-use (aspirational guide), loading (structured skeleton preserving hierarchy), low-data (lighter observation mode), calm day (opportunity-focused), review-heavy (review-centric layout shift), degraded (caution badges, reduced confidence).
- **Profile adaptation**: The orchestrator reads `primaryMode` and adjusts zone emphasis weights — e.g., ecommerce emphasizes Zone D (lifecycle/retention), service emphasizes Zone B (proposals/follow-up), team-based emphasizes Zone C (workload pressure).

## Design Language
- Background: `bg-[#0a0a12]` (existing Business OS dark)
- Cards: `bg-[#12121e]` with `border-[#1a1a2e]`, glassmorphic overlays
- Hero zone: Larger card with radial gradient glow matching domain accent
- Pressure arcs: SVG radial gauges with animated fill
- Typography: Space Grotesk for headers, Inter for body, monospace for values
- Animations: Framer Motion staggered reveals, subtle scale on hover
- Layout: CSS Grid asymmetric — Hero spans 2/3 width, pressure gauges 1/3

## Data Sources (all existing, no new DB tables)
- `useBusinessProfile()` — archetype, weights, operating flags
- `getIdentityLayer()` — accent colors, tagline, tone
- `getModuleAdaptation()` — advisor name, quick actions
- `useBoardroomBridge("business")` — escalations, decisions, synthesis
- `getAdvisorOutputs("business")` — advisor recommendations
- Mock data for demo mode (same pattern as existing components)

## What Stays
- All existing sub-components (`BusinessStatCard`, `BusinessMoneyFlow`, etc.) remain available but are not used by the new Home — they can be reused elsewhere
- `AdaptiveBusinessHome` remains as a separate module (`adaptive-home` in the pages map)
- The pages map entry `overview: BusinessOverview` stays unchanged

## Total Scope
- ~7 new component files in `src/components/business/home/`
- 1 rewritten file: `BusinessOverview.tsx`
- 0 database changes
- 0 new dependencies

