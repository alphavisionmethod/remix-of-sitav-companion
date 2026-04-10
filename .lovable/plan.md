

# Implementation Plan: Parts 3–7 Completion

## Gaps Found

### Part 3 — Branching Rules (4 gaps)

**Gap 1: Quick path missing S14 + S26**
`operating-context` (S14) and `first-connections` (S26) are gated by `setupStyleCondition(["guided", "advanced"])`, so the express/quick path skips them. Spec says quick path includes both.

Fix: Change both to use OR-group: show when style is guided/advanced OR always on express (make them `required: true`, OR add `setupStyleCondition(["express", "guided", "advanced"])` which is effectively "always").

**Gap 2: Domain filtering inside DeepWorldModelingStep**
The component shows ALL 6 domain chapters to everyone. On quick path, spec says "one most relevant domain screen." The component doesn't receive setupStyle or domain-relevance data to filter chapters.

Fix: Pass `setupStyle` and `enabledDomains`/`focusAreas` to `DeepWorldModelingStep`. When express, auto-expand only the most relevant chapter and collapse others with "Skip" affordance. When guided, show relevant domains. When advanced, show all.

**Gap 3: Communications auto-includes when work is active**
The `domain:communications` evaluator checks for comms-specific keywords but does NOT check if the work domain is active (spec: "Communications path if replies/follow-up/messages selected **or work path active**").

Fix: Update `domain:communications` evaluator to also return true when `domain:work` evaluator passes.

**Gap 4: Tone context not passed to step components**
`toneContext` is computed in `OSSetupExperience` and shows a calm-mode banner, but no step component receives it. Copy density, tone class, and first-win recommendation filtering based on overwhelm status are not implemented.

Fix: Pass `toneContext` to step components that should adapt (QuickIdentityStep, StressSlippageStep, FirstWinSetupStep, EnvironmentSummaryStep). Add `toneClass` prop to these components and conditionally render shorter descriptions when `copyDensity === "light"`.

### Part 5 — Trust Initialization (1 gap)

**Gap 5: Missing trust-derived data persistence**
`finishSetup` saves `trust_calibration` but does NOT derive and persist:
- `approval_pathways` (which domains need approval at which trust level)
- `proof_expectations` (what proof is generated/required)
- `automation_boundaries` (what SITA can do autonomously)

Fix: Add a `computeTrustDerivedSettings()` function that derives these three objects from `trustCalibration` data and persist them as additional `user_memory` entries.

### Part 4 — Component Audit

Most "missing" component names from the spec are conceptual — they're embedded as sections within larger step components. This is acceptable architecture. No new standalone components needed.

---

## Files to Modify

1. **`src/lib/engines/setup-phase-definitions.ts`**
   - Change `operating-context` to use `setupStyleCondition(["express", "guided", "advanced"])` (always included)
   - Change `first-connections` to use `setupStyleCondition(["express", "guided", "advanced"])`

2. **`src/lib/engines/setup-orchestration-engine.ts`**
   - Add `style:express,guided,advanced` evaluator (already registered — verify)
   - Update `domain:communications` evaluator to also trigger when work domain is active

3. **`src/components/sita/onboarding/DeepWorldModelingStep.tsx`**
   - Accept `setupStyle` and `relevantDomains` props
   - Filter visible chapters: express → most relevant only, guided → relevant, advanced → all
   - Add reduced copy mode for overwhelmed users

4. **`src/components/sita/OSSetupExperience.tsx`**
   - Pass `setupStyle` and computed `relevantDomains` to `DeepWorldModelingStep`
   - Pass `toneContext` to `QuickIdentityStep`, `StressSlippageStep`, `FirstWinSetupStep`, `EnvironmentSummaryStep`
   - Add `computeTrustDerivedSettings()` to `finishSetup` and persist 3 new user_memory entries

5. **`src/components/sita/onboarding/FirstWinSetupStep.tsx`**
   - Accept optional `toneClass` prop
   - When calm mode, prioritize restorative first-win recommendations

6. **`src/components/sita/onboarding/EnvironmentSummaryStep.tsx`**
   - Accept optional `copyDensity` prop
   - When light, show compact summary variant

## No Database Changes Needed
All new data persists via existing `user_memory` table with new keys.

