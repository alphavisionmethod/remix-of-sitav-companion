

# SITA OS — Setup Flow Audit & Fix Plan

## Critical Issues Found

### 1. DUPLICATE FLOW — Two Parallel Tracks Never Merged (BREAKING)

After the deep personalization ceremony (boot → secure-foundation → ... → advisor-activation → environment-summary), the user enters the **old onboarding track**: welcome → cinematic-intro → setup-style → identity → domains → trust → explanation-style → etc. This means:

- User enters their name/role TWICE (quick-identity AND identity)
- User sets trust TWICE (trust-calibration AND trust)
- User picks domains TWICE (primary-use-mode AND domains)
- The full flow is ~45+ screens instead of ~29

The phase ordering by `order` field creates this path:
```text
boot(0) → secure-foundation(0.5) → ... → advisor-activation(5.6) → environment-summary(5.65)
→ welcome(6) → cinematic-intro(4*) → setup-style(5*) → identity(6*) → domains(9) → trust(10) → ...
→ arrival-prep(25) → desktop-transition(25.5) → system-check(26) → trust-certificate(27)

* dependency-gated, not purely order-gated — but they chain after welcome
```

**Fix**: The old track (welcome → cinematic-intro → setup-style → identity → want-less-of → protect-most → domains → trust → explanation-style → ai-personality → interruption-style → rituals → appearance → household-graph → memory-consent → home-composition → desktop-preview → first-simulation → first-actions → recover-first) should be **removed or collapsed** into the new track. The environment-summary should flow directly into first-connections → first-win-setup → arrival-prep → desktop-transition → system-check → trust-certificate.

**Concrete changes**:
- Remove the old phases from `SETUP_PHASE_DEFINITIONS`: `welcome`, `restore`, `enterprise`, `cinematic-intro`, `setup-style`, `identity`, `want-less-of`, `protect-most`, `domains`, `trust`, `explanation-style`, `presence-style`, `ai-personality`, `interruption-style`, `rituals`, `appearance`, `household-graph`, `memory-consent`, `home-composition`, `desktop-preview`, `first-simulation`, `first-actions`, `recover-first`
- Remove matching `SetupPhaseId` entries from the type union
- Remove render cases from `OSSetupExperience.tsx`
- Move essential data collection into the new track:
  - Name/role: already in `quick-identity`
  - Domains: already in `primary-use-mode`
  - Trust: already in `trust-calibration`
  - Setup style (express/guided/advanced): move to after `account-environment` (before privacy-transparency)
  - Appearance (theme/accent): fold into environment-summary or arrival-prep
- Update `first-connections` and `first-win-setup` dependencies to chain after `environment-summary`
- Update `arrival-prep` dependencies to chain after `first-win-setup`

### 2. `first-win-setup` Unreachable in Express Mode

`first-win-setup` depends on `first-connections`, which has `branchConditions: [setupStyleCondition(["guided", "advanced"])]`. In express mode, `first-connections` is excluded → its dependency never resolves → `first-win-setup` can never be entered.

**Fix**: Make `first-win-setup` depend on `environment-summary` instead of `first-connections`. Make `first-connections` optional but not blocking for first-win.

### 3. `arrival-prep` Has Empty Dependencies

`dependencies: []` means `canEnterPhase` always returns true. It relies on a custom `canStartArrivalPrep()` check in `advanceToNextPhase()`, but this is fragile — if a user navigates manually, they could enter it prematurely.

**Fix**: Set dependencies to `["first-win-setup"]` so it naturally chains after first-win.

### 4. `restore` and `enterprise` Order Conflicts

`restore` has `order: 2` and `enterprise` has `order: 3`, but they depend on `welcome` (order 6). The dependency system prevents them from activating early, but their low order numbers mean `getActivePhaseIds()` returns them in wrong positions. Not breaking but messy.

**Fix**: Remove these phases entirely (see #1). Account recovery is already handled in `account-environment`.

### 5. Learning Panel Shows on Wrong Phases

The `showLearningPanel` exclusion list is a hardcoded array of phase IDs. Any new phases added aren't excluded, meaning the learning panel shows on phases where it shouldn't (e.g., environment-summary during the cinematic arrival sequence).

**Fix**: After removing old phases, simplify to show learning panel only on `steppable` phases (those with `excludedFromSteps: false`).

### 6. Session Progress Bar Shows on Wrong Phases

Same hardcoded exclusion list issue on line 761.

**Fix**: Same approach — use a computed condition instead of hardcoded IDs.

### 7. `canAdvance()` Missing Validation for Many Phases

The `canAdvance` function only checks a few phases (identity, domains, primary-use-mode, trust-calibration, advisor-activation, first-win-setup). All other phases return `true` — users can click Continue without making any selection.

**Fix**: Add validation for key phases: device-ownership (must select), access-protection (handled internally), planning-style, stress-slippage, etc.

## Implementation Steps

| # | Task | Files Changed |
|---|------|--------------|
| 1 | Remove old duplicate phases from type, definitions, and render | `setup-orchestration.ts`, `setup-phase-definitions.ts`, `OSSetupExperience.tsx` |
| 2 | Move setup-style selection to after account-environment | `setup-phase-definitions.ts` |
| 3 | Re-wire first-connections → first-win-setup → arrival-prep dependency chain | `setup-phase-definitions.ts` |
| 4 | Fix `arrival-prep` dependencies | `setup-phase-definitions.ts` |
| 5 | Replace hardcoded phase exclusion lists with computed conditions | `OSSetupExperience.tsx` |
| 6 | Add missing `canAdvance` validations | `OSSetupExperience.tsx` |
| 7 | Clean up unused imports and dead component references | `OSSetupExperience.tsx` |

**Result**: The flow becomes a clean 19-phase journey:
```text
boot → secure-foundation → language-region → network-setup → device-readiness
→ device-ownership → account-environment → setup-style → access-protection
→ privacy-transparency → quick-identity → deep-world-modeling
→ [life-rhythm, stress-slippage, communications-context, planning-style]
→ primary-use-mode → trust-calibration → advisor-activation → environment-summary
→ first-connections → first-win-setup → arrival-prep → desktop-transition
→ system-check → trust-certificate
```

**Total: ~3 files modified. No new files. No migration needed.**

