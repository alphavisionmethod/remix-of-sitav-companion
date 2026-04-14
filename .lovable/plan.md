
# Lead Scoring & Prioritization — Enhancement Plan

## Current State
The system is already **~80% complete** with a robust scoring engine, triage queue, priority stack, explainability drawer, and KPI cards. Here's what's **missing or needs upgrade** to reach 100%:

## What Needs Work

### 1. Visual Scoring Dashboard Upgrade
The current `LeadScoringDashboard` is functional but basic (just KPI cards + bar chart). Needs:
- **Radar/spider chart** showing the 15 scoring factors visually for any selected lead
- **Conversion funnel** visualization (new → qualified → proposal → won)
- **Value pipeline** chart showing estimated pipeline value by tier
- **Heat map grid** showing all leads plotted by score vs. recency
- **LeadInboxOverviewCards** (source mix, quality gauge, arrival timeline) — component exists but isn't wired into the dashboard view

### 2. Lead Activity Timeline
The detail panel shows static info but lacks a **timeline of interactions**. Add:
- Visual timeline showing: created, first response, engagement events, owner actions, status changes
- Mock timeline data in `mock-inbox-data.ts`
- Renders in `LeadDetailPanel` as a new card section

### 3. Score Comparison Mode
No way to compare two leads side-by-side. Add:
- Compare button when 2 items are checked
- Split panel showing both scores, factors, and recommendations
- Visual factor comparison bars

### 4. Scoring Trends Sparklines
The `PriorityEvolutionTimeline` component exists but is static. Enhance with:
- Historical score snapshots (mock data showing score evolution)
- Mini sparkline SVG showing score trajectory over time
- Delta indicator (↑ +5 from last check)

### 5. Enhanced Dashboard View Wiring
When `viewMode === "dashboard"`, currently only shows `LeadScoringDashboard`. Should also show:
- `LeadInboxOverviewCards` (already built, just not wired)
- New visual charts (radar, funnel, heatmap)
- Top opportunities table with quick-action buttons

## Technical Approach

### Files to Create
- `src/components/business/lead-inbox/LeadScoreRadar.tsx` — SVG radar chart for 15 factors
- `src/components/business/lead-inbox/LeadConversionFunnel.tsx` — Funnel visualization
- `src/components/business/lead-inbox/LeadValuePipeline.tsx` — Pipeline value by tier
- `src/components/business/lead-inbox/LeadHeatMap.tsx` — Score vs recency scatter grid
- `src/components/business/lead-inbox/LeadActivityTimeline.tsx` — Interaction timeline
- `src/components/business/lead-inbox/LeadScoreComparison.tsx` — Side-by-side comparison

### Files to Modify
- `LeadScoringDashboard.tsx` — Add radar, funnel, heatmap, value pipeline sections
- `LeadDetailPanel.tsx` — Add activity timeline section + radar chart
- `ScoreExplainabilityDrawer.tsx` — Add radar chart visualization of all 15 factors
- `PriorityEvolutionTimeline.tsx` — Add sparkline SVG with historical mock data
- `LeadsInbox.tsx` — Wire overview cards into dashboard view, add compare mode
- `useLeadInbox.ts` — Add compare state management
- `mock-inbox-data.ts` — Add mock timeline events and historical score snapshots

### Design Language
All new components follow existing patterns:
- `SitaCard` with glassmorphic borders
- Brand colors: urgency-critical, urgency-high, sita-gold, trust-safe, trust-degraded
- `font-display` for numbers, `text-[10px]` for labels
- Framer Motion for entry animations
- Responsive grid layouts matching existing 5-column split

### No New Dependencies
All charts rendered as pure SVG — no chart library needed. This matches the existing pattern used in `PriorityEvolutionTimeline`.
