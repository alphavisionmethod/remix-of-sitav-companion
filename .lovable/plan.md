

# Concierge App — Final Completeness & Polish Pass

## Current State (Audit Results)

**All 24/24 reusable components** exist in `src/components/concierge/` with barrel exports.

**All 19/19 pages** exist and are wired in `ConciergeCenter.tsx` with grouped navigation (Home / Life / Support / Office).

**Remaining gaps:**

### 1. HouseholdAdvisor → ConciergeAdvisorInsightCard migration (7 pages still use old component)

Only 4 pages use the new `ConciergeAdvisorInsightCard`. These 7 still use the old generic `HouseholdAdvisor`:
- `ErrandsLogistics.tsx`
- `UpcomingNeeds.tsx`
- `RecurringObligations.tsx`
- `ConciergeWorkflows.tsx`
- `FamilyBoardroom.tsx`
- `GroceryPlanning.tsx`
- `HouseholdTasks.tsx`
- `FamilyCalendar.tsx` (also uses old advisor)

### 2. New concierge components not yet used in their target pages

Several components were created but never integrated:
- `TravelReadinessCard` — not used in TravelPlanning or Overview
- `ReservationStatusCard` — not used anywhere
- `AppointmentPrepCard` — not used in AppointmentsPrep
- `ServiceFollowUpCard` — not used in ServiceProviders or Overview
- `ConciergeAutomationRuleCard` — not used in ConciergeWorkflows
- `RecurringAdminList` — not used in RecurringObligations
- `EventPrepCard` — not used in EventsGifts
- `VendorDetailPanel` — not used in ServiceProviders

### 3. No database tables exist

The `supabase-tables` section is empty. The `use-concierge-data.ts` hooks reference tables (`travel_plans`, `grocery_lists`, `grocery_items`, `service_providers_list`, `school_activities`, `gift_tracker`, `appointments`) that don't exist in the database yet. Additional tables needed for new workspaces: `errands`, `recurring_obligations`, `concierge_automations`, `concierge_documents`.

---

## Implementation Plan

### Phase 1: Replace all HouseholdAdvisor usages (7 files)

Replace `HouseholdAdvisor` with `ConciergeAdvisorInsightCard` in all 7 remaining pages. Each gets a concierge-branded advisor with purple-rose gradient, proper confidence level, and linked items. Remove unused `HouseholdAdvisor` imports.

### Phase 2: Integrate unused components into their target pages

- **TravelPlanning** — Add `TravelReadinessCard` (readiness % per trip) and `ReservationStatusCard` (confirmations)
- **AppointmentsPrep** — Add `AppointmentPrepCard` for prep checklist rendering
- **ServiceProviders** — Add `ServiceFollowUpCard` for pending follow-ups and `VendorDetailPanel` as expandable detail
- **ConciergeWorkflows** — Use `ConciergeAutomationRuleCard` for rule display instead of inline cards
- **RecurringObligations** — Use `RecurringAdminList` for the main list rendering
- **EventsGifts** — Use `EventPrepCard` for event items in prep/timeline views
- **ConciergeOverview** — Add `TravelReadinessCard`, `ServiceFollowUpCard`, and `ReservationStatusCard` to bento grid

### Phase 3: Create database tables

Create migrations for core concierge tables with RLS:

1. **`concierge_errands`** — id, user_id, title, location, estimated_minutes, priority, status, bundle_id, combinable, due_date
2. **`concierge_recurring_obligations`** — id, user_id, title, category, frequency, next_due, last_completed, status, effort, automatable
3. **`concierge_automations`** — id, user_id, title, trigger, conditions, trust_level, status, safety_boundary, last_run, recent_runs
4. **`concierge_documents`** — id, user_id, name, type, sensitivity, linked_context, expiry_date, file_path, created_at
5. **`travel_plans`** — id, user_id, destination, start_date, end_date, readiness_percent, notes
6. **`appointments`** — id, user_id, title, provider, appointment_date, status, prep_items, docs_needed, transport_time
7. **`grocery_lists`** / **`grocery_items`** — existing hook references
8. **`service_providers_list`** — id, user_id, name, category, phone, location, rating, trusted, total_spent
9. **`school_activities`** — existing hook reference
10. **`gift_tracker`** — existing hook reference

All tables get `user_id` column with RLS policies allowing authenticated users to CRUD their own rows.

### Phase 4: Wire hooks to real data

Update `use-concierge-data.ts` with hooks for the new tables (`useErrands`, `useRecurringObligations`, `useConciergeAutomations`, `useConciergeDocuments`) and create mutation hooks for CRUD operations.

### Phase 5: Emotional design polish

- Softer gradient backgrounds on concierge pages (purple-rose via `from-primary/[0.03] via-accent/[0.02]`)
- Gentler page transition animations (0.3s ease, no aggressive springs)
- Support-oriented empty states with encouraging copy ("Nothing urgent — enjoy your day" vs generic "No items found")
- State-aware Overview rendering (detect travel-heavy/overloaded from data)

---

## Technical Details

- No new routing changes needed — all pages already wired
- Database migrations create ~10 tables with RLS
- Component integration is import + render with demo data as fallback
- HouseholdAdvisor replacement is a mechanical find-and-replace across 7 files
- Total: ~7 files modified for advisor swap, ~7 files enhanced with component integration, ~10 DB tables, ~4 new hooks

