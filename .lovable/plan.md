

# SITA OS — Full Spec Compliance Audit & Gap Implementation Plan

## Audit: Spec Screens vs Current Implementation

| Spec Screen | Maps To | Status |
|---|---|---|
| P1 — Transition into Personalization ("Let's shape this around you") | No dedicated screen. Jump straight from privacy → quick-identity. | **MISSING** |
| P2 — Setup Depth Selection | `SetupStyleChooser` (express/guided/advanced) | Done |
| P3 — Current-Life Snapshot (5 questions) | `QuickIdentityStep` (5-question progressive) | Done |
| P4 — Life Stage / Operating Context | `OperatingContextStep` (4 options) | Done — but missing 3 options from spec: "Maintaining what already works", "A transition period", "Not sure / mixed". Also missing follow-up "What would feel most helpful?" |
| P5 — Life Rhythm Discovery | `LifeRhythmStep` | Done |
| P6 — Cognitive Load / Stress Mapping | `StressSlippageStep` with recovery UX | Done |
| P7 — Household Context | `DeepWorldModelingStep` household chapter + `HouseholdGraphStep` | Done |
| P8 — Work / Business Context | `DeepWorldModelingStep` work chapter | Done |
| P9 — Money Context | `DeepWorldModelingStep` money chapter | Done |
| P10 — Communications Context | `CommunicationsContextStep` | Done |
| P11 — Planning Style | `PlanningStyleStep` | Done |
| P12 — Relationship & People Mapping | `HouseholdGraphStep` + `RelationshipSensitivityStep` | Done |
| P13 — Support Style & Presence | `PresenceStyleStep` + `InterruptionStyleStep` + `ExplanationStyleStep` | Done |
| P14 — Trust & Autonomy Calibration | `TrustCalibrationStep` (5-level ladder, thresholds) | Done |
| P15 — Advisors & Support Team | `AdvisorActivationStep` | Done |
| P16 — Connect What Matters First | `FirstConnectionsStep` | Done |
| P17 — First Win Recommendation | `FirstWinSetupStep` | Done |
| P18 — Environment Is Ready | `EnvironmentSummaryStep` + `ArrivalPrepStep` | Done |

## Previous 10 Requirements — Verification

| # | Requirement | Status |
|---|---|---|
| 1 | Confidence + "still learning" | **Done** — LearningPanel + EnvironmentSummaryStep |
| 2 | Operating context | **Done** — OperatingContextStep (needs options expansion) |
| 3 | Stress → desktop density | **Done** — `computeDesktopDensity()` |
| 4 | Time horizon | **Done** — LifeRhythmStep |
| 5 | Relationship sensitivity | **Done** — RelationshipSensitivityStep |
| 6 | Recovery/forgiveness UX | **Done** — StressSlippageStep + EnvironmentSummaryStep |
| 7 | Adaptive depth | **Done** — SetupStyleChooser |
| 8 | "Show what changes" previews | **Done** — LifeRhythmStep, PlanningStyleStep, CommunicationsContextStep, ExplanationStyleStep |
| 9 | Post-onboarding refinement plan | **Done** — ArrivalPrepStep learning roadmap |
| 10 | First-week calibration loop | **Done** — FirstWeekCalibration.tsx + calibration_checkpoints table |

## Gaps Identified

### Gap 1: Missing Screen P1 — Personalization Pivot Screen
The spec requires a dedicated emotional transition screen ("Let's shape this around you") between privacy/memory-consent and quick-identity. This is the emotional mode shift from "We're preparing your system" to "Now let's shape your environment around you." Currently the flow jumps directly to QuickIdentityStep.

**Fix:** Create `PersonalizationPivotStep.tsx` — a calm, cinematic transition screen with title "Let's shape this around you", ambient preview evolution, and secondary CTAs for "I'd like a faster setup" / "I want the deeper setup". Wire as new phase `personalization-pivot` between `memory-consent` and `quick-identity`.

### Gap 2: OperatingContextStep Missing Options
Spec defines 7 options but only 4 exist. Missing: "Maintaining what already works", "A transition period", "Not sure / mixed". Also missing the follow-up question "What would feel most helpful right now?" (Stability, Clarity, Follow-through, Less stress, Better visibility, Better planning, More consistency).

