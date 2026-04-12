

# SITA OS — Full Concierge App Implementation Plan

## Current State Assessment

The Concierge app already has **16 sub-pages** wired into `ConciergeCenter.tsx` with tabbed navigation, mobile selector, CAI data context, error boundaries, and advisor strip. Existing pages:

| Page | Status | Quality |
|------|--------|---------|
| ConciergeOverview | ✅ Full | WhatMattersNow, PreparedActions, WhatChanged, KPIs, family board, overload, bento grid |
| HouseholdTasks | ✅ Full | DB-backed CRUD, filters, priority, assignment, advisor |
| MonthGridCalendar | ✅ Exists | Calendar views |
| LifeAdminCenter | ✅ Good | 5-tab admin (recurring, service, forms, upcoming, aging) |
| TravelPlanning | ✅ Good | Trips, prep, itinerary, logistics, post-trip, advisor, budget cross-ref |
| GroceryPlanning | ✅ Good | Shopping list, recurring, by-store, urgency, event-prep |
| AppointmentsPrep | ✅ Good | Prep checklists, docs, transport, advisor |
| ServiceProviders | ✅ Full | Search, filter, history, spend, inspector, proof, advisor |
| EventsGifts | ✅ Good | Gift tracking, milestones, prep items, advisor |
| SchoolActivities | ✅ Good | Forms, fees, meetings, transport, volunteers |
| ConciergeWorkflows | ✅ Good | Approval gates, proof states, execution tracking |
| ConciergeProof | ✅ Good | Verified/pending records |
| ConciergeFiles | ✅ Good | Categories, sensitivity, expiry, upload |
| FamilyBoardroom | ✅ Full | Weekly review, priorities, conflicts, next moves, wellness, cross-domain |
| HouseholdCommandCenter | ✅ DB-backed | Household CRUD with members |
| ConciergeSettings | ✅ Good | Roles, permissions, rules |

## Gap Analysis vs Full Spec

### Missing Pages (New)
1. **Errands & Logistics** — No dedicated errands workspace (spec §8)
2. **Recurring Personal Obligations** — Currently inside LifeAdmin as one tab, needs standalone depth (spec §12)
3. **Upcoming & Needs Handling** — No unified "upcoming" surface across all entity types (spec §5)

### Missing Components (spec §23)
Most of these are inline today but not extracted as reusable components:
- `ConciergeHomeSummary` — exists inline in Overview
- `UpcomingObligationsCard` — partial
- `ErrandBundleCard` — missing entirely
- `LogisticsTimelineCard` — missing
- `SupportBurdenCard` — missing
- `GroupedPrepBundleCard` — missing
- `ConciergeContinuityCard` — missing
- `ConciergeReviewQueue` — missing

### Depth Gaps in Existing Pages
4. **ConciergeOverview** — Missing: support burden card, continuity items, "quiet support" notes, state variants (travel-heavy, overloaded, etc.), today summary pulse
5. **TravelPlanning** — Missing: document bundle view, readiness checklist with scoring, missing confirmations detector, calendar conflict detection
6. **LifeAdminCenter** — Missing: grouped admin sessions, "handle in one sitting" bundles, AI-powered detection
7. **AppointmentsPrep** — Missing: recurring appointments, follow-up after appointment, grouped prep
8. **EventsGifts** — Missing: planning board view, prep timeline, event detail panel
9. **FamilyBoardroom** — Missing: daily pulse mode, travel-heavy review, overloaded-life-admin review, household-support review
10. **ConciergeWorkflows → Automations** — Missing: simulation previews, suggested automations, automation library, safety boundaries display

### Navigation Gap
11. The spec calls for adaptive navigation (travel-heavy / household-heavy / admin-heavy modes). Currently static tab groups.

### Emotional Design Gap
12. The Overview opens with family members + KPIs. Spec wants it to open with "what needs handling" first, with a relieving emotional tone. Need softer gradients, support-oriented framing.

---

## Implementation Plan

### Phase 1: New Pages + Components (Core Gaps)

