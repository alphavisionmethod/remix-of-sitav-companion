

# Revenue Office — Remaining "Never Seen Before" Features Enhancement

## Assessment Summary

The 10 features from the spec have all been **created as pages** with demo data, but several are still thin shells that lack the depth described in the spec. Here's the gap analysis:

| Feature | Current Lines | Gap |
|---------|:---:|-----|
| 1. Customer Journey Twin | 67 | No automation overlay, no stall detection, no advocate tracking, no churn mapping |
| 2. Revenue Leakage Map (LeakDetector) | 96 | No repair tracking (DEMO_LEAK_REPAIR_TRACKING unused), no historical trends (DEMO_LEAK_TRENDS unused), no recovery ROI |
| 3. Business Decision Theater | 69 | No scenario simulation (DEMO_SCENARIO_CARDS unused), no governance/proof panel, no receipt generation |
| 4. What Breaks Growth | 99 | Already enhanced with repair actions and invalidation triggers — **DONE** |
| 5. Growth DNA | 51 | Has traits/archetypes/plays but no firewall alerts (DEMO_GROWTH_FIREWALL_ALERTS unused), no deviation detection |
| 6. Opportunity Board | 62 | No theme clustering (DEMO_OPPORTUNITY_THEMES unused), no priority scoring, no urgency indicators |
| 7. Trust & Reputation Pulse | 48 | No trust dimensions (DEMO_TRUST_DIMENSIONS unused), no sentiment trend (DEMO_SENTIMENT_TREND unused) |
| 8. White-Label Office | 48 | Functional — has partners, brands, revenue splits, controls. Needs growth health per client |
| 9. Business Time Machine | 43 | Has periods/decisions/what-if but no advisor-then-vs-now snapshots, no lesson capture |
| 10. GrowthBoardroom (Full Boardroom) | 127 | No campaign health, booking load, reputation pulse, operating mode, what-changed feed |

Additionally: **RetentionOffice** (102 lines) lacks churn prediction (DEMO_CHURN_PREDICTION unused) and NPS (DEMO_NPS_DATA unused). **ChiefRevenueSynthesis** (93 lines) lacks historical comparison (DEMO_CHIEF_HISTORICAL unused). **RevenueGate** (139 lines) lacks operating mode selector.

## What's Already Done
- Revenue Memory Service (383 lines) with computeWhatChanged, inferGrowthDNA, assessGrowthFirewall
- Revenue Memory Hooks (208 lines) with 15 React Query hooks
- GrowthAdvisorBoard (262 lines) — full 9-advisor council with debate engine
- FunnelBuilder (225 lines) — visual journey studio with leak detection
- RelationshipCenter (238 lines) — advanced CRM with relationship graph
- CampaignOrchestrator (118 lines) — enhanced with attribution
- CommercialMemoryFeed (105 lines) — pin/acknowledge/task conversion
- WhatBreaksGrowth (99 lines) — repair actions and invalidation triggers
- Demo data: 1,300+ lines with all needed data exports already existing

## Implementation Plan

### 1. Enhance JourneyTwin (67→~220 lines)
Add: automation overlay showing active automations per stage, stall detection ("18 leads stuck >7 days"), advocate tracking with referral/review signals, churn exit mapping with counts, interactive stage expansion, stage health indicators

### 2. Enhance LeakDetector (96→~230 lines)
Wire: DEMO_LEAK_REPAIR_TRACKING for recovery progress bars, DEMO_LEAK_TRENDS for historical trend visualization, recovery ROI calculations, advisor-linked repair recommendations

### 3. Enhance RevenueDecisionTheater (69→~220 lines)
Wire: DEMO_SCENARIO_CARDS for upside/base/downside simulation, governance/proof panel with receipt preview, final authorization flow with state management (draft→review→approved→executed)

### 4. Enhance GrowthDNA (51→~150 lines)
Wire: DEMO_GROWTH_FIREWALL_ALERTS for behavioral deviation alerts, add strategy alignment/conflict indicators per archetype, connect to revenue memory service

### 5. Enhance OpportunityBoard (62→~180 lines)
Wire: DEMO_OPPORTUNITY_THEMES for theme clustering visualization, add priority scoring algorithm (impact × confidence / effort), urgency indicators, watchlist integration

### 6. Enhance TrustPulse (48→~180 lines)
Wire: DEMO_TRUST_DIMENSIONS for multi-axis trust breakdown (responsiveness, delivery, payment, engagement, satisfaction), DEMO_SENTIMENT_TREND for trend chart, advisor correlation

### 7. Enhance BusinessTimeMachine (43→~180 lines)
Add: advisor-then-vs-now comparison panels, lesson capture form with save-to-memory, snapshot delta highlighting, link to current strategy

### 8. Enhance GrowthBoardroom (127→~280 lines)
Add: campaign health indicator, booking load gauge, reputation pulse card, funnel conversion pulse, operating mode selector, what-changed live feed panel linking to memory service

### 9. Enhance RetentionOffice (102→~220 lines)
Wire: DEMO_CHURN_PREDICTION for churn prediction model cards, DEMO_NPS_DATA for NPS dashboard with trend visualization, add re-engagement workflow section

### 10. Enhance Supporting Pages
- **ChiefRevenueSynthesis** (93→~150 lines): Wire DEMO_CHIEF_HISTORICAL for historical comparison, add actionable next-step buttons
- **RevenueGate** (139→~180 lines): Add operating mode selector, connection health panel
- **WhiteLabelOffice** (48→~100 lines): Add growth health trend per client, reputation cross-client summary

## Technical Approach
- All demo data exports already exist — just need to be imported and wired
- No new routes, dependencies, or services needed
- All pages maintain existing demo-first pattern with Supabase fallback
- Estimated: ~2,500 lines of enhanced code across 12 files
- Zero new files needed

