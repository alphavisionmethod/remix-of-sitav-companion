

# SITA OS — Full Implementation Audit & Enhancement Plan

## Audit Result: 30/32 Screens Implemented, 2 Gaps + 3 Enhancements

### What Is Fully Implemented (30 screens)

| Screen | Component | Status |
|--------|-----------|--------|
| S01 Boot | `FirstBootScreen` | Done |
| S02 Secure Init | `SecureFoundationStep` | Done |
| S03 Locale | `SetupLanguageRegion` | Done |
| S04 Network | `NetworkSetupStep` | Done |
| S05 Readiness | `DeviceReadinessStep` | Done |
| S06 Ownership | `DeviceOwnershipStep` | Done |
| S07 Account | `AccountEnvironmentStep` | Done |
| S08 Restore | `RestorePreviewStep` | Done |
| S09 Access | `AccessProtectionStep` | Done |
| S10 Privacy | `PrivacyTransparencyStep` | Done |
| S11 Pivot | `PersonalizationPivotStep` | Done |
| S12 Depth | `SetupStyleChooser` | Done |
| S13 Snapshot | `QuickIdentityStep` | Done |
| S14 Context | `OperatingContextStep` (7 options + follow-up) | Done |
| S15 Rhythm | `LifeRhythmStep` | Done |
| S16 Stress | `StressSlippageStep` | Done |
| S17 Household | `DeepWorldModelingStep` + `HouseholdGraphStep` | Done |
| S18 Work | `DeepWorldModelingStep` work chapter | Done |
| S19 Money | `DeepWorldModelingStep` money chapter | Done |
| S20 Comms | `CommunicationsContextStep` | Done |
| S21 Planning | `PlanningStyleStep` | Done |
| S22 People | `HouseholdGraphStep` + `RelationshipSensitivityStep` | Done |
| S23 Support | `PresenceStyleStep` + `InterruptionStyleStep` + `ExplanationStyleStep` | Done |
| S24 Trust | `TrustCalibrationStep` | Done |
| S25 Advisors | `AdvisorActivationStep` | Done |
| S26 Connections | `FirstConnectionsStep` | Done |
| S27 First Win | `FirstWinSetupStep` | Done |
| S28 Summary | `EnvironmentSummaryStep` | Done |
| S29 Arrival | `DesktopTransitionStep` | Done |
| S32 Calibration | `FirstWeekCalibration` (wired in DesktopPage) | Done |

### Also Verified
- **DAG**: 38 phases, all wired with dependencies and branch conditions
- **Branching**: Express/Guided/Advanced via `setupStyleCondition`
- **Data persistence**: 35+ fields → `user_memory`, domain confidence, desktop density
- **Reflection copy**: All contexts covered
- **LearningPanel**: Live with domain confidence badges + reflections
- **Background tasks**: 14 task factories for hardware, network, connectors, system checks
- **FirstWinActivation page**: Post-onboarding route at `/first-win`
- **LearnLaterPage**: Post-onboarding route at `/learn-later` with `LearnLaterHub`

---

## Gaps Found

### Gap 1: S30 — First Desktop Welcome (ContextualWelcomeTour never rendered)
`ContextualWelcomeTour` is imported in `OSSetupExperience.tsx` (line 75) but `<ContextualWelcomeTour` is never rendered anywhere — not in OSSetupExperience, not in DesktopPage, not in FirstWinActivation. The component exists and works (145 lines, derives personalized tour steps from preferences), but the user never sees it.

**Fix**: Render `ContextualWelcomeTour` in `DesktopPage.tsx` after onboarding completes. Show it once on first desktop visit, driven by a `welcome_tour_shown` flag in `user_memory`. This covers the S30 "First Desktop Welcome" spec requirement.

### Gap 2: S31 — Deferred Completion Center not surfaced on desktop
`DeferredCompletionCenter` exists in `src/components/sita/setup/DeferredCompletionCenter.tsx` and `LearnLaterHub` exists at `/learn-later`, but neither is surfaced on the main desktop. Users who skip steps have no visible path back to complete them from the desktop itself.

**Fix**: Add a subtle deferred-items indicator to `DesktopPage.tsx` that appears when the user has deferred connections or skipped phases. Link to `/learn-later` or render inline. Query `user_memory` for `deferred_connections` on mount.

### Gap 3: CinematicIntro imported but never rendered
`CinematicIntro` (line 73) is imported but never used. Not a spec gap per se, but dead code.

**Fix**: Remove unused import (cleanup).

---

## Enhancements (not missing, but can be stronger)

### Enhancement 1: LearningPanel doesn't show all data fields
The LearningPanel reads `enabledDomains`, `trustLevel`, `painPoints`, `protectionPriorities`, `presenceStyle`, `rituals`, `homeComposition` — but does NOT reflect: `operatingContext`, `supportNeedPrimary`, `relationshipFocus`, `lifeRhythm`, `stressMap`, `commsContext`, `planningStyle`, or `desktopDensity`. These are all available on the `state` object but unused.

**Fix**: Expand LearningPanel's `SetupSnapshot` interface to include the new fields and display them as live insights (operating context, rhythm, stress load, communication style, desktop density).

### Enhancement 2: Missing "You can change this later" copy on several steps
The spec requires every major section to reinforce "You can refine this anytime." Currently only `OperatingContextStep` and `EnvironmentSummaryStep` have this. Missing from: `TrustCalibrationStep`, `AdvisorActivationStep`, `PresenceStyleStep`, `PlanningStyleStep`.

**Fix**: Add a small `<p>` tag with "You can refine this anytime in Settings" to 4 steps.

### Enhancement 3: Sensitive-answer skip affordance
The spec says some areas should be "skippable and clearly private" with a sensitive marker. Currently every non-required step can be skipped via the `canSkipCurrent` logic, but there's no visible "This is private — skip if you prefer" indicator on sensitive steps (stress, money, household).

**Fix**: Add a subtle privacy indicator to `StressSlippageStep`, money chapter in `DeepWorldModelingStep`, and `HouseholdGraphStep`.

---

## Implementation Summary

### Files to modify
1. **`src/pages/DesktopPage.tsx`** — Add ContextualWelcomeTour (first visit only) + deferred items indicator
2. **`src/components/sita/onboarding/LearningPanel.tsx`** — Expand SetupSnapshot to show operatingContext, lifeRhythm, stressMap, commsContext, planningStyle, desktopDensity
3. **`src/components/sita/onboarding/TrustCalibrationStep.tsx`** — Add "refine later" copy
4. **`src/components/sita/onboarding/AdvisorActivationStep.tsx`** — Add "refine later" copy
5. **`src/components/sita/onboarding/PresenceStyleStep.tsx`** — Add "refine later" copy + privacy note
6. **`src/components/sita/onboarding/PlanningStyleStep.tsx`** — Add "refine later" copy
7. **`src/components/sita/onboarding/StressSlippageStep.tsx`** — Add "private, skip if you prefer" indicator
8. **`src/components/sita/OSSetupExperience.tsx`** — Remove unused CinematicIntro import

### No new files needed
All components already exist. This is purely wiring and enhancement.

### No database changes needed
Query existing `user_memory` for `deferred_connections` and `welcome_tour_shown`.