**Task 1: Create Errands & Logistics page** (`src/pages/concierge/ErrandsLogistics.tsx`)
- Errand queue with location, date, dependencies
- Grouped errands view (by geography, by day)
- Route/day bundle cards
- Quick wins section
- "Can be combined" suggestions
- AI grouping advisor
- New components: `ErrandBundleCard`, `LogisticsTimelineCard`

**Task 2: Create Upcoming & Needs Handling page** (`src/pages/concierge/UpcomingNeeds.tsx`)
- Unified view across obligations, appointments, reservations, trips, errands, recurring needs
- Views: today, next 3 days, this week, this month, grouped by type/location/burden
- "Needs handling soon" vs "Can wait" split
- Calm anticipatory design (no panic list)
- New components: `UpcomingObligationsCard`, `SupportBurdenCard`

**Task 3: Create Recurring Obligations page** (`src/pages/concierge/RecurringObligations.tsx`)
- All recurring items across categories
- Due soon, monthly rhythm, review-needed views
- Pattern detection messaging
- Simplification suggestions
- New component: `RecurringAdminList`

### Phase 2: Deepen Existing Pages

**Task 4: Enhance ConciergeOverview**
- Add `ConciergeHomeSummary` top component (today summary, support pulse, trust indicator)
- Add `SupportBurdenCard` showing aggregate load
- Add `ConciergeContinuityCard` showing items from yesterday
- Add state-aware rendering (travel-heavy, overloaded, quiet week)
- Softer emotional design: gradient headers, relieving copy
- Add `GroupedPrepBundleCard` for showing prep bundles

**Task 5: Enhance TravelPlanning**
- Add readiness scoring per trip (% ready)
- Missing confirmations detector with alerts
- Document bundle view
- Calendar conflict detection messaging

**Task 6: Enhance FamilyBoardroom**
- Add daily pulse mode (lighter, quick-glance)
- Add travel-heavy review mode
- Add overloaded-life-admin review mode
- Contextual mode auto-detection

**Task 7: Enhance ConciergeWorkflows → Automations**
- Rename to "Automations" in nav
- Add automation library (suggested automations)
- Add simulation preview panel
- Add safety boundaries display
- Add paused/failed automation sections

### Phase 3: Navigation & Polish

**Task 8: Wire new pages into ConciergeCenter**
- Add `errands`, `upcoming`, `recurring` to SubPage type
- Add routes in App.tsx
- Update TAB_GROUPS to reorganize:
  - Home: Overview, Upcoming, Calendar
  - Life: Life Admin, Errands, Appointments, Travel
  - Support: Household, Grocery, School, Providers, Events, Recurring
  - Office: Automations, Proof, Files, Boardroom, Settings

**Task 9: Extract reusable components** (`src/components/concierge/`)
- `ConciergeHomeSummary`
- `UpcomingObligationsCard`
- `ErrandBundleCard`
- `LogisticsTimelineCard`
- `SupportBurdenCard`
- `GroupedPrepBundleCard`
- `ConciergeContinuityCard`
- `ConciergeReviewQueue`

### Phase 4: Emotional Design Pass

**Task 10: Premium visual refinement**
- Softer accent gradients for concierge domain (purple-rose)
- "Relief" animations (gentle fade-in, no aggressive bounces)
- Support-oriented copy throughout (not task/productivity language)
- Empty states that feel encouraging, not shame-inducing
- Quiet luxury feel: translucent cards, subtle glows

---

## Technical Details

- All new pages follow existing pattern: demo data with `useDataMode()`, `DemoModeBadge`, motion animations, `SitaCard`/`GlassCard` primitives
- Components extracted to `src/components/concierge/index.ts` barrel
- Navigation wired through `ConciergeCenter.tsx` tab system + `App.tsx` routes
- No database changes needed — demo data first, DB hooks already exist in `use-concierge-data.ts`
- Follows existing architecture: domain-shared primitives (WhatMattersNow, PreparedActions, WhatChangedFeed) reused where appropriate

## Estimated Scope
- ~3 new page files (~200-300 lines each)
- ~8 new component files (~50-100 lines each)  
- ~5 existing files enhanced
- ConciergeCenter.tsx + App.tsx route updates

