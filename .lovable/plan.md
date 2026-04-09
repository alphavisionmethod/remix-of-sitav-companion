

# SITA OS — Personalization Gap Audit & Implementation Plan

## Gap Analysis: 10 Requirements vs Current Implementation

| # | Requirement | Status | Detail |
|---|---|---|---|
| 1 | Confidence + uncertainty per domain | **MISSING** | `world-model-field-meta.ts` has per-field confidence types, but the onboarding UI never shows "still learning" language or per-domain confidence indicators. No "refine anytime" messaging. |
| 2 | Life stage / operating context detection | **MISSING** | No step asks "rebuilding, scaling, managing complexity, or trying to feel in control." `primaryUseMode` only captures personal/family/business/money/full. |
| 3 | Emotional load / cognitive style | **PARTIAL** | `StressSlippageStep` has "too much to track / decisions / messages / moving parts" — this maps directly to cognitive overload. But there's no follow-through: this data isn't used to adjust desktop density or advisor behavior visibility. |
| 4 | Time horizon preference | **IMPLEMENTED** | `LifeRhythmStep` has PLANNING_HORIZONS: today / this week / this month / longer-term. Persisted as `life_rhythm.planningHorizon`. |
| 5 | Relationship sensitivity model | **MISSING** | No question asking "Should SITA help keep up with people or focus on tasks?" `HouseholdGraphStep` captures people but not the sensitivity preference. |
| 6 | Recovery / forgiveness UX | **MISSING** | No adaptive tone when user signals overwhelm. If stress map shows high load, the flow doesn't soften copy or shift to restorative messaging. |
| 7 | Adaptive onboarding depth | **IMPLEMENTED** | `SetupStyleChooser` offers Express (~5min) / Guided (~10min) / Advanced (~15min) with branch conditions in the DAG. |
| 8 | "Show me what this changes" previews | **PARTIAL** | `LearningPanel` sidebar shows live advisor/trust/priority updates. Some steps have inline previews (stress load map, trust ladder). But most steps (life rhythm, planning style, comms context) have NO "this changes X on your desktop" preview. |
| 9 | Post-onboarding refinement plan | **MISSING** | `EnvironmentSummaryStep` and `ArrivalPrepStep` show deferred items but no explicit "what SITA will keep learning" section or refinement roadmap. |
| 10 | First-week calibration loop | **MISSING** | No day-1 pulse, day-3 refinement, or week-1 reset system. No "is this helping the right way?" check. |

## Implementation Plan

### Phase 1: New onboarding step — OperatingContextStep (Req #2)
- New file: `src/components/sita/onboarding/OperatingContextStep.tsx`
- 4 options: "Rebuilding structure", "Scaling something", "Managing complexity", "Trying to feel more in control"
- Add to `SetupData` as `operatingContext: string`
- Wire into OSSetupExperience after `quick-identity` phase
- Persist to `user_memory` as `operating_context`

### Phase 2: New step — RelationshipSensitivityStep (Req #5)
- New file: `src/components/sita/onboarding/RelationshipSensitivityStep.tsx`
- Binary choice: "Help me keep up with important people" vs "Focus mostly on tasks and commitments"
- Add `relationshipFocus: "people" | "tasks" | ""` to `SetupData`
- Wire after `household-graph` phase

### Phase 3: Add confidence indicators to EnvironmentSummaryStep (Req #1)
- Add per-domain confidence badges ("High confidence" / "Still learning") based on how many questions were answered for each domain
- Add "You can refine this anytime in Settings → Personalization" message
- Add "still learning" language to `LearningPanel` sidebar

### Phase 4: Recovery/forgiveness adaptive tone (Req #6)
- In `StressSlippageStep`, if 4+ items selected, show compassionate transition copy
- In `EnvironmentSummaryStep`, if stress is high, use restorative framing: "SITA is here to help you recover, not add more"
- Adjust `LearningPanel` reflections to include recovery-aware copy

### Phase 5: Enhanced "show what changes" previews (Req #8)
- Add small preview cards to `LifeRhythmStep`, `PlanningStyleStep`, `CommunicationsContextStep`, and `ExplanationStyleStep` showing: "This will change: [boardroom density / notification frequency / daily summary style]"
- Reuse the existing inline preview pattern from `StressSlippageStep`

### Phase 6: Post-onboarding refinement plan (Req #9)
- Add "What SITA will keep learning" section to `ArrivalPrepStep`:
  - "Your communication patterns — over the next week"
  - "Your schedule rhythm — over the next month"
  - "Your spending patterns — as data connects"
  - "Your priorities — refined every boardroom session"
- Add "Refine anytime" link to Settings

### Phase 7: First-week calibration loop (Req #10)
- New file: `src/components/sita/FirstWeekCalibration.tsx` — banner component shown on desktop
- New Supabase table: `calibration_checkpoints` (user_id, checkpoint_key, triggered_at, response, dismissed)
- Schedule logic:
  - Day 1: "How was your first pulse?" 
  - Day 3: "Is SITA helping with the right things?"
  - Day 7: "Weekly reset — refine your support style"
- Show as gentle banner/card on desktop, dismissible, responses update `user_memory`

### Phase 8: Stress-to-desktop density wiring (Req #3 completion)
- Use `stressMap.heavierThanShould` length + `operatingContext` to compute a `desktopDensity` preference (calm/balanced/dense)
- Persist to `user_memory` as `desktop_density`
- Reference this in boardroom and desktop layout components

### Database Migration
- Add `calibration_checkpoints` table with RLS
- No changes to existing tables needed — all other data fits in `user_memory`

### Files Modified
- `src/components/sita/OSSetupExperience.tsx` — add 2 new phases, update SetupData, wire persistence
- `src/components/sita/onboarding/EnvironmentSummaryStep.tsx` — add confidence indicators + refinement messaging
- `src/components/sita/onboarding/LearningPanel.tsx` — add "still learning" language
- `src/components/sita/onboarding/StressSlippageStep.tsx` — add recovery tone when overwhelmed
- `src/components/sita/onboarding/ArrivalPrepStep.tsx` — add learning roadmap section
- `src/components/sita/onboarding/LifeRhythmStep.tsx` — add "this changes" preview
- `src/components/sita/onboarding/PlanningStyleStep.tsx` — add "this changes" preview
- `src/components/sita/onboarding/CommunicationsContextStep.tsx` — add "this changes" preview

### Files Created
- `src/components/sita/onboarding/OperatingContextStep.tsx`
- `src/components/sita/onboarding/RelationshipSensitivityStep.tsx`
- `src/components/sita/FirstWeekCalibration.tsx`

