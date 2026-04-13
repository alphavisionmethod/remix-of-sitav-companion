

# SITA OS — App-in-OS Premium Software Transformation

## Current State Assessment

The architecture is already **partially there**:
- Each domain (Business, Finance, Concierge) has its own `AppShell` with traffic lights, accent strip, sidebar nav, and status bar
- Internal routing via `subpageFromPath` renders ~20-30 sub-pages per domain
- Shared primitives exist: `WhatMattersNow`, `PreparedActions`, `WhatChangedFeed`, `KPITile`, etc.

**What's missing** (the "dashboard feel" problem):
- App Overview/Home pages are card-grid dashboards, not opinionated software homes
- Sidebar nav items are flat text lists — no icons, no status indicators, no grouping hierarchy
- No app-level toolbar/command bar within each domain
- No module-level detail views with real depth (list → detail → action)
- Advisors are generic `InAppAdvisorStrip` — same component pasted everywhere
- Boardroom exists only as one page per domain, not as a synthesized review layer
- No app-level atmosphere differentiation (same colors, same density, same tone)
- No transition animations between modules within an app
- Empty states are generic

## Transformation Strategy

This is too large for a single implementation. I propose **3 phases**, starting with the highest-impact structural work.

---

### PHASE 1 — App Identity & Shell Upgrade (this implementation)

**Scope**: Upgrade all 3 app shells + their Home pages to feel like independent software products.

#### 1A. Enhanced App Shell (shared foundation)

Create `src/components/sita/shell/DomainAppShell.tsx` — a unified but configurable app shell replacing the 3 near-identical shells:

- **App Toolbar**: Below title bar, domain-specific quick actions + search + view toggles + density control
- **Sidebar with icons**: Each nav item gets a domain-relevant icon, active state with accent pill, badge counts with severity colors
- **Module group headers**: Collapsible groups with item count summaries
- **App-level command trigger**: `Cmd+K` scoped to current domain when app is focused
- **Status bar upgrade**: Shows domain-specific live status (e.g., "3 approvals waiting" for Finance, "2 callbacks overdue" for Business)
- **Accent system**: Business = purple gradient, Finance = emerald gradient, Concierge = fuchsia/rose gradient — applied to accent strip, sidebar active state, toolbar highlights

#### 1B. Business OS Home Redesign

Replace the card-grid `BusinessOverview.tsx` with an **operating room** layout:

```text
┌─────────────────────────────────────────────────┐
│  TODAY'S OPERATING STATE (hero strip)           │
│  Revenue pulse · Callbacks due · Leads aging    │
├──────────────────────┬──────────────────────────┤
│  WHAT NEEDS YOU      │  WHAT CHANGED            │
│  (priority queue)    │  (live feed)             │
│  - 3 callbacks       │  - Invoice paid $4,200   │
│  - 2 quotes expiring │  - New lead: Michael     │
│  - 1 overdue invoice │  - Support ticket opened │
├──────────────────────┴──────────────────────────┤
│  PREPARED ACTIONS          │  ADVISOR INSIGHT    │
│  (ready-to-execute cards)  │  (contextual, not   │
│                            │   generic chatbot)  │
└─────────────────────────────────────────────────┘
```

- Hero strip: 3 key metrics with sparklines, not a wall of KPI tiles
- Priority queue: Actionable items ranked by urgency, clickable to module
- No "Welcome back" fluff — straight to operational state

#### 1C. Finance OS Home Redesign

Replace `MoneyOverview.tsx` with a **financial calm** layout:

- **Confidence banner**: "Your finances are stable" / "2 items need attention" — emotional state, not just numbers
- **Obligations timeline**: Visual strip showing bills/payments due across the next 30 days
- **Cash position**: Single calm number with trend indicator
- **Spending pulse**: Mini sparkline of last 7 days vs average
- **Advisor insight**: Finance-specific ("Your reserves cover 4.2 months of obligations")

