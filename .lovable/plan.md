

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
1. **Restore Preview** — referenced in contracts but no step component. Needs profile, last-used info, restorable categories, selective restore
2. **Deferred Completion Center** — no component. Post-arrival hub for skipped items
3. **Enhanced Device Readiness** — exists but needs battery awareness, update categories, reboot continuation

### B. Missing Experience Layers (7 systems)
1. **Emotional Arc Controller** — pacing metadata per phase (mystery → safety → ownership → personalization → confidence → delight → arrival)
2. **Signature Wow Moments** — 7 hero animations at key transitions
3. **Reflection Copy Engine** — personalized text reflecting user choices ("You chose quiet guidance — we'll keep things calm")
4. **Progressive Confidence Visualization** — subtle "environment understanding" indicator
5. **Chapter Transition Choreography** — animated transitions between major phase groups
6. **"Why Recommended" Layer** — visible reasoning for every recommendation
7. **Ambient Maturity System** — background visuals evolving across phases

### C. Missing Integration Points (3 items)
1. World Model → Recommendation reasoning
2. Setup → Deferred Completion Center pipeline
3. Restore Preview phase in orchestration DAG

---

## Implementation Plan

### Phase 1: Foundational Data Modules

**1.1 Emotional Arc Controller** (`src/lib/setup/emotional-arc.ts`)
- Map each of 42 phases to emotional target: mystery, safety, ownership, personalization, confidence, delight, arrival
- Export `getEmotionalTarget(phase)` returning arc metadata (energy, warmth, ambient hue, chapter name)

**1.2 Reflection Copy Engine** (`src/lib/setup/reflection-copy.ts`)
- Takes `SetupData` state, returns contextual summary strings
- 30-40 copy templates keyed by state combinations
- Used in arrival prep, learning panel, advisor activation, first-win

### Phase 2: Missing Screens

**2.1 RestorePreviewStep** (`src/components/sita/onboarding/RestorePreviewStep.tsx`)
- Profile image, environment name, "Last used on..." timestamp
- Restorable category cards with selective toggles
- CTAs: Restore / Start fresh / Restore later
- Add `restore-preview` to `SetupPhaseId` and phase definitions
- Conditional on `accountPath === "restore"`

**2.2 DeferredCompletionCenter** (`src/components/sita/setup/DeferredCompletionCenter.tsx`)
- "Finish setup your way" heading
- Cards for each skipped item (biometrics, connections, personalization, recovery)
- Non-nagging, elegant design
- Wire into PostArrivalDesktop as expandable section

**2.3 Enhanced DeviceReadinessStep**
- Battery awareness with low-battery hold
- Update categories: Security, Stability, Device readiness, Recovery
- Reboot continuation via persistence manager

### Phase 3: Wow & Polish Components

**3.1 Signature Wow Moments** (`src/components/sita/setup/SignatureWowMoment.tsx`)
- 7 hero animations: boot formation, secure stabilization, timezone light map, restore return, world model assembly, trust spectrum, desktop reveal
- Each 1.5-3s, skippable, respects reduced motion

**3.2 Chapter Transition Controller** (`src/components/sita/setup/ChapterTransition.tsx`)
- 6 chapter boundaries with cinematic bridge animations
- Foundation → Identity → Personalization → Intelligence → Activation → Arrival

**3.3 Progressive Confidence Indicator** (`src/components/sita/setup/ConfidenceIndicator.tsx`)
- Levels: basic → forming → understanding → ready
- Computed from phase completion + data completeness

**3.4 Enhanced Ambient Formation Canvas**
- Accept `emotionalPhase` prop
- Background evolves: cold/abstract → warm/structured → personalized → alive

### Phase 4: Integration & Wiring

- Wire restore-preview into `OSSetupExperience.tsx` and orchestration DAG
- Wire deferred items from `skippedPhases` to completion center
- Wire reflection copy into ArrivalPrepStep, LearningPanel, AdvisorActivationStep, FirstWinSetupStep
- Wire confidence indicator into PhaseProgressRail
- Wire chapter transitions between phase groups in `goNext`
- Add "Why recommended" reasoning to recommendation components
- Update barrel exports in `setup/index.ts`
- Verify TypeScript compilation

---

## Files

| File | Action |
|------|--------|
| `src/lib/setup/emotional-arc.ts` | New |
| `src/lib/setup/reflection-copy.ts` | New |
| `src/components/sita/onboarding/RestorePreviewStep.tsx` | New |
| `src/components/sita/setup/DeferredCompletionCenter.tsx` | New |
| `src/components/sita/setup/SignatureWowMoment.tsx` | New |
| `src/components/sita/setup/ChapterTransition.tsx` | New |
| `src/components/sita/setup/ConfidenceIndicator.tsx` | New |
| `src/components/sita/setup/AmbientFormationCanvas.tsx` | Update |
| `src/components/sita/setup/index.ts` | Update |
| `src/components/sita/OSSetupExperience.tsx` | Update |
| `src/components/sita/PostArrivalDesktop.tsx` | Update |
| `src/components/sita/onboarding/DeviceReadinessStep.tsx` | Update |
| `src/components/sita/onboarding/AdvisorActivationStep.tsx` | Update |
| `src/components/sita/onboarding/FirstWinSetupStep.tsx` | Update |
| `src/components/sita/onboarding/ArrivalPrepStep.tsx` | Update |
| `src/components/sita/onboarding/LearningPanel.tsx` | Update |
| `src/packages/contracts/specialized/setup-orchestration.ts` | Update |
| `src/lib/engines/setup-phase-definitions.ts` | Update |

## Order
1. Foundational modules (emotional-arc, reflection-copy)
2. New screens (RestorePreview, DeferredCompletionCenter)
3. Wow components (SignatureWowMoment, ChapterTransition, ConfidenceIndicator)
4. Enhanced existing (AmbientFormationCanvas, DeviceReadinessStep)
5. Full wiring into OSSetupExperience + PostArrivalDesktop
6. Recommendation reasoning layer
7. Barrel exports + TypeScript verification

