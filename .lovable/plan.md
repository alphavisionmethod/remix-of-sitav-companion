

# Business Onboarding: Persistence, Settings Page, and Journey-Aware Configuration

## Problem
1. **Multi-select works** — IdentityScreen already supports multiple business types via toggle
2. **Onboarding repeats every time** — State is only saved to `localStorage` on final reveal; no DB persistence; no "completed" flag
3. **No settings page exists** — Users cannot modify business profile after onboarding (e.g., adding a brick-and-mortar location later)
4. **Customer journey isn't business-type-aware** — The sidebar, modules, and tools shown are static regardless of what the user selected during onboarding

## Plan

### 1. Create `business_onboarding` DB table + migration
- Table: `business_onboarding` with columns: `id`, `user_id` (unique), `onboarding_state` (jsonb — stores the full `OnboardingState`), `completed_at`, `created_at`, `updated_at`
- RLS: users can only read/write their own row
- This replaces the current `localStorage`-only approach

### 2. Create `useBusinessOnboarding` hook
- **File**: `src/hooks/useBusinessOnboarding.ts`
- On mount: check if user has a `business_onboarding` row with `completed_at != null`
- Provides: `isCompleted`, `savedState`, `saveProgress()`, `markComplete()`
- For demo users: returns completed with default state

### 3. Update `FormationShell` to persist and gate
- **File**: `src/pages/revenue-office/onboarding/FormationShell.tsx`
- On mount: if `isCompleted`, redirect to `/revenue-office/boardroom` (or Business OS home)
- Auto-save progress on each step change (debounced upsert)
- On final reveal: call `markComplete()` instead of `localStorage.setItem`

### 4. Create Business Settings page
- **File**: `src/pages/business/BusinessSettingsPage.tsx`
- Sections:
  - **Business Identity**: Edit business name, business types (multi-select toggles — same as onboarding), team size, stage
  - **Revenue Model**: Edit revenue sources, growth goals, strongest/weakest streams
  - **Customer Journey**: Edit journey template, pain points, delivery steps
  - **Growth Priorities**: Edit bottlenecks, conversion weaknesses
  - **Automation & Trust**: Edit automation level, human-only tasks, approval actions
  - **Advisors**: Enable/disable advisors, change intensity
- Each section saves to the `business_onboarding.onboarding_state` jsonb column
- Add "Re-run full onboarding" button that clears `completed_at` and navigates to formation
- Register in `BusinessAppShell` sidebar under System group and in `pages` map

### 5. Make Business OS journey-aware
- **File**: `src/components/sita/apps/business/BusinessAppShell.tsx`
- Load the user's `business_onboarding` state on mount
- Conditionally show/hide sidebar groups based on business types:
  - `ecommerce` selected → show E-Commerce, Cart Recovery modules
  - `local` selected → show Appointments, Local Reputation modules  
  - `service/agency` selected → show Proposals, Quotes, Retainer modules
  - `coaching/creator` selected → show Memberships, Course, Launch modules
- Reorder sidebar items by `growthGoals` priority
- Show relevant KPIs on the overview based on business type
- Pass business type context to advisor recommendations

### 6. Wire BusinessOnboarding entry to check completion
- **File**: `src/pages/revenue-office/BusinessOnboarding.tsx`
- Wrap with auth check — redirect to login if not authenticated
- If onboarding already completed, show "You've already set up your business. Go to Settings to modify." with navigation buttons

## Technical Details
- Reuse the existing `OnboardingState` interface from `types.ts` for the jsonb column — no schema duplication
- Settings page reuses the same `Toggle`, `SingleSelect`, `SectionTitle` primitives from `onboarding/primitives.tsx`
- The sidebar visibility logic uses a simple mapping: `businessTypes[] → Set<sidebarItemId>` with a base set always visible
- All changes respect the existing archetype/profile system (`useBusinessProfile`) — settings updates also trigger `updateOverrides` on the `BusinessProfileCtx`

