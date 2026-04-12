

# Concierge App — Remaining Gaps & Implementation Plan

## Audit Summary

**Pages: 19/19 exist and are wired** — All primary concierge spaces from §3.1 are implemented with tabs, KPIs, views, advisor panels, and demo data.

**Reusable Components from §23: 8/24 extracted** — The following 16 are missing as standalone reusable components (some exist inline within pages but are not extracted):

| Missing Component | Where it would be used |
|---|---|
| LifeAdminQueueCard | Overview home, LifeAdmin page |
| TravelReadinessCard | Overview, Travel page |
| ReservationStatusCard | Travel, Upcoming |
| AppointmentPrepCard | Appointments, Overview |
| ServiceFollowUpCard | ServiceProviders, Overview |
| ConciergeAdvisorInsightCard | All pages (replace raw HouseholdAdvisor) |
| ConciergeProofChip | Inline proof badges across all pages |
| ConciergeReceiptViewer | Proof page, Automations |
| ConciergeBoardroomSummary | Boardroom, Overview |
| ConciergeAutomationRuleCard | Automations page |
| PersonalEssentialsPreviewPanel | Files page, Overview |
| UpcomingNeedsList | Upcoming, Overview |
| ConciergeCommandActionPreview | Overview (command bar integration) |
| VendorDetailPanel | ServiceProviders (detail drawer) |
| RecurringAdminList | Recurring, LifeAdmin |
| EventPrepCard | Events, Overview |

**Page depth gaps still remaining:**
- LifeAdminCenter: No "handle in one sitting" bundle view, no grouped admin sessions
- AppointmentsPrep: No recurring appointments tab, no post-appointment follow-up
- EventsGifts: No planning board view, no prep timeline
- ConciergeFiles: No drag-drop, no annotation, no preview panel
- Overview: No command action preview, no state-variant rendering (travel-heavy vs overloaded)

---

## Implementation Plan

### Phase 1: Create 16 missing reusable components

All in `src/components/concierge/`, exported from barrel `index.ts`:

1. **LifeAdminQueueCard** — Compact list of admin items with urgency dots, effort badges, "quick win" tags
2. **TravelReadinessCard** — Trip name, readiness %, checklist progress bar, missing items count, days until departure
3. **ReservationStatusCard** — Reservation title, confirmation status (confirmed/pending/missing), date, linked trip
4. **AppointmentPrepCard** — Appointment with prep checklist, docs needed, transport time, confirmation status
5. **ServiceFollowUpCard** — Vendor name, follow-up reason, days waiting, urgency, linked tasks
6. **ConciergeAdvisorInsightCard** — Concierge-branded advisor (softer purple-rose gradient, relieving tone, linked items)
7. **ConciergeProofChip** — Inline badge: verified/pending/unverified with icon + tooltip
8. **ConciergeReceiptViewer** — Expandable receipt card: action, timestamp, result, verification, details
9. **ConciergeBoardroomSummary** — Compact boardroom entry: completion %, carryover count, top priority, next review date
10. **ConciergeAutomationRuleCard** — Rule card with trigger, conditions, safety boundary, trust level, recent runs count
11. **PersonalEssentialsPreviewPanel** — Document preview card with type icon, sensitivity badge, expiry warning, linked context
12. **UpcomingNeedsList** — Unified list rendering obligations across types with "needs handling" / "can wait" split
13. **ConciergeCommandActionPreview** — Command suggestion chips: "what's slipping?", "group errands", "prep travel"
14. **VendorDetailPanel** — Slide-out or inline detail: contact, history, linked tasks, next action, rating, spend
15. **RecurringAdminList** — Grouped recurring items with rhythm visualization, automatable badges, simplification hints
16. **EventPrepCard** — Event with gift status, prep timeline, days until, outstanding items, linked docs

### Phase 2: Enhance existing pages with new components

**LifeAdminCenter** — Add "One Sitting Bundle" tab using LifeAdminQueueCard, grouped admin sessions
**AppointmentsPrep** — Add recurring appointments section, post-appointment follow-up tab using AppointmentPrepCard
**EventsGifts** — Add planning board view and prep timeline using EventPrepCard
**ConciergeOverview** — Add ConciergeCommandActionPreview strip, state-variant rendering (detect travel-heavy/overloaded from data), replace HouseholdAdvisor with ConciergeAdvisorInsightCard
**ServiceProviders** — Add VendorDetailPanel as expandable inline detail
**ConciergeProof** — Use ConciergeReceiptViewer and ConciergeProofChip
**ConciergeFiles** — Add PersonalEssentialsPreviewPanel for document preview

### Phase 3: Emotional design refinements

- Replace all `HouseholdAdvisor` usage across concierge pages with `ConciergeAdvisorInsightCard` (softer purple-rose gradient, concierge-specific language)
- Add state-aware Overview: detect travel-heavy (active trips > 1), overloaded (overdue > 3), quiet week states and adjust layout/copy
- Softer empty states with encouraging, non-shame copy
- Gentle fade-in animations (no aggressive springs)

---

## Technical Details

- All 16 components follow existing patterns: GlassCard/SitaCard primitives, motion animations, Tailwind styling, TypeScript interfaces
- Each component ~40-80 lines, self-contained with typed props
- Barrel export in `src/components/concierge/index.ts` updated
- Page enhancements add new tabs/sections using the extracted components
- No database changes needed — demo data throughout
- ConciergeAdvisorInsightCard replaces HouseholdAdvisor calls for concierge-specific branding

## Estimated scope
- 16 new component files
- 7 existing pages enhanced
- ~1200 lines of new component code
- ~300 lines of page enhancements

