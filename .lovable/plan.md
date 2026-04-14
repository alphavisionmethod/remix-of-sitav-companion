

# Business Profile Engine — Adaptive Business OS

## What This Does
Builds a **Business Profile Engine** that reads the existing `BusinessTwin` data (captured during onboarding) and dynamically adapts the entire Business OS — sidebar priority, home dashboard, CRM fields, advisor roster, boardroom framing, workflow suggestions, and KPIs — based on whether the business is ecommerce, service, local, agency, employee-heavy, hybrid, or a weighted combination.

## Existing Foundation (already built, no duplication)
- `business-twin.ts` — Full `BusinessTwin` type with 15 sub-models including `BusinessArchetype`
- `OnboardingState` — Captures `businessTypes[]`, `revenueSources[]`, `teamRoles`, etc.
- `branching.ts` — Business-type branching questions per archetype
- `advisor-topology.ts` — 6 static business advisors
- `BusinessAppShell.tsx` — Static sidebar with 6 groups, no adaptation yet

## Implementation — 5 Batches

---

### Batch 1: Profile Engine Core + Context + Hook
**3 new files — the brain of the system**

**`src/lib/engines/business-profile-engine.ts`**
- Takes `BusinessTwin` or `OnboardingState` as input
- Computes a **weighted business model profile** (e.g., `{ service: 0.6, ecommerce: 0.25, local: 0.15 }`)
- Derives `operatingFlags`: `hasEmployees`, `hasAppointments`, `hasEcommerce`, `hasLocations`, `sendsQuotes`, `sendsInvoices`, `hasRecurringRevenue`, `hasCollections`
- Exports full adaptation config: sidebar priority, home widgets, CRM emphasis, advisor stack, boardroom focus, workflow templates, KPI set, language/tone
- Supports 12 archetypes: ecommerce, brick-and-mortar, service, employee-based, appointment-based, agency, professional-practice, hybrid, multi-location, product+service, membership/subscription, marketplace/platform
- Manual override merging — user adjustments blend with computed weights

**`src/contexts/BusinessProfileContext.tsx`**
- Provides `BusinessProfileResult` to entire Business OS tree
- Initialized from onboarding data (localStorage-backed)
- Exposes `updateProfile()` for manual reconfiguration

**`src/hooks/useBusinessProfile.ts`**
- Convenience hook consuming the context
- Returns `weights`, `primaryMode`, `operatingFlags`, `adaptations`

---

### Batch 2: Adaptive Sidebar + Home Dashboard
**1 modified file, 2 new files**

**Modify `BusinessAppShell.tsx`**
- Wrap content in `BusinessProfileContext.Provider`
- Consume `useBusinessProfile()` to dynamically reorder sidebar groups
- Primary modules for detected type float to top
- Irrelevant modules collapse into "More" group
- Badge counts adapt (ecommerce → cart recovery count, service → proposal count)

**`src/components/business/adaptive/AdaptiveBusinessHome.tsx`**
- Replaces static `BusinessOverview` as the default home when profile is active
- Renders different widget grids per profile:
  - **Ecommerce**: Orders, Cart Recovery, Conversion, AOV, Fulfillment, Returns, Campaign ROI
  - **Service**: Pipeline Value, Booked Work, Pending Proposals, Follow-up Queue, Scheduling Load, Invoice Timing
  - **Local/B&M**: Appointments Today, Walk-in Traffic, Staffing Coverage, Location Performance, Repeat Visits, Reputation Score
  - **Employee-heavy**: Active Assignments, Handoff Queue, Workload Distribution, Accountability Score, Support Queue, Execution Rate
  - **Hybrid**: Weighted blend with configurable panel emphasis

**`src/components/business/adaptive/BusinessHomeWidgetRegistry.ts`**
- Registry of all possible home widgets with archetype affinity scores
- Engine picks top-N based on weighted profile match

---

### Batch 3: Adaptive CRM + Data Emphasis
**1 new config file, 3 modified pages**

**`src/components/business/adaptive/AdaptiveCRMConfig.ts`**
- Defines per-archetype CRM adaptations:
  - **Ecommerce CRM**: order history, product lifecycle, cart state, campaign attribution, spend segmentation. Language: "Orders", "Carts", "Buyers"
  - **Service CRM**: lead→consult→quote→close flow, communication history, proposal timing, delivery timeline. Language: "Clients", "Jobs", "Proposals"
  - **Local CRM**: visits, appointments, loyalty frequency, staff notes, location context. Language: "Visitors", "Walk-ins", "Regulars"
  - **Employee CRM**: account owner, handoff state, team tasks, accountability, response standards. Language: "Accounts", "Assignments", "Handoffs"

**Modify `CRMHome.tsx`** — consume profile for adaptive quick actions, segment defaults, stat cards
**Modify `CRMContacts.tsx`** — adaptive column priority and field visibility
**Modify `CRMPipeline.tsx`** — adaptive pipeline stage names and emphasis

---

### Batch 4: Adaptive Advisors + Boardroom
**2 new engine files, extends existing topology**

