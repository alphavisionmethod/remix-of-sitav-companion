

# Revenue Office — Full Enhancement Plan

## Current State Summary

The Revenue Office has **40 pages** across **40 routes** with **4,636 total lines**, **15 React Query hooks**, and **1,066 lines of demo data**. However, many critical pages are thin shells (43-72 lines) that display static demo data without interactive depth, debate logic, memory services, or advanced features.

## Critical Gaps Found

### Missing Infrastructure
1. **No Revenue Memory Service** — unlike Investment Office which has `investment-memory.service.ts`, there is no equivalent for revenue
2. **No `use-revenue-memory.ts` hooks** — no memory domain hooks exist
3. **No Advisor Debate/Disagreement Engine** — GrowthAdvisorBoard (66 lines) is a flat card list with no debate mode, alignment mapping, or "what changed"
4. **No receipt/proof integration** on any page

### Thin Pages Needing Major Enhancement

| Page | Lines | What's Missing |
|------|:---:|---|
| **GrowthAdvisorBoard** | 66 | No debate engine, no alignment map, no per-advisor history, no "what would change mind", no confidence/uncertainty split |
| **FunnelBuilder** | 72 | No visual journey canvas, no step drag/reorder, no per-step leak detection, no A/B variants, no trigger logic |
| **GrowthDNA** | 51 | No live data wiring, no deviation alerts, no strategy recommendations engine |
| **WhatBreaksGrowth** | 51 | No repair actions, no advisor-linked invalidation, no recovery tracking |
| **BusinessTimeMachine** | 43 | No snapshot comparison, no advisor-then-vs-now, no lesson capture |
| **CommercialMemoryFeed** | 50 | No pin/acknowledge, no task conversion, no domain filtering |
| **OpportunityBoard** | 62 | No advisor scoring, no theme clusters, no priority ranking |
| **TrustPulse** | 48 | No sentiment trend chart, no trust breakdown by dimension |
| **RevenueDecisionTheater** | 69 | No scenario simulation, no governance/proof panel, no receipt generation |
| **GrowthAdvisorBoard** | 66 | Needs full 9-advisor council with debate |
| **LeakDetector** | 96 | No automated repair suggestions, no recovery tracking, no historical trends |

### Pages That Are Good But Need Enhancement

| Page | Lines | Enhancement Needed |
|------|:---:|---|
| **GrowthBoardroom** | 127 | Add campaign health, booking load, reputation pulse, operating mode, what-changed feed |
| **RelationshipCenter** | 125 | Add relationship graph, opportunity score, next-best-action, conversation timeline |
| **CampaignOrchestrator** | 118 | Add lifecycle journey builder, fatigue scoring, deliverability signals, attribution |
| **BookingCenter** | 125 | Add no-show recovery, prep workflows, post-call follow-up, conversion tracking |
| **OffersWorkspace** | 98 | Add upsell/downsell flows, onboarding sequences, pricing experiments |
| **MembershipCourseOffice** | 120 | Add drip release, gated content, engagement heatmap, renewal signals |
| **RetentionOffice** | 102 | Add churn prediction model, NPS tracking, re-engagement workflow builder |
| **RevenueGate** | 139 | Add connection health, operating mode selector, richer what-changed |
| **ChiefRevenueSynthesis** | 93 | Add historical synthesis comparison, actionable next-step buttons |

## Implementation Plan

### Step 1: Create Revenue Memory Service (~300 lines)
`src/lib/services/finance-os/revenue-memory.service.ts`
- `computeWhatChanged()` — analyze advisor stances, pipeline shifts, client health changes
- `inferGrowthDNA()` — derive business growth traits from decisions, campaigns, funnel data
- `assessGrowthFirewall()` — detect impulsive campaign launches, underprepared scaling
- `buildTimeMachineSnapshot()` — capture current state for future replay
- `getAdvisorMemory()` — track past advisor stances and confidence evolution

### Step 2: Create Revenue Memory Hooks (~200 lines)
`src/hooks/use-revenue-memory.ts`
- Hooks for each memory domain: user, advisor, client, campaign, revenue pipeline
- Unified `useRevenueWhatChanged()` aggregator