#### 1D. Concierge OS Home Redesign

Replace `ConciergeOverview.tsx` with an **invisible support** layout:

- **This week at a glance**: Calendar-strip of upcoming obligations/appointments
- **What's handled**: Completed/automated items (relief-oriented)
- **What needs you**: Soft priority queue, fewer items, calmer tone
- **Life admin status**: "3 renewals this month, 1 appointment to prep"

#### 1E. App-Specific Advisor Cards

Create `src/components/advisors/DomainAdvisorCard.tsx` — replaces generic `InAppAdvisorStrip`:

- Takes `domain` prop: business | finance | concierge
- Shows domain-specific advisor identity (name, icon, specialty)
- Contextual insight based on current module
- Prepared action suggestions relevant to the module
- Distinct visual tone per domain

---

### PHASE 2 — Module Depth & Detail Views (follow-up)

- Upgrade CRM to list → detail → timeline → actions flow
- Upgrade Lead Recovery to queue → segment → draft → execute flow
- Upgrade Invoices to collections command center with aging waterfall
- Add module-level transitions and breadcrumbing
- Add module-specific advisor guidance
- Add beautiful empty/loading/degraded states per module

### PHASE 3 — Boardroom Topology & Command Depth (follow-up)

- Global OS Boardroom synthesizing all 3 domains
- App-specific boardrooms with domain review rhythm
- Command palette scoped to active domain
- Cross-domain intelligence in global boardroom

---

## Phase 1 File Changes

### Create (6 files)
- `src/components/sita/shell/DomainAppShell.tsx` (~350 lines) — Unified configurable app shell with toolbar, icon sidebar, status bar
- `src/components/sita/shell/AppToolbar.tsx` (~120 lines) — Domain-specific toolbar with search, quick actions, view modes
- `src/components/sita/shell/AppSidebarNav.tsx` (~180 lines) — Icon-enhanced sidebar with badges, groups, active states
- `src/components/advisors/DomainAdvisorCard.tsx` (~150 lines) — Domain-aware advisor with contextual insights
- `src/components/sita/domain-shared/OperatingStateHero.tsx` (~120 lines) — Reusable hero strip with key metrics
- `src/components/sita/domain-shared/PriorityQueue.tsx` (~100 lines) — Ranked actionable items component

### Rewrite (3 files)
- `src/pages/business/BusinessOverview.tsx` — Operating room layout
- `src/pages/money/MoneyOverview.tsx` — Financial calm layout
- `src/pages/concierge/ConciergeOverview.tsx` — Invisible support layout

### Edit (6 files)
- `src/pages/BusinessCenter.tsx` — Switch to DomainAppShell, add icons to tab groups
- `src/pages/MoneyCenter.tsx` — Switch to DomainAppShell, add icons to tab groups
- `src/pages/ConciergeCenter.tsx` — Switch to DomainAppShell, add icons to tab groups
- `src/components/business/BusinessAppShell.tsx` — Deprecate (keep as re-export)
- `src/components/money/MoneyAppShell.tsx` — Deprecate (keep as re-export)
- `src/components/concierge/ConciergeAppShell.tsx` — Deprecate (keep as re-export)

## Design Tokens Per Domain

| Property | Business | Finance | Concierge |
|----------|----------|---------|-----------|
| Accent gradient | `purple → violet` | `emerald → teal` | `fuchsia → rose` |
| Density | Standard | Calm | Spacious |
| Tone | Operational, sharp | Precise, confidence | Supportive, soft |
| Home hero | Operating state | Confidence banner | Week at a glance |
| Advisor name | Business Advisor | Finance Advisor | Life Advisor |

## What This Does NOT Change

- OS shell (`ShellLayout`, dock, top bar, command palette) — untouched
- Existing sub-pages (LeadsInbox, BillsWorkspace, etc.) — untouched in Phase 1
- Routing structure — same paths, same lazy loading
- Database schema — no changes
- Auth flow — no changes

