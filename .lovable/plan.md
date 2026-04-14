

# Business Onboarding & Settings: Polish to 100%

## Issues Found

1. **Business type mismatch**: IdentityScreen offers 9 types (`service`, `agency`, `coaching`, `creator`, `ecommerce`, `local`, `membership`, `hybrid`, `evolving`) but the journey config (`business-journey-config.ts`) and Settings page only handle 8 — missing `membership`, `hybrid`, `evolving`. Settings page has `marketplace` which isn't in Identity.
2. **Journey auto-recommendation not wired**: `getRecommendedJourney()` exists in `business-journey-config.ts` but is never called — JourneyScreen doesn't auto-select a template based on business types chosen in IdentityScreen.
3. **Settings page missing sections**: No conversion weakness editor, no post-sale steps, no lead sources — users can't modify several things they set during onboarding.
4. **No success feedback on settings save**: Toast exists but no visual confirmation animation.
5. **Settings doesn't sync journey config**: Changing business types in settings doesn't auto-suggest updating the journey template.

## Plan

### 1. Sync business type options across Identity & Settings
- **Files**: `BusinessSettingsPage.tsx`, `business-journey-config.ts`
- Add `membership`, `hybrid`, `evolving` to `TYPE_ITEMS` in journey config with appropriate module mappings
- Replace Settings page `BUSINESS_TYPES` array with the exact same list from IdentityScreen (9 types)

### 2. Wire journey auto-recommendation
- **File**: `JourneyScreen.tsx`
- On mount, if `journeyTemplate` is empty, auto-select using `getRecommendedJourney(state.businessTypes)`
- Show a SITA callout: "Based on your business type, we recommend the [X] journey"

### 3. Expand Settings page with missing sections
- **File**: `BusinessSettingsPage.tsx`
- Add **Lead Sources** section (referrals, ads, organic, etc.)
- Add **Conversion & Sales** section (pre-buy behavior, what closes deals)
- Add **Post-Sale & Delivery** section (delivery steps, common slips)
- Add **Journey Sync** prompt: when business types change, show "Your journey template may need updating" with a one-click re-match button

### 4. Add save confirmation animation
- **File**: `BusinessSettingsPage.tsx`
- After save: brief green checkmark pulse animation on the Save button
- Sticky save bar at bottom when `hasChanges` is true (instead of only top-right)

### 5. Ensure journey template updates cascade to sidebar
- **File**: `BusinessAppShell.tsx`
- Already reads `onboardingState.businessTypes` — verify it also re-reads after settings save (it does via the hook, but confirm the hook re-fetches after `markComplete`)

## Technical Details
- No DB changes needed — the jsonb column already stores all fields
- All new Settings sections reuse existing `Toggle`, `SingleSelect`, `SectionTitle` primitives
- The `getRecommendedJourney` function already exists and maps types to templates — just needs to be imported and called
- Total: ~5 files modified, 0 new files

