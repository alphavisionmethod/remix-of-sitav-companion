

# Redesign: Business Priorities Screen with Ordered Multi-Select

## Summary

Add a new "What Matters Most" screen as the third step (after Identity, before Revenue Model) in the business onboarding flow. This screen replaces the generic growth goals concept with a premium, ordered multi-select of real business priorities that personalizes the entire SITA experience.

---

## What Changes

### New File: `src/pages/revenue-office/onboarding/screens/PrioritiesScreen.tsx`

A new onboarding screen with:

**Headline**: "What matters most in your business right now?"
**Subtext**: "Select as many as apply, in order of importance. Your priorities shape your dashboard, advisors, and recommendations from day one."

**18 business-grounded options organized into 4 visual groups:**

Revenue and Sales:
- Sales follow-up and closing
- Recovering lost leads / abandoned opportunities
- Invoicing and getting paid
- Collections / overdue payments
- Pricing and profitability visibility

Customers:
- Customer service and support
- Client communication and updates
- Retention and repeat business
- Customer onboarding
- Reviews and reputation

Operations:
- Scheduling and appointments
- Inventory and fulfillment
- Order management
- Workflow automation and admin reduction

Finance and Planning:
- Budgeting and cash flow
- Business accounts management
- Imports / exports and logistics
- Financial reporting and compliance

**Interaction design:**
- Cards in a grouped grid layout with category headers
- Tapping a card selects it and assigns it the next priority number (1, 2, 3...)
- Selected cards show a numbered badge (priority position) instead of just a checkmark
- A "Your Priorities" summary strip appears below the grid showing selected items in order as small reorderable chips
- Drag-to-reorder on the summary strip (using pointer events, mobile-friendly)
- Tapping a selected card again deselects it and renumbers remaining
- Minimum 1 selection required to proceed; no maximum

**SITA Insight callouts:**
- At 1 selection: "Got it -- SITA will focus here first."
- At 3+ selections: "SITA will weight these in order -- your first pick drives the most emphasis."
- At 5+ selections: "Ambitious operator detected -- SITA will build a phased plan across all of these."

**Contextual helper**: "We use your priorities to shape your business dashboard, advisors, and recommendations from day one."

### Modified: `src/pages/revenue-office/onboarding/types.ts`

Add to `OnboardingState`:
```
businessPriorities: string[];  // ordered array -- index = priority rank
```

Add to `defaultOnboardingState`:
```
businessPriorities: []
```

Add new stage entry to `STAGES` array (inserted at position 2, after "identity"):
```
{ id: "priorities", label: "Priorities", chapter: "Formation" }
```

Update the `StageId` type accordingly.

### Modified: `src/pages/revenue-office/onboarding/FormationShell.tsx`

- Import `PrioritiesScreen`
- Add to `screenMap`: `priorities: PrioritiesScreen`
- Screen order adjusts automatically via STAGES array

### New Component: `src/components/onboarding/PriorityOrderChip.tsx`

Small numbered chip showing priority position + label. Used in the "Your Priorities" summary strip. Supports drag handle for reordering.

### New Component: `src/components/onboarding/PriorityReorderStrip.tsx`

Horizontal scrollable strip of PriorityOrderChips. Implements pointer-event-based drag-to-reorder (no external drag library needed). Shows "Drag to reorder" hint when 2+ items selected.

---

## Data Flow

The `businessPriorities` array stores IDs in priority order. Index 0 = highest priority. This ordered array is saved via the existing `useBusinessOnboarding` hook alongside all other onboarding state. No database migration needed -- the state is stored as JSON in the existing `business_onboarding.onboarding_state` column.

This priority data feeds into:
- Advisor activation screen (pre-select relevant advisors)
- Dashboard personalization (module ordering)
- First-win recommendations (based on top priority)
- Future simulation suggestions

---

## Design Direction

- Same glassmorphic card style as existing Toggle primitive but with numbered priority badges
- Category group headers as subtle dividers (not heavy section breaks)
- Summary strip uses the primary accent color with smooth reorder animations
- Mobile: cards stack single-column, summary strip scrolls horizontally
- Premium feel: motion on selection, smooth number transitions, calm spacing

---

## No Database Migration Required

Priority data is stored inside the existing `onboarding_state` JSONB column. No schema changes needed.