### Step 3: Enhance Growth Advisor Board → Full 9-Advisor Council (~400 lines)
Transform from 66-line flat list into Investment Office-style advisor workspace:
- 9 specialized advisors (Funnel, CRM, Campaign, Offer, Booking, Retention, Reputation, RevOps, Chief)
- Debate mode with disagreement detection
- Alignment map visualization
- Per-advisor "what changed since last review"
- "What would change my mind" for each stance
- Confidence + uncertainty split
- Synthesis memo from Chief Revenue Advisor

### Step 4: Deepen GrowthBoardroom → Executive Command Center (~350 lines)
Add: campaigns running panel, booking load indicator, reputation health card, funnel conversion pulse, operating mode selector, what-changed live feed, advisor signal rail with links

### Step 5: Deepen FunnelBuilder → Visual Journey Studio (~350 lines)
Add: visual step canvas with drag reorder, per-step conversion analytics with leak detection ("this step loses 34%"), A/B variant tabs, trigger logic panel, step types (page, form, email, booking, checkout, follow-up), "what's leaking?" intelligence card

### Step 6: Deepen RelationshipCenter → Advanced CRM (~300 lines)
Add: relationship warmth graph, lead/opportunity scoring with visual bars, next-best-action recommendations panel, conversation history timeline, churn risk indicator per contact, proposal/invoice links

### Step 7: Deepen CampaignOrchestrator (~280 lines)
Add: lifecycle journey builder with branching preview, fatigue scoring per segment, deliverability health indicators, content sequence timeline, conversion attribution chart, advisor guidance panel

### Step 8: Enhance Remaining Core Pages (6 pages, ~150-200 lines each)
- **BookingCenter**: no-show recovery workflows, prep checklist, post-call automation, conversion tracking
- **OffersWorkspace**: upsell/downsell flow builder, onboarding sequences, pricing experiments, offer-market fit signals
- **MembershipCourseOffice**: drip release scheduler, gated content, engagement heatmap, renewal/churn signals
- **RetentionOffice**: churn prediction scoring, NPS tracking, re-engagement workflow builder, renewal timing
- **LeakDetector**: automated repair action cards, recovery tracking with ROI, historical leak trends, advisor-linked recommendations
- **ReputationEngine**: already solid at 237 lines — add sentiment trend chart

### Step 9: Enhance Wow Feature Pages (6 pages, ~100-200 lines each)
- **RevenueDecisionTheater**: scenario simulation cards, governance/proof panel, receipt generation, final authorization flow
- **GrowthDNA**: wire to memory service, deviation alerts, play recommendations based on actual data
- **WhatBreaksGrowth**: per-category drill-down, advisor-linked invalidation, repair action cards
- **BusinessTimeMachine**: richer then-vs-now panels, advisor state snapshots, lesson capture + constitution update
- **CommercialMemoryFeed**: acknowledge/pin/task conversion, domain filtering tabs, advisor-change highlighting
- **OpportunityBoard**: advisor-scored ranking, confidence/uncertainty, theme clustering

### Step 10: Enhance Supporting Pages
- **RevenueGate**: connection health panel, operating mode indicator, recent what-changed cards
- **ChiefRevenueSynthesis**: wire to memory service, add actionable buttons, historical comparison

### Step 11: Extend Demo Data (~400 lines)
Add richer demo data to `src/lib/demo-data/revenue-office.ts` for all new sections: advisor debate data, memory events, funnel step analytics, relationship graph data, campaign attribution data

## Technical Approach
- No new routes — all enhancements to existing pages
- Follows existing demo-first pattern with live Supabase fallback
- Uses existing UI components (Card, Badge, Progress, Tabs, etc.)
- Zero new dependencies
- All hooks follow `useAuth()` + React Query pattern from existing `use-revenue-office.ts`

## Estimated Scope
- 2 new files (service + hooks): ~500 lines
- ~15 pages significantly enhanced: adding 100-300 lines each
- ~400 lines additional demo data
- Total: ~4,500 lines of new/enhanced code across ~18 files

