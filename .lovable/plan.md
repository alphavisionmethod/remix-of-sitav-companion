

# SITA OS — Phases 2.8–2.11: Privacy, Quick Identity, Deep World Modeling, Primary Use Mode

## Summary
Create 4 new premium setup phases inserted after `access-protection` and before `welcome`. Also fix the `SetupState` type bug (references undefined type — should be `SetupData`).

## File Changes

### 1. `src/packages/contracts/specialized/setup-orchestration.ts`
Add 4 new phase IDs to the `SetupPhaseId` union type:
- `"privacy-transparency"`
- `"quick-identity"`
- `"deep-world-modeling"`
- `"primary-use-mode"`

### 2. `src/lib/engines/setup-phase-definitions.ts`
Insert 4 new phase definitions after `access-protection` (order 5) and before `welcome` (order 6):
- `privacy-transparency`: depends on `["access-protection"]`, blocking, required, order 5.1, excludedFromSteps: true
- `quick-identity`: depends on `["privacy-transparency"]`, blocking, required, order 5.2, excludedFromSteps: true
- `deep-world-modeling`: depends on `["quick-identity"]`, blocking, required, order 5.3, excludedFromSteps: true
- `primary-use-mode`: depends on `["deep-world-modeling"]`, blocking, required, order 5.4, excludedFromSteps: true

Update `welcome` dependency from `["access-protection"]` to `["primary-use-mode"]`.

### 3. `src/components/sita/onboarding/PrivacyTransparencyStep.tsx` (Create ~400 lines)
- Screen title: "Your data, your control"
- 7 expandable permission cards (Calendar, Communication, Files, Money, Household, Behavior, Notifications)
- Each card has 4 sections: "What SITA can see", "What it can do", "What requires approval", "Can be changed later"
- Toggle per permission with AnimatePresence expand/collapse
- Right-side transparency map visualization: nodes light up as permissions are enabled, connections form between domains
- Proof model preview: animated demo showing overlapping meetings → suggestion → approval required
- State: `permissionChoices: Record<string, boolean>` (7 keys)
- canAdvance: all 7 cards must be reviewed (expanded at least once)

### 4. `src/components/sita/onboarding/QuickIdentityStep.tsx` (Create ~300 lines)
- Screen title: "Help SITA understand where to begin"
- 5 progressive-reveal questions (appear one at a time as previous answered):
  1. "What should SITA help you run first?" — chip selector
  2. "Where do things most often slip?" — chip selector
  3. "What kind of support feels right?" — card selector
  4. "How do you prefer information?" — chip selector
  5. "What would you most like SITA to make easier first?" — optional text input
- Right-side live preview panel showing suggested advisors, first-win candidates, desktop emphasis
- State: `quickIdentity: { runFirst: string[]; slipPoints: string[]; supportStyle: string; infoPreference: string[]; easierFirst: string }`
- canAdvance: at least 2 questions answered

### 5. `src/components/sita/onboarding/DeepWorldModelingStep.tsx` (Create ~450 lines)
- Screen title: "Help SITA understand your world"
- 6 domain chapters as collapsible accordion sections with completion indicators:
  1. My life & routines — morning type slider, weekday chips, weekend priorities
  2. My household — size selector, shared responsibilities chips
  3. My work or business — industry chips, team size, primary tools
  4. My money priorities — saving/spending slider, financial goals chips
  5. My communication style — response time slider, preferred channels
  6. My goals & stress points — top 3 goals cards, stress indicators chips
- Side visualization: animated world model with household nodes, business lane, money lane, advisor suggestions
- State: `worldModel: { routines: object; household: object; work: object; money: object; communication: object; goals: object }`
- canAdvance: at least 1 chapter completed

### 6. `src/components/sita/onboarding/PrimaryUseModeStep.tsx` (Create ~280 lines)
- Screen title: "What should SITA help you run first?"
- 5 premium mode cards: Personal Life (Heart), Family/Household (Users), Business/Operator (Briefcase), Money/Financial (DollarSign), Full SITA (Sparkles)
- Each card: gradient icon background, title, description, example priorities
- Selection triggers animated response: selected card glows, unselected dim, module preview updates
- State: `primaryUseMode: string`
- canAdvance: selection required

### 7. `src/components/sita/OSSetupExperience.tsx`
- Fix: rename `SetupData` interface to `SetupState` (or add `type SetupState = SetupData`)
- Add new fields to `SetupState`: `permissionChoices`, `quickIdentity`, `worldModel`, `primaryUseMode`
- Import 4 new step components
- Add 4 new phase IDs to `showLearningPanel` exclusion list
- Add 4 new phase IDs to session progress bar exclusion
- Add 4 phase render blocks between `access-protection` and `welcome`
- Add `canAdvance` logic for each new phase
- Add new state fields to `finishSetup` persistence array

## Design Patterns
- All components use existing `motion.div` spring: `initial={{ opacity: 0, y: 30 }}, damping: 28, stiffness: 280`
- Colors: `bg-primary/8` selected, `border-primary/50` active borders, `bg-secondary/20` inactive
- Chips use existing `cn()` toggle pattern from WantLessOfStep
- All icons from `lucide-react`
- No new dependencies

## Implementation Order
1. Add phase IDs to contract
2. Add phase definitions to DAG + update welcome dependency
3. Create 4 components in parallel
4. Wire into OSSetupExperience (imports, state, render, persist, canAdvance)
5. Fix SetupState type bug
6. Verify with `tsc --noEmit`

