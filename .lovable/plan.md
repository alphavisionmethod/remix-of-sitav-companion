

# Wire 18 Unwired Onboarding Components to the Setup Flow

## Analysis

42 components exist in `src/components/sita/onboarding/`. Of those, **24 are already wired** into `OSSetupExperience.tsx`. The remaining **18 are built but disconnected**:

| # | Component | Phase ID to add | Insert after |
|---|---|---|---|
| 1 | `WantLessOfStep` | `want-less-of` | `quick-identity` |
| 2 | `ProtectMostStep` | `protect-most` | `want-less-of` |
| 3 | `ExplanationStyleStep` | `explanation-style` | `planning-style` |
| 4 | `PresenceStyleStep` | `presence-style` | `explanation-style` |
| 5 | `InterruptionStyleStep` | `interruption-style` | `presence-style` |
| 6 | `RitualsStep` | `rituals` | `interruption-style` |
| 7 | `HouseholdGraphStep` | `household-graph` | `deep-world-modeling` |
| 8 | `MemoryConsentStep` | `memory-consent` | `privacy-transparency` |
| 9 | `HomeCompositionStep` | `home-composition` | `rituals` |
| 10 | `DesktopPreviewStep` | `desktop-preview` | `home-composition` |
| 11 | `FirstSimulationStep` | `first-simulation` | `first-win-setup` |
| 12 | `FirstActionsStep` | `first-actions` | `first-simulation` |
| 13 | `RecoverFirstStep` | `recover-first` | `access-protection` |
| 14 | `CinematicIntro` | Replace/augment `boot` phase | Before `boot` |
| 15 | `RestorePreviewStep` | `restore-preview` | `account-environment` |
| 16 | `ContextualWelcomeTour` | Post-setup overlay | After `trust-certificate` |
| 17 | `LearnLaterHub` | Post-setup overlay | Accessible from desktop |
| 18 | `PreviewExampleModal` | Utility modal | Used within other steps |

**Notes:** `ContextualWelcomeTour`, `LearnLaterHub`, and `PreviewExampleModal` are not linear phases — they're overlays/modals. They'll be wired as post-setup and inline utilities respectively.

## Implementation (4 files)

### Step 1 — Expand `SetupPhaseId` type (setup-orchestration.ts)

Add 14 new phase IDs to the union type:
`"want-less-of"`, `"protect-most"`, `"explanation-style"`, `"presence-style"`, `"interruption-style"`, `"rituals"`, `"household-graph"`, `"memory-consent"`, `"home-composition"`, `"desktop-preview"`, `"first-simulation"`, `"first-actions"`, `"recover-first"`, `"restore-preview"`

### Step 2 — Add phase definitions (setup-phase-definitions.ts)

Add 14 new `SetupPhaseDefinition` entries with correct dependency chains, order numbers, and branch conditions (most are `guided`/`advanced` only). Re-number existing orders to accommodate insertions.

### Step 3 — Wire components in OSSetupExperience.tsx

- Add 14 new imports for the unwired step components
- Add state fields: `wantLessOf: string[]`, `protectMost: string[]`, `explanationStyle: string`, `presenceStyle: string`, `interruptionStyle: string`, `rituals: string[]`, `householdGraph: HouseholdNode[]`, `memoryConsent: string`, `homeComposition: string`, `recoverFirst: string`
- Add 14 new `{phase === "..." && <Component />}` render blocks inside the `AnimatePresence`
- Wire `CinematicIntro` as a pre-boot fullscreen phase
- Wire `RestorePreviewStep` after `account-environment` (when restore path is chosen)
- Wire `ContextualWelcomeTour` as a post-completion overlay triggered after `finishSetup`
- Add `canAdvance` cases for new required phases
- Persist new state fields in `finishSetup` memory items

### Step 4 — Wire post-setup utilities

- `LearnLaterHub`: Import and render as an accessible panel from the desktop (add to `DesktopSurface.tsx` or as a route `/learn-later`)
- `PreviewExampleModal`: Import inside steps that reference it (e.g., `FirstSimulationStep`, `DesktopPreviewStep`) as an on-demand modal

## Files Modified

| File | Change |
|---|---|
| `src/packages/contracts/specialized/setup-orchestration.ts` | Add 14 phase IDs to `SetupPhaseId` union |
| `src/lib/engines/setup-phase-definitions.ts` | Add 14 phase definitions, re-order existing |
| `src/components/sita/OSSetupExperience.tsx` | Import 18 components, add state fields, render blocks, validation, persistence |
| `src/App.tsx` | Add `/learn-later` route for LearnLaterHub |

## What Won't Change
- Individual component files (all 18 are already complete)
- Setup orchestration engine logic (it already handles dynamic phase lists)
- Existing 24 phases (they keep working, just get new neighbors)

