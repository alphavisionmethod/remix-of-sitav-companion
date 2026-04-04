

# Audit: Missing Setup Infrastructure — Reusable Components, Resilience Systems, Anti-Pattern Fixes

## Findings

### A. 30 Required Reusable Components — 0 exist as standalone components

All functionality currently lives inline inside each step component. None of the 30 named components from the spec exist as importable primitives. They need to be extracted/created in `src/components/sita/setup/` so every step can share them consistently.

### B. Reduced-Motion Support — Missing from ALL 17 onboarding step components

`prefers-reduced-motion` is respected in FirstBootScreen, LockScreen, WelcomeScreen, EnterpriseFlow, RestoreFlow — but **zero** of the onboarding steps (TrustCalibrationStep, AdvisorActivationStep, PrivacyTransparencyStep, QuickIdentityStep, DeepWorldModelingStep, PrimaryUseModeStep, FirstConnectionsStep, FirstWinSetupStep, ArrivalPrepStep, DesktopTransitionStep, CinematicIntro, SetupStyleChooser, WantLessOfStep, ProtectMostStep, ExplanationStyleStep, PresenceStyleStep, InterruptionStyleStep, RitualsStep, etc.) check for it.

### C. Setup Persistence/Checkpointing — Only exists for boot phase

Boot state persistence (`bootStatePersistence.ts`) handles the boot screen. But setup phase progress (which step the user is on, what they've filled in) is **not** persisted to sessionStorage or the orchestration engine's local snapshot. If the user reloads mid-setup, they restart from `welcome`.

### D. Anti-Pattern: `<select>` dropdowns in HouseholdGraphStep and NetworkSetupStep

The spec explicitly forbids "too many dropdowns." Two files use raw `<select>` elements.

### E. Missing family/shared path, managed device path, deferred completion center

No branching for family vs managed device setup paths beyond a single string field. No "deferred completion center" where users can return to finish skipped items.

---

## Plan

### Step 1: Create `src/components/sita/setup/` — 30 reusable primitives

Create a `setup/` folder with thin, composable components extracted from inline patterns. Each is 20–80 lines, purely presentational, accepting props and callbacks. Grouped by purpose:

**Shell & Layout (4 files)**
- `SetupShell.tsx` — fullscreen dark container with ambient glow, overflow scroll, reduced-motion-aware
- `SetupStageHeader.tsx` — title + subtitle + optional icon, consistent spacing
- `PremiumProgressRail.tsx` — the dot-stepper rail (extract from OSSetupExperience `PhaseProgressRail`)
- `AmbientFormationCanvas.tsx` — the ambient blur orbs background (extract from OSSetupExperience)

**Information & Trust (3 files)**
- `TrustInfoCard.tsx` — icon + title + description card with expandable detail section
- `AdvancedDetailsDisclosure.tsx` — collapsible "Fine-tune" / "Advanced" section with AnimatePresence
- `RecoveryStateCard.tsx` — shows recovery/resume state with action buttons

**Status & Preview (3 files)**
- `SystemStatusPreview.tsx` — miniature desktop preview widget (extract from ArrivalPrepStep)
- `StageTransitionController.tsx` — Back/Continue/Skip footer with canAdvance logic
- `SetupPersistenceManager.tsx` — hook/component that auto-persists setup state to sessionStorage every phase change

**Boot Phase Panels (5 files)**
- `NetworkSelectionPanel.tsx` — re-export/wrapper around NetworkSetupStep internals
- `UpdateProgressExperience.tsx` — animated progress for background update tasks
- `OwnershipModeSelector.tsx` — card selector for personal/family/work/managed (extract from DeviceOwnershipStep)
- `AccountPathChooser.tsx` — account path cards (extract from AccountEnvironmentStep)
- `RestorePreviewCard.tsx` — restore environment preview card

**Security Panels (3 files)**
- `AccessProtectionFlow.tsx` — password + biometric + recovery method flow (extract from AccessProtectionStep)
- `BiometricEnrollmentPanel.tsx` — biometric setup UI
- `RecoveryMethodCard.tsx` — recovery method selector card

**Privacy & Identity (4 files)**
- `PrivacyPermissionCards.tsx` — expandable permission card with toggle (extract from PrivacyTransparencyStep)
- `TransparencyPreviewCard.tsx` — proof model preview (extract from PrivacyTransparencyStep)
- `QuickIdentityCardStack.tsx` — progressive-reveal question cards (extract from QuickIdentityStep)
- `WorldModelConversationPanels.tsx` — collapsible domain chapter accordion (extract from DeepWorldModelingStep)

**Preview & Selection (4 files)**
- `LiveEnvironmentModelPreview.tsx` — animated world model side viz (extract from DeepWorldModelingStep)
- `UseModeSelectionCards.tsx` — 5 mode cards with glow selection (extract from PrimaryUseModeStep)
- `TrustLadderControl.tsx` — 5-level vertical trust ladder (extract from TrustCalibrationStep)
- `TrustWorkflowPreview.tsx` — Draft→Preview→Approval→Execute→Proof pipeline (extract from TrustCalibrationStep)

**Advisor & Connections (4 files)**
- `AdvisorActivationGrid.tsx` — advisor card grid (extract from AdvisorActivationStep)
- `AdvisorActivityControl.tsx` — quiet/normal/active selector per advisor
- `RecommendedConnectionsPanel.tsx` — sorted connection cards (extract from FirstConnectionsStep)
- `ConnectionValuePreviewCard.tsx` — post-connection value reveal

**Arrival (4 files)**
- `FirstWinRecommendationCard.tsx` — first-win option card with preview flow
- `SetupSummaryExperience.tsx` — full summary grid (extract from ArrivalPrepStep)
- `DesktopArrivalTransitionController.tsx` — orchestrated 10-stage transition (extract from DesktopTransitionStep)
- `WelcomeStateComposer.tsx` — welcome card + first priorities + advisor presence

### Step 2: Add reduced-motion support to all onboarding steps

Create a shared hook `useReducedMotion()` in `src/hooks/useReducedMotion.ts` that returns a boolean. Every onboarding step component imports it and:
- Disables spring animations (uses `duration: 0`)
- Removes decorative animated elements (glow pulses, floating orbs)
- Keeps functional transitions but instant

Update all 17+ onboarding step files to use this hook.

### Step 3: Setup state checkpointing & recovery

Create `src/components/sita/setup/setupStatePersistence.ts`:
- `persistSetupState(state: SetupData, phase: SetupPhaseId)` → writes to sessionStorage
- `loadPersistedSetupState()` → reads + validates + returns state + phase
- `clearPersistedSetupState()` → clears
- 5-minute staleness check (same pattern as boot persistence)

Wire into `OSSetupExperience.tsx`:
- On every `goNext`/`goPrev`, persist current state + phase
- On mount, check for persisted state; if found, show resume banner and restore
- On `finishSetup`, clear persisted state

### Step 4: Replace `<select>` dropdowns with chip/card selectors

- `HouseholdGraphStep.tsx` — replace `<select>` role picker with chip row
- `NetworkSetupStep.tsx` — replace EAP type `<select>` with styled card selector

### Step 5: Add deferred completion center

Create `src/components/sita/onboarding/LearnLaterHub.tsx` enhancement:
- Already exists but needs to show deferred connections, skipped phases, and incomplete setup items
- Wire `deferredConnections` and `skippedPhases` from setup state into it

### Step 6: Low-power / degraded-performance fallback

Add to `useReducedMotion` hook: also detect `navigator.deviceMemory < 4` or `navigator.hardwareConcurrency < 4` and auto-enable reduced mode. The `AmbientFormationCanvas` component skips blur orbs in this mode.

### Step 7: Wire reusable components into existing steps

Update each step component to import and use the new primitives instead of inline implementations. This is a refactor — no behavior changes, just extraction.

---

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `src/hooks/useReducedMotion.ts` | ~20 | Shared reduced-motion + low-perf detection hook |
| `src/components/sita/setup/SetupShell.tsx` | ~40 | Fullscreen dark setup container |
| `src/components/sita/setup/SetupStageHeader.tsx` | ~30 | Title + subtitle header |
| `src/components/sita/setup/PremiumProgressRail.tsx` | ~50 | Dot-stepper progress rail |
| `src/components/sita/setup/AmbientFormationCanvas.tsx` | ~35 | Ambient blur orbs background |
| `src/components/sita/setup/TrustInfoCard.tsx` | ~45 | Expandable info card |
| `src/components/sita/setup/AdvancedDetailsDisclosure.tsx` | ~40 | Collapsible advanced section |
| `src/components/sita/setup/RecoveryStateCard.tsx` | ~35 | Recovery/resume card |
| `src/components/sita/setup/SystemStatusPreview.tsx` | ~60 | Miniature desktop preview |
| `src/components/sita/setup/StageTransitionController.tsx` | ~50 | Back/Continue/Skip footer |
| `src/components/sita/setup/SetupPersistenceManager.ts` | ~60 | Setup state sessionStorage persistence |
| `src/components/sita/setup/NetworkSelectionPanel.tsx` | ~30 | Network UI wrapper |
| `src/components/sita/setup/UpdateProgressExperience.tsx` | ~40 | Background task progress |
| `src/components/sita/setup/OwnershipModeSelector.tsx` | ~40 | Personal/family/work cards |
| `src/components/sita/setup/AccountPathChooser.tsx` | ~40 | Account path cards |
| `src/components/sita/setup/RestorePreviewCard.tsx` | ~35 | Restore preview |
| `src/components/sita/setup/AccessProtectionFlow.tsx` | ~50 | Password + biometric flow |
| `src/components/sita/setup/BiometricEnrollmentPanel.tsx` | ~40 | Biometric enrollment UI |
| `src/components/sita/setup/RecoveryMethodCard.tsx` | ~35 | Recovery method selector |
| `src/components/sita/setup/PrivacyPermissionCards.tsx` | ~60 | Expandable permission cards |
| `src/components/sita/setup/TransparencyPreviewCard.tsx` | ~50 | Proof model preview |
| `src/components/sita/setup/QuickIdentityCardStack.tsx` | ~50 | Progressive-reveal cards |
| `src/components/sita/setup/WorldModelConversationPanels.tsx` | ~50 | Domain chapter accordion |
| `src/components/sita/setup/LiveEnvironmentModelPreview.tsx` | ~60 | Animated world model viz |
| `src/components/sita/setup/UseModeSelectionCards.tsx` | ~50 | Mode selection cards |
| `src/components/sita/setup/TrustLadderControl.tsx` | ~60 | 5-level trust ladder |
| `src/components/sita/setup/TrustWorkflowPreview.tsx` | ~50 | Workflow pipeline preview |
| `src/components/sita/setup/AdvisorActivationGrid.tsx` | ~50 | Advisor card grid |
| `src/components/sita/setup/AdvisorActivityControl.tsx` | ~35 | Quiet/normal/active selector |
| `src/components/sita/setup/RecommendedConnectionsPanel.tsx` | ~50 | Sorted connection cards |
| `src/components/sita/setup/ConnectionValuePreviewCard.tsx` | ~40 | Post-connection value reveal |
| `src/components/sita/setup/FirstWinRecommendationCard.tsx` | ~50 | First-win option card |
| `src/components/sita/setup/SetupSummaryExperience.tsx` | ~60 | Summary grid |
| `src/components/sita/setup/DesktopArrivalTransitionController.tsx` | ~50 | 10-stage transition |
| `src/components/sita/setup/WelcomeStateComposer.tsx` | ~50 | Welcome card + priorities |
| `src/components/sita/setup/index.ts` | ~35 | Barrel exports |

## Files Modified

| File | Change |
|------|--------|
| `src/components/sita/OSSetupExperience.tsx` | Import reusable components, wire persistence manager, use SetupShell/StageTransitionController |
| `src/components/sita/onboarding/TrustCalibrationStep.tsx` | Import useReducedMotion, use TrustLadderControl + TrustWorkflowPreview |
| `src/components/sita/onboarding/AdvisorActivationStep.tsx` | Import useReducedMotion, use AdvisorActivationGrid |
| `src/components/sita/onboarding/PrivacyTransparencyStep.tsx` | Import useReducedMotion, use PrivacyPermissionCards |
| `src/components/sita/onboarding/QuickIdentityStep.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/DeepWorldModelingStep.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/PrimaryUseModeStep.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/FirstConnectionsStep.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/FirstWinSetupStep.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/ArrivalPrepStep.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/DesktopTransitionStep.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/HouseholdGraphStep.tsx` | Replace `<select>` with chip selector |
| `src/components/sita/onboarding/NetworkSetupStep.tsx` | Replace `<select>` with styled cards |
| `src/components/sita/onboarding/CinematicIntro.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/WantLessOfStep.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/ProtectMostStep.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/ExplanationStyleStep.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/PresenceStyleStep.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/InterruptionStyleStep.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/RitualsStep.tsx` | Import useReducedMotion |
| `src/components/sita/onboarding/LearnLaterHub.tsx` | Accept deferred connections + skipped phases as props |

## Implementation Order

1. Create `useReducedMotion` hook
2. Create all 30 setup primitives + barrel export (parallel batch)
3. Wire reduced-motion into all 17 onboarding steps (parallel batch)
4. Create setup state persistence manager
5. Wire persistence into OSSetupExperience (checkpoint on phase change, restore on mount)
6. Replace `<select>` dropdowns in HouseholdGraphStep + NetworkSetupStep
7. Enhance LearnLaterHub with deferred items
8. Refactor step components to use new primitives
9. Verify with `tsc --noEmit`

