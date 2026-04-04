
# SITA OS — Complete Setup Ceremony Implementation

## What Already Exists (Extensive)

The project has a mature setup system with:
- **42 setup phases** defined in `SetupPhaseId` with a 12-state status machine
- **Full orchestration engine** (`SetupOrchestrationEngine`) with DAG-based sequencing, branching, rollback, persistence, resume
- **40 setup components** in `src/components/sita/setup/` (shells, panels, cards, controls)
- **36 onboarding step components** in `src/components/sita/onboarding/`
- **1218-line orchestrator** (`OSSetupExperience.tsx`) wiring all phases together
- **PostArrivalDesktop** component with welcome card, boardroom brief, priorities
- **DesktopTransitionStep** with 10-stage cinematic animation

## What's Missing

### A. Missing Screens (3 screens)
1. **Restore Preview** (`restore-preview` phase) — referenced in contracts but no step component exists. Need `RestorePreviewStep.tsx` showing profile, last-used info, restorable categories, selective restore
2. **Essential Updates / Device Readiness** — `DeviceReadinessStep` exists but is minimal; needs update status, battery awareness, reboot continuation
3. **Deferred Completion Center** — no component exists. Post-arrival hub for skipped items

### B. Missing Experience Layers (7 systems)
1. **Emotional Arc Controller** — pacing metadata per phase (mystery → safety → ownership → personalization → confidence → delight → arrival)
2. **Signature Wow Moments** — 7 hero animations at key transitions (boot formation, timezone light map, secure stabilization, restore return, world model assembly, trust spectrum, desktop reveal)
3. **Reflection Copy Engine** — generates personalized summary text reflecting user choices throughout ("You chose quiet guidance — we'll keep things calm")
4. **Progressive Confidence Visualization** — subtle "environment understanding" indicator evolving from basic → forming → understanding → ready
5. **Chapter Transition Choreography** — animated transitions between major phase groups (Preparing → Securing → Connecting → Personalizing → Activating → Arriving)
6. **"Why Recommended" Layer** — visible reasoning for every recommendation throughout setup
7. **Ambient Maturity System** — background visuals that evolve from abstract/cool to warm/structured as setup progresses

### C. Missing Integration Points (3 items)
1. **World Model → Recommendation Engine** — quick identity + deep world model outputs should drive advisor, connection, and first-win recommendations with visible reasoning
2. **Setup → Deferred Completion Center** — all skipped/deferred items should flow to a post-arrival hub
3. **Restore Preview Phase** — add to orchestration DAG between `account-environment` and `access-protection`

---

## Implementation Plan

### Phase 1: Missing Screens (3 new components)

**1.1 RestorePreviewStep** (`src/components/sita/onboarding/RestorePreviewStep.tsx`)
- Profile image, environment name, "Last used on..." timestamp
- Restorable category cards (advisors, trust settings, boards, desktop layout, connections, routines)
- Selective restore toggles
- CTAs: "Restore this environment", "Start fresh instead", "Restore later"
- States: preview_ready, partial_restore_only, restore_validating, restore_confirmed
- Wire into `OSSetupExperience.tsx` as `restore-preview` phase after `account-environment`

**1.2 DeferredCompletionCenter** (`src/components/sita/setup/DeferredCompletionCenter.tsx`)
- "Finish setup your way" heading
- Cards for: biometrics, optional connections, deeper personalization, advisor tuning, recovery completion
- Each card shows what was skipped and why it matters
- Non-nagging design — elegant, tucked away
- Wire into `PostArrivalDesktop.tsx` as expandable section
- Also accessible from Settings sidebar

**1.3 Enhanced DeviceReadinessStep** — update existing component
- Add battery awareness (low battery hold state)
- Add update progress categories (Security, Stability, Device readiness, Recovery)
- Add reboot continuation support via `SetupPersistenceManager`

### Phase 2: Emotional Arc & Wow System (4 new modules)

**2.1 Emotional Arc Controller** (`src/lib/setup/emotional-arc.ts`)
- Map each phase to an emotional target: mystery, safety, ownership, personalization, confidence, delight, arrival
- Export `getEmotionalTarget(phase)` → returns arc metadata (energy level, warmth, ambient hue shift)
- Used by `AmbientFormationCanvas` to evolve background visuals

**2.2 Signature Wow Moments** (`src/components/sita/setup/SignatureWowMoment.tsx`)
- 7 hero transition animations triggered at phase boundaries:
  1. Boot formation — particles coalescing into SITA mark
  2. Secure stabilization — shield pulse with trust confirmation
  3. Timezone light map — globe with light/shadow shifting to user timezone
  4. Restore return — "your world is returning" with module icons reassembling
  5. World model assembly — live visualization of user profile building
  6. Trust spectrum — autonomy dial animation with workflow preview
  7. Desktop arrival — full cinematic reveal (enhance existing `DesktopTransitionStep`)
- Each moment is 1.5-3s, skippable, respects reduced motion

**2.3 Reflection Copy Engine** (`src/lib/setup/reflection-copy.ts`)
- Takes current `SetupData` state, returns contextual copy strings
- Examples: "You chose quiet guidance — SITA will keep things calm", "Since follow-through matters most, support is being prepared there first"
- Used in: arrival prep summary, learning panel, chapter transitions, advisor activation
- 30-40 copy templates keyed by state combinations

