

# Lead Inbox — Premium Triage Surface

## Overview
Replace the current basic `LeadsInbox.tsx` (434 lines of simple list/detail) with a fully featured, beautiful lead intake and triage system. Since there's no `leads` table in the database, we'll create one along with a `lead_inbox_items` table for the intake queue.

## Database Changes

**Migration: Create lead intake tables**

1. `leads` table — full lead records (accepted leads)
2. `lead_inbox_items` table — incoming triage queue with fields for:
   - raw contact info (name, email, phone, company)
   - source (website, referral, import, crm-sync, manual, partner, campaign, social, message)
   - inquiry_text, urgency (low/medium/high/critical)
   - quality_score (0-100), quality_hints (jsonb)
   - completeness_score, missing_fields (text[])
   - duplicate_status (none/possible/definite), duplicate_match_id
   - suggested_owner, suggested_route (lead/consult/quote/automation/boardroom/archive/spam)
   - advisor_suggestion (text), triage_status (new/reviewing/accepted/rejected/routed/snoozed)
   - routed_to, accepted_at, business_profile_mode
   - RLS policies for authenticated users

3. Enable realtime on `lead_inbox_items`

## Component Architecture

```text
src/pages/business/LeadsInbox.tsx          ← Full rewrite (orchestrator)
src/components/business/lead-inbox/
  ├── LeadInboxHeader.tsx                  ← KPI dashboard strip with visual cards
  ├── LeadInboxOverviewCards.tsx            ← Source mix donut, quality gauge, urgency heatmap
  ├── LeadTriageQueue.tsx                   ← Main queue with premium triage cards
  ├── LeadTriageCard.tsx                    ← Individual card: source icon, quality bar, advisor whisper
  ├── LeadDetailPanel.tsx                   ← Right-side detail with inquiry, scoring, advisor, actions
  ├── LeadQuickActions.tsx                  ← Hover/inline action bar (accept, route, reject, snooze)
  ├── LeadDuplicateDrawer.tsx              ← Side-by-side duplicate comparison
  ├── LeadBulkTriageBar.tsx                ← Floating bar for multi-select bulk operations
  ├── LeadAdvisorWhisper.tsx               ← Subtle inline advisor recommendation layer
  ├── LeadSourceBadge.tsx                  ← Source-aware styled badges with icons
  ├── LeadEmptyStates.tsx                  ← First-use, caught-up, no-results states
  └── useLeadInbox.ts                      ← Data hook: fetch, filter, triage actions, realtime
```

## Visual Design

- **Header**: 6 visual KPI cards in a horizontal strip — New Arrivals (with pulse dot), Unassigned, Urgent, High Quality, Duplicates, Source Mix — each with gradient backgrounds and icons, not plain text
- **Overview Row**: 3 mini-dashboard cards — Source mix donut chart (using SitaCharts), Quality distribution gauge, Arrival timeline sparkline
- **Triage Queue**: Premium cards with left color-coded urgency bar, source icon, quality confidence ring, avatar initials, inquiry preview, advisor whisper text, and quick action buttons on hover
- **Detail Panel**: Glassmorphic right panel with lead profile hero, inquiry content, quality radar, duplicate analysis section, advisor recommendation card, and action button grid
- **Animations**: Framer Motion for card accept/route/reject — card slides out gracefully toward its destination with a subtle success toast
- **Empty States**: Cinematic first-use with illustration, "You're caught up" celebration state, degraded state banner

## Key Features

1. **Smart Triage Queue** — Filterable by: All, New, Urgent, High Quality, Missing Info, Duplicates, Snoozed, Accepted, Rejected, Exceptional
2. **Source-Aware Styling** — Each source type gets a distinct icon + color accent (referral=gold, website=blue, import=slate, CRM=purple, manual=green)
3. **Advisor Whisper Layer** — Each card shows a one-line AI triage suggestion below the inquiry preview
4. **Quick Actions** — Inline hover actions: Accept → Leads, Route → Consult/Quote, Reject, Snooze, Flag Exceptional
5. **Duplicate Detection UI** — Warning badge + expandable drawer showing matched record side-by-side with merge button
6. **Bulk Triage** — Checkbox multi-select with floating action bar for batch accept/reject/route
7. **Detail Panel** — Full triage workspace with quality scoring breakdown, completeness checklist, advisor recommendation, communication preview, and routing controls
8. **Business Profile Adaptation** — Service mode prioritizes consult routing, ecommerce prioritizes cart leads, high-ticket highlights Boardroom escalation
9. **Mock Data** — Rich set of 15+ diverse inbox items across all sources, urgency levels, and quality bands for demo mode
10. **Realtime** — Subscribe to `lead_inbox_items` for live arrival pulse

## Integration Points

- Wired into `BusinessAppShell` pages map (replaces current `leads` entry)
- `useBusinessProfile` for archetype-aware labels and prioritization
- `ModuleAdvisorInsight` for page-level advisor strip
- `navigateTo` for routing to consult, quotes, opportunities, boardroom
- Notifications integration via toast on urgent arrivals
- Business Home contribution via item counts

## Scope
- ~12 new files
- 1 full rewrite (LeadsInbox.tsx)
- 1 database migration
- 0 new dependencies (uses existing framer-motion, lucide, tanstack-query, SitaCard system)