**`src/lib/engines/adaptive-advisor-roster.ts`**
- Given `BusinessProfileResult`, returns the optimal advisor stack:
  - **Ecommerce**: Conversion Advisor, Cart Recovery Advisor, Retention Advisor, Customer LTV Advisor, Support Pressure Advisor, Offer Timing Advisor
  - **Service**: Lead Follow-up Advisor, Quote/Proposal Advisor, Scheduling Advisor, Delivery Load Advisor, Collections Advisor, Client Relationship Advisor
  - **Local**: Local Ops Advisor, Appointment/Footfall Advisor, Staff Coverage Advisor, Repeat Customer Advisor, Local Issue Advisor
  - **Employee-heavy**: Team Workload Advisor, Assignment Advisor, Handoff Advisor, Bottleneck Advisor, Customer Accountability Advisor
  - **Hybrid**: Weighted combination from all applicable rosters
- Each advisor gets a unique portrait seed, accent color, and specialty description
- Extends the existing `AdvisorRole` type from `advisor-topology.ts`

**`src/lib/engines/adaptive-boardroom-framing.ts`**
- Given `BusinessProfileResult`, returns boardroom configuration:
  - Focus areas, agenda priorities, review mode, KPI emphasis
  - Ecommerce boardroom focuses on conversion, retention, support pressure, refunds
  - Service boardroom focuses on pipeline quality, proposal velocity, delivery execution
  - Local boardroom focuses on staffing, location performance, appointment patterns
  - Employee boardroom focuses on workload, bottlenecks, accountability, consistency

---

### Batch 5: Adaptive Workflows + Profile Editor UI
**2 new files, 1 modified**

**`src/lib/engines/adaptive-workflow-templates.ts`**
- Suggests workflow templates based on business type:
  - **Ecommerce**: cart recovery, order follow-up, retention sequences, review requests, winbacks
  - **Service**: lead intake, proposal follow-up, scheduling, pre-service reminders, invoice follow-up
  - **Local**: appointment reminders, repeat outreach, staff handoff, location escalation
  - **Employee/team**: assignments, escalations, checklists, overdue follow-up, accountability reviews
- Each template has: name, description, trigger, steps, archetype affinity score

**`src/components/business/adaptive/BusinessProfileEditor.tsx`**
- Full settings panel inside Business OS
- Shows current weighted profile with visual progress bars per archetype
- Manual sliders to adjust emphasis weights
- Toggle operating flags (appointments, ecommerce, locations, etc.)
- Live preview of how changes affect home, sidebar, advisors, boardroom
- "Reset to detected" button restores onboarding-derived profile
- Beautiful dark glassmorphic UI matching the OS aesthetic

**Modify `BusinessAppShell.tsx`**
- Add "Business Profile" to System sidebar group
- Wire `BusinessProfileEditor` into the pages map

---

## Wiring Map (no duplication)

| Consumer | Source | What Adapts |
|----------|--------|-------------|
| `BusinessAppShell` sidebar | `useBusinessProfile()` | Group order, visibility, badges |
| `AdaptiveBusinessHome` | `useBusinessProfile()` | Widget grid, KPIs, quick actions |
| `CRMHome/Contacts/Pipeline` | `useBusinessProfile()` | Fields, columns, language, segments |
| `DomainAdvisorBoard` | `adaptive-advisor-roster` | Which advisors, specialties, portraits |
| `BusinessBoardroom` | `adaptive-boardroom-framing` | Focus areas, review mode |
| `CRMAutomations` | `adaptive-workflow-templates` | Suggested templates |
| `BusinessProfileEditor` | `useBusinessProfile()` | Manual override UI |
| Onboarding completion | `business-profile-engine` | Seeds initial profile |

## Technical Details

- Profile stored in localStorage keyed by user ID, read into React context on mount
- No database migration needed — client-side first, DB persistence added when auth matures
- All new files import existing types from `business-twin.ts` — zero type duplication
- Engine is pure functions (testable, no side effects)
- All UI uses existing design tokens (`hsl(var(--sita-*))`, glassmorphic borders, Space Grotesk)

## New Files (10)
1. `src/lib/engines/business-profile-engine.ts`
2. `src/hooks/useBusinessProfile.ts`
3. `src/contexts/BusinessProfileContext.tsx`
4. `src/components/business/adaptive/AdaptiveBusinessHome.tsx`
5. `src/components/business/adaptive/BusinessHomeWidgetRegistry.ts`
6. `src/components/business/adaptive/AdaptiveCRMConfig.ts`
7. `src/lib/engines/adaptive-advisor-roster.ts`
8. `src/lib/engines/adaptive-boardroom-framing.ts`
9. `src/lib/engines/adaptive-workflow-templates.ts`
10. `src/components/business/adaptive/BusinessProfileEditor.tsx`

## Modified Files (6)
1. `BusinessAppShell.tsx` — profile provider, adaptive sidebar, profile editor page
2. `CRMHome.tsx` — adaptive stats/actions
3. `CRMContacts.tsx` — adaptive fields
4. `CRMPipeline.tsx` — adaptive stages
5. `BusinessBoardroom.tsx` — adaptive focus
6. `CRMAutomations.tsx` — adaptive template suggestions