**Fix:** Add 3 missing options + add `supportNeedPrimary` follow-up question to OperatingContextStep. Add `supportNeedPrimary` to SetupData and persist it.

### Gap 3: Data Model Completeness (Part 5)
The spec defines 16 data models (A through P). Most are covered, but some fields are missing:
- `onboardingSession.confidenceSummary` — not tracked
- `currentOperatingContext.currentPressureMode` — partially covered by stress map
- `supportStyleProfile.notificationDensityPreference` — not explicitly captured
- `moneyProfile.thresholdPreferences` — partially in trustCalibration
- `communicationProfile.messageLoadSensitivity` — not captured
- `environmentShapingProfile.preferredShellMode` — not captured
- `confidenceMetadata` per domain — computed at render time but not persisted

**Fix:** These are mostly cosmetic gaps — the data is either inferred from existing fields or would require new questions that overlap with existing ones. The main actionable gap is persisting `confidenceMetadata` per domain to `user_memory`. Add this to `finishSetup()`.

### Gap 4: Wow Moment Choreography (Spec Part 6) — Not fully integrated
Most wow moments exist conceptually but lack explicit choreography hooks:
- Wow 3 (support map forms) — StressSlippageStep has the load visualization
- Wow 4 (relationship graph) — HouseholdGraphStep has the graph
- Wow 5 (trust spectrum) — TrustCalibrationStep has behavioral previews
- Missing: Wow 1 (personalization pivot ambient shift) — needs the P1 screen
- Missing: Wow 9 (environment reveal) — EnvironmentSummaryStep exists but could be more cinematic

**Fix:** Wow 1 is solved by Gap 1. Wow 9 enhancement is polish — the current EnvironmentSummaryStep already shows all domains, advisors, trust mode, and confidence. Acceptable as-is.

### Gap 5: FirstWeekCalibration not wired into the desktop
`FirstWeekCalibration.tsx` exists but is never rendered anywhere in the app shell/desktop.

**Fix:** Add `<FirstWeekCalibration />` to the main desktop layout component so it appears after onboarding completion.

## Implementation Plan

### 1. Create PersonalizationPivotStep (Screen P1)
New file: `src/components/sita/onboarding/PersonalizationPivotStep.tsx`
- Title: "Let's shape this around you"
- Subtitle: "We'll start with what matters most right now — and refine as SITA learns with you"
- Ambient preview showing labels fading in: "Your priorities", "Your support style", "Your active domains", "Your advisors"
- CTAs: Continue, "I'd like a faster setup", "I want the deeper setup"
- Wire as `personalization-pivot` phase in DAG (order 9.8, after memory-consent, before quick-identity)
- Add to SetupPhaseId type and phase definitions

### 2. Expand OperatingContextStep
- Add 3 missing options: "Maintaining what already works", "A transition period", "Not sure / mixed"
- Add follow-up question: "What would feel most helpful right now?" with 7 chip options
- Add `supportNeedPrimary: string` to SetupData
- Persist to user_memory

### 3. Persist domain confidence metadata
- In `finishSetup()`, compute and persist `domain_confidence` to user_memory as a map of domain → { confidence, source, editableLater }

### 4. Wire FirstWeekCalibration into desktop
- Find the main desktop/shell layout component and add `<FirstWeekCalibration />`

### 5. Minor: reflection copy for new supportNeedPrimary
- Add reflection copy for the new supportNeedPrimary field

### Files Created
- `src/components/sita/onboarding/PersonalizationPivotStep.tsx`

### Files Modified
- `src/components/sita/onboarding/OperatingContextStep.tsx` — add options + follow-up
- `src/components/sita/OSSetupExperience.tsx` — add phase, import, state field, renderer, persistence
- `src/packages/contracts/specialized/setup-orchestration.ts` — add `personalization-pivot` to SetupPhaseId
- `src/lib/engines/setup-phase-definitions.ts` — add phase definition
- `src/lib/setup/reflection-copy.ts` — add supportNeedPrimary reflections
- Desktop shell component — add FirstWeekCalibration render