**2.4 Progressive Confidence Indicator** (`src/components/sita/setup/ConfidenceIndicator.tsx`)
- Subtle indicator in progress rail area
- Levels: basic (0-20%) → forming (20-50%) → understanding (50-80%) → ready (80-100%)
- Computed from: completed phases, data completeness, connections, world model depth
- Not gamified — premium readiness feeling

### Phase 3: Chapter Transitions & Ambient Maturity (3 items)

**3.1 Chapter Transition Controller** (`src/components/sita/setup/ChapterTransition.tsx`)
- 6 chapter boundaries with distinct animations:
  - Foundation (boot → ownership)
  - Identity (account → access protection)
  - Personalization (privacy → world modeling)
  - Intelligence (use mode → advisor activation)
  - Activation (connections → first win)
  - Arrival (arrival prep → desktop)
- Each: 1-2s cinematic bridge with chapter title, ambient shift, optional sound cue
- Triggered by `OSSetupExperience` when crossing chapter boundaries

**3.2 Ambient Maturity System** — enhance `AmbientFormationCanvas`
- Accept `emotionalPhase` prop from emotional arc controller
- Background evolves: cold/abstract → warmer → structured → personalized → alive → ready
- Hue, blur radius, position, and opacity shift gradually across phases

**3.3 "Why Recommended" Layer** — enhance existing recommendation components
- Add `reasoning` prop to `UseModeSelectionCards`, `AdvisorActivationStep`, `FirstWinSetupStep`, `RecommendedConnectionsPanel`
- `reflection-copy.ts` generates reasoning strings based on world model + quick identity data
- Display as subtle italic text beneath recommended badges

### Phase 4: Integration & Wiring (5 items)

**4.1 Add `restore-preview` phase to orchestration**
- Add to `SetupPhaseId` union type
- Add `SetupPhaseDefinition` in `setup-phase-definitions.ts`
- Conditional: only shown if `accountPath === "restore"` (branch evaluator)
- Wire in `OSSetupExperience.tsx`

**4.2 Wire Deferred Items Pipeline**
- Track all skipped phases in orchestration engine (already tracks `skippedPhases`)
- Map skipped phases to deferred completion items
- Pass to `PostArrivalDesktop` and `DeferredCompletionCenter`
- Persist to `user_memory` table with key `deferred_items`

**4.3 Wire Reflection Copy into existing steps**
- `ArrivalPrepStep` — show 3-4 reflection lines summarizing choices
- `LearningPanel` — show evolving reflection text
- `AdvisorActivationStep` — "Recommended because..."
- `FirstWinSetupStep` — "Based on your priorities..."

**4.4 Wire Confidence Indicator into PhaseProgressRail**
- Compute confidence from setup state completeness
- Show as subtle label/meter beneath progress rail

**4.5 Wire Chapter Transitions into OSSetupExperience**
- Detect chapter boundary crossings in `goNext`
- Inject `ChapterTransition` overlay before rendering next phase

---

## Files Created/Modified

| File | Action |
|------|--------|
| `src/components/sita/onboarding/RestorePreviewStep.tsx` | New |
| `src/components/sita/setup/DeferredCompletionCenter.tsx` | New |
| `src/lib/setup/emotional-arc.ts` | New |
| `src/lib/setup/reflection-copy.ts` | New |
| `src/components/sita/setup/SignatureWowMoment.tsx` | New |
| `src/components/sita/setup/ConfidenceIndicator.tsx` | New |
| `src/components/sita/setup/ChapterTransition.tsx` | New |
| `src/components/sita/setup/AmbientFormationCanvas.tsx` | Update — add emotional phase props |
| `src/components/sita/setup/index.ts` | Update — add new exports |
| `src/components/sita/OSSetupExperience.tsx` | Update — wire restore-preview, chapter transitions, confidence, reflection copy |
| `src/components/sita/PostArrivalDesktop.tsx` | Update — add deferred completion section |
| `src/components/sita/onboarding/DeviceReadinessStep.tsx` | Update — battery, update categories |
| `src/components/sita/onboarding/AdvisorActivationStep.tsx` | Update — add reasoning prop |
| `src/components/sita/onboarding/FirstWinSetupStep.tsx` | Update — add reasoning prop |
| `src/components/sita/onboarding/ArrivalPrepStep.tsx` | Update — add reflection copy |
| `src/components/sita/onboarding/LearningPanel.tsx` | Update — add reflection text |
| `src/packages/contracts/specialized/setup-orchestration.ts` | Update — add `restore-preview` to SetupPhaseId |
| `src/lib/engines/setup-phase-definitions.ts` | Update — add restore-preview definition |

## Implementation Order

1. Create `emotional-arc.ts` + `reflection-copy.ts` (foundational data modules)
2. Create `RestorePreviewStep.tsx` + wire into orchestration
3. Create `DeferredCompletionCenter.tsx` + wire into PostArrivalDesktop
4. Create `SignatureWowMoment.tsx` + `ChapterTransition.tsx` + `ConfidenceIndicator.tsx`
5. Enhance `AmbientFormationCanvas` with emotional phase support
6. Wire chapter transitions + confidence into `OSSetupExperience.tsx`
7. Wire reflection copy into `ArrivalPrepStep`, `LearningPanel`, advisor/first-win steps
8. Enhance `DeviceReadinessStep` with battery/update categories
9. Update barrel exports
10. Verify TypeScript compilation
