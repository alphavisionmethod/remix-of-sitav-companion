

# Transform Business, Finance & Concierge into True OS Domain Apps

## Current State
The three domain apps already have significant implementations:
- **Business**: 20 sub-pages (overview, leads, customers, opportunities, quotes, invoices, collections, communications, revenue autopilot, e-commerce, social, etc.)
- **Finance**: 30 sub-pages (overview, bills, subscriptions, reserves, cash timing, net worth, debt, budgets, stress radar, peace score, etc.)
- **Concierge**: 15 sub-pages (overview, calendar, tasks, household, school, grocery, appointments, travel, providers, events, etc.)

Each has bento grid overviews, advisor strips, boardroom modes, proof views, and demo data. The blueprint calls for these to feel like "rooms in the same house" — not separate dashboards.

## What's Missing (Gap Analysis)

### 1. Domain Home "What Matters Now" Enhancement
Current overviews are metric-heavy. The blueprint asks for "what needs response now" framing instead of dashboard-first.

### 2. Follow-Through Center (Business)
Missing dedicated callback queue, no-touch leads, waiting-on-reply, overdue outreach in one unified action center.

### 3. Life Admin Center (Concierge)
Missing dedicated "things that usually get postponed" surface — recurring admin, forms/docs, service follow-ups.

### 4. Spending Pulse (Finance)
Missing "do I need to care?" framing for recent spending movement with pattern awareness.

### 5. Shared Action Grammar
Preview → Simulate → Approve → Act → Show Proof — not consistently implemented across all three.

### 6. Personalization Layer
No user-adaptive home module ordering, suggestion tone, or density adaptation based on user profile.

### 7. Automation Center per Domain
Missing dedicated automation management surface showing active rules, triggers, and execution history.

### 8. "What Changed" Feed
Missing unified "what happened since last visit" feed on each domain home.

### 9. Cross-Domain Quick Actions
Missing consistent QuickActionBar on all three overviews with domain-specific prepared actions.

### 10. Mobile Tab Grouping
Business and Concierge lack the grouped dropdown that Finance has for mobile navigation.

---

## Implementation Plan

### Phase 1 — Domain Home Redesign (Business, Finance, Concierge Overviews)

**File: `src/components/sita/domain-shared/`** (new shared components)

Create shared domain components used by all three apps:
- `WhatMattersNow` — priority queue showing top 5 items needing attention, colored by urgency
- `WhatChangedFeed` — reverse-chronological feed of domain events since last visit
- `PreparedActions` — AI-prepared actions ready for review (drafts, reminders, suggestions)
- `QuickActionBar` — domain-specific fast actions (add lead, pay bill, add task)
- `DomainAutomationPanel` — shows active automation rules with enable/disable toggles
- `PersonalizationContext` — hook providing user preferences for density, urgency style, support mode

### Phase 2 — Business Follow-Through Center (New Sub-page)

**File: `src/pages/business/FollowThroughCenter.tsx`**

A unified action center consolidating:
- Callback queue (due today, overdue, upcoming)
- No-touch leads (leads with zero contact in X days)
- Waiting on replies (sent, no response)
- Unsent drafts
- Overdue outreach
- Revenue recovery candidates

Each item is a queue card with one-click actions: Call, Draft, Skip, Snooze.

Wire into `BusinessCenter.tsx` as new tab between "Customers" and "Opportunities."

### Phase 3 — Concierge Life Admin Center (New Sub-page)

**File: `src/pages/concierge/LifeAdminCenter.tsx`**

Surfaces things that get postponed:
- Recurring admin tasks (insurance reviews, renewals, registrations)
- Service provider follow-ups
- Forms/documents to handle
- Tasks linked to upcoming dates
- "Aging" items with days-overdue indicator

Wire into `ConciergeCenter.tsx` as new tab.

### Phase 4 — Finance Spending Pulse (New Sub-page)

**File: `src/pages/money/SpendingPulse.tsx`**

"Do I need to care?" framing:
- Recent transactions grouped by category
- Unusual spending flags with confidence indicators
- Recurring pattern changes (subscription increased, new charge)
- Weekly spending comparison bar
- Clear "all normal" / "review needed" / "attention" states

