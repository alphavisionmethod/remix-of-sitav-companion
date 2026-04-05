
# SITA OS — Revenue Office Implementation Plan

## Current State
- Existing `BusinessCenter` with 15 sub-pages (leads, customers, opportunities, quotes, invoices, communications, boardroom, proof, revenue-autopilot, collections, etc.)
- Existing DB tables: `customers`, `leads`, `opportunities`, `deals`, `invoices`, `quotes`, `communications`, `bookings`

## Strategy
**Evolve BusinessCenter → Revenue Office** rather than creating a parallel workspace. The existing business pages become sub-surfaces of the Revenue Office with new flagship surfaces added.

## New Route: `/revenue-office/*`

### Phase 1 — Core Revenue Office (this implementation)
Create `src/pages/revenue-office/` directory with these surfaces:

1. **RevenueGate** (`/revenue-office`) — Entry point with growth overview, mode selector, what-changed, advisor preview
2. **GrowthBoardroom** (`/revenue-office/boardroom`) — Executive growth command center with pipeline, revenue, leaks, advisor rail
3. **RelationshipCenter** (`/revenue-office/relationships`) — Upgraded CRM with lifecycle stages, health scores, journey timeline
4. **PipelineStudio** (`/revenue-office/pipeline`) — Visual pipeline with stages, deal flow, conversion rates, leak detection
5. **FunnelBuilder** (`/revenue-office/funnels`) — Visual funnel/journey builder with pages, forms, checkouts, conversion tracking
6. **CampaignOrchestrator** (`/revenue-office/campaigns`) — Email/SMS lifecycle automation with segments, triggers, sequences
7. **BookingCenter** (`/revenue-office/bookings`) — Appointment scheduling, availability, service catalog
8. **OffersWorkspace** (`/revenue-office/offers`) — Products, services, packages, memberships, courses, pricing
9. **ReputationEngine** (`/revenue-office/reputation`) — Reviews, testimonials, NPS, reputation monitoring
10. **RevenueIntelligence** (`/revenue-office/intelligence`) — Revenue leakage, forecasting, cohort analysis, LTV
11. **RetentionOffice** (`/revenue-office/retention`) — Churn detection, win-back, engagement health, loyalty
12. **GrowthAdvisorBoard** (`/revenue-office/advisors`) — Revenue advisor council (Growth, Sales, Marketing, Retention, Pricing advisors)
13. **JourneyTwin** (`/revenue-office/journey-twin`) — Visual customer journey digital twin showing every touchpoint
14. **LeakDetector** (`/revenue-office/leaks`) — Where revenue is leaking: abandoned carts, stale leads, missed follow-ups
15. **ConversionLab** (`/revenue-office/conversion-lab`) — A/B testing ideas, conversion optimization, funnel experiments

### Phase 2 (future)
- White-label / multi-client agency mode
- Course/membership delivery platform
- Advanced automation visual builder
- Proposal/contract signing workflow

## DB Migration
New tables for Revenue Office entities not already covered by existing tables (funnels, campaigns, offers, reputation, etc.)

## Files to Create
- 15 new page components in `src/pages/revenue-office/`
- Update `src/App.tsx` with lazy routes
- Reuse existing business components where possible

## Design
- Premium dark mode, shell-native
- Semantic tokens from design system
- Cards, grids, advisor rails consistent with Investment Office style