Wire into `MoneyCenter.tsx` as new tab in Core group.

### Phase 5 — Shared Overview Enhancement

Update all three Overview pages to add above each bento grid:
1. **WhatMattersNow** strip — top 3-5 items needing immediate attention
2. **PreparedActions** panel — AI-prepared drafts/actions
3. **WhatChangedFeed** — collapsible "since yesterday" digest

**Files modified:**
- `src/pages/business/BusinessOverview.tsx`
- `src/pages/money/MoneyOverview.tsx`
- `src/pages/concierge/ConciergeOverview.tsx`

### Phase 6 — Domain Automation Center (Shared Component)

**File: `src/components/sita/domain-shared/AutomationCenter.tsx`**

Reusable automation management panel with:
- Active automation rules list with toggle
- Execution history (last 10 runs with receipts)
- Simulation preview for each rule
- Risk tier badges
- Kill switch per automation

Embed in each domain's existing "Workflows" or add as new tab.

### Phase 7 — Mobile Navigation Parity

Update `BusinessCenter.tsx` and `ConciergeCenter.tsx` to use the same grouped mobile dropdown pattern that `MoneyCenter.tsx` already has.

**Business tab groups:**
- Core: Overview, Leads, Customers, Opportunities
- Sales: Quotes, Invoices, Collections, Proposals
- Growth: Revenue Autopilot, Lead Recovery, Social, E-Commerce
- Intelligence: Revenue Impact, Forecast, Playbook
- Office: Communications, Boardroom, Proof

**Concierge tab groups:**
- Home: Overview, Calendar, Tasks
- Life: Household, Appointments, Travel
- Support: Grocery, School, Providers, Events
- Office: Workflows, Proof, Files, Boardroom, Settings

### Phase 8 — Personalization Hook

**File: `src/hooks/useUserPreferences.ts`**

Create a personalization hook that reads from localStorage (upgradeable to DB later):
- `densityMode`: calm | standard | analyst
- `supportStyle`: quiet | balanced | active
- `urgencyStyle`: gentle | standard | direct
- `domainPriority`: business-first | money-first | concierge-first
- `roleType`: founder | manager | staff | personal

Overview pages use these to reorder modules, adjust card density, and change urgency tone.

---

## Technical Details

- All new components follow existing patterns: `GlassCard`, `BentoCell`, `motion` animations, `SitaTabs`
- Demo data provided via existing `useDataMode()` pattern
- All new sub-pages export as default and get registered in their respective Center routers
- Shared components go in `src/components/sita/domain-shared/` with barrel export
- No database changes needed — all data comes from existing tables/hooks
- No new dependencies required

## File Summary

| Action | Files |
|--------|-------|
| Create | `src/components/sita/domain-shared/WhatMattersNow.tsx` |
| Create | `src/components/sita/domain-shared/WhatChangedFeed.tsx` |
| Create | `src/components/sita/domain-shared/PreparedActions.tsx` |
| Create | `src/components/sita/domain-shared/QuickActionBar.tsx` |
| Create | `src/components/sita/domain-shared/AutomationCenter.tsx` |
| Create | `src/components/sita/domain-shared/index.ts` |
| Create | `src/pages/business/FollowThroughCenter.tsx` |
| Create | `src/pages/concierge/LifeAdminCenter.tsx` |
| Create | `src/pages/money/SpendingPulse.tsx` |
| Create | `src/hooks/useUserPreferences.ts` |
| Modify | `src/pages/BusinessCenter.tsx` — add tabs, mobile groups |
| Modify | `src/pages/MoneyCenter.tsx` — add Spending Pulse tab |
| Modify | `src/pages/ConciergeCenter.tsx` — add tabs, mobile groups |
| Modify | `src/pages/business/BusinessOverview.tsx` — add WhatMattersNow, PreparedActions, WhatChanged |
| Modify | `src/pages/money/MoneyOverview.tsx` — add WhatMattersNow, PreparedActions, WhatChanged |
| Modify | `src/pages/concierge/ConciergeOverview.tsx` — add WhatMattersNow, PreparedActions, WhatChanged |

