

# Align Setup Flow to 19-Screen Spec

## Current State vs Spec

| Spec Screen | Phase ID | Status |
|---|---|---|
| 1. Boot Awakening | `boot` | Exists — has hardware detect + secure init combined |
| 2. Secure Foundation | — | **Missing as standalone phase** (buried inside FirstBootScreen's `SECURE_INIT` sub-phase) |
| 3. Language, Region, Input | — | **Component exists** (`SetupLanguageRegion.tsx`) but **not wired into DAG** |
| 4. Network Setup | `network-setup` | Exists |
| 5. Updates & Readiness | `device-readiness` | Exists |
| 6. Device Ownership | `device-ownership` | Exists |
| 7. Account / Restore / New | `account-environment` | Exists |
| 8. Restore Preview | `restore` | Exists but basic — needs "Restore this environment" card UI per spec |
| 9. Access Protection | `access-protection` | Exists |
| 10. Privacy & Transparency | `privacy-transparency` | Exists |
| 11. Quick Identity | `quick-identity` | Exists |
| 12. Deep World Modeling | `deep-world-modeling` | Exists |
| 13. Primary Use Mode | `primary-use-mode` | Exists |
| 14. Trust Calibration | `trust-calibration` | Exists |
| 15. Advisor Activation | `advisor-activation` | Exists |
| 16. First Connections | `first-connections` | Exists |
| 17. First Win Setup | `first-win-setup` | Exists |
| 18. Arrival Preparation | `arrival-prep` | Exists |
| 19. Desktop Transition | `desktop-transition` | Exists |

**Also in DAG but NOT in spec's 19 screens:** `welcome`, `cinematic-intro`, `setup-style`, `identity`, `want-less-of`, `protect-most`, `domains`, `trust`, `explanation-style`, `presence-style`, `ai-personality`, `interruption-style`, `rituals`, `appearance`, `household-graph`, `memory-consent`, `home-composition`, `desktop-preview`, `first-simulation`, `first-actions`, `recover-first`, `system-check`, `trust-certificate`

These extra phases are the "post-welcome guided/advanced setup" — they fill in details after the spec's 19-screen core flow. They're not in the spec but they're valuable. The spec's 19 screens are the **core path**; the extras are branched detail phases.

## Gaps to Fix

### 1. Missing: Secure Foundation as standalone phase (Screen 2)
Currently `SecureInitCeremony` runs as a sub-phase inside `FirstBootScreen`. The spec wants it as its own screen with title "Securing your system", trust explainer card, and specific states (checking, encryption_preparing, integrity_verifying, recovery_preparing, ready, degraded, blocked).

**Action:** Create `SecureFoundationStep.tsx` — a standalone phase that wraps and elevates `SecureInitCeremony` with the spec's title, states, and fallback cards. Add `secure-foundation` to the DAG between `boot` and `language-region`.

### 2. Missing: Language/Region/Input wired into DAG (Screen 3)
`SetupLanguageRegion.tsx` exists but isn't in the phase definitions or rendered in `OSSetupExperience`. The spec wants it with title "Let's make this yours", live preview panel (clock, date, currency, greeting), autodetect, and "Use detected settings" CTA.

**Action:** Add `language-region` phase to contract + DAG (between `secure-foundation` and `network-setup`). Wire into `OSSetupExperience` render + state.

### 3. DAG order correction
The spec's 19-screen flow is linear: boot → secure-foundation → language-region → network → readiness → ownership → account → access-protection → privacy → quick-identity → world-modeling → primary-use-mode → trust-calibration → advisor-activation → first-connections → first-win → arrival → desktop-transition.

Current DAG puts `welcome` after `advisor-activation`, then branches to `cinematic-intro` → `setup-style` → `identity` etc. This is intentional — the spec's 19 screens are the boot-to-desktop core, and the extra phases are the detailed personalization.

**Issue:** The spec doesn't show `welcome`, `cinematic-intro`, or `setup-style` as standalone screens. The "welcome" screen (screen 7 in spec) is `account-environment`. The spec wants the flow to go directly from advisor-activation → first-connections without a welcome/cinematic/setup-style detour.

**Action:** Re-order DAG so the 19 core screens flow linearly. Move `welcome`/`cinematic-intro`/`setup-style` to BEFORE `identity`, and `identity`+ detail phases to between `advisor-activation` and `first-connections`. This preserves existing functionality while matching spec order.

### 4. Missing secondary/tertiary CTAs on several screens
Many screens are missing spec-required CTAs:
- Boot: missing "View accessibility options" as secondary CTA (it exists as component but needs exposure)
- Network: has "Continue with limited offline setup" ✓ but missing "Other network" / "Advanced setup"
- Device Ownership: missing "Learn what this changes" CTA
- All screens: missing consistent "Adjust later" pattern

**Action:** Add missing CTAs to each affected step component.

### 5. Missing global setup state tracking
Spec requires global states: `boot_preparing`, `machine_foundation_in_progress`, `user_setup_in_progress`, `restarting_for_continuation`, `resumed_from_restart`, `setup_ready_for_arrival`, `completed_with_deferred_items`.

**Action:** Add a `globalSetupState` field to the orchestration engine session, computed from phase progress. Surface in the UI via a status indicator.

### 6. Restore Preview needs spec-compliant UI (Screen 8)
Current `RestoreFlow` is functional but doesn't match spec: needs profile image, "Last used on...", restorable categories list, "Restore this environment" primary CTA, "Start fresh instead" secondary.

**Action:** Enhance `RestoreFlow` with spec-matching UI elements.

## Files to Create

| File | Purpose |
|---|---|
| `src/components/sita/onboarding/SecureFoundationStep.tsx` | Screen 2: standalone secure foundation phase (~200 lines) |

## Files to Modify

| File | Change |
|---|---|
| `src/packages/contracts/specialized/setup-orchestration.ts` | Add `secure-foundation` and `language-region` to `SetupPhaseId` |
| `src/lib/engines/setup-phase-definitions.ts` | Add 2 new phase definitions, re-order DAG: boot(0) → secure-foundation(0.5) → language-region(0.8) → network(1) |
| `src/components/sita/OSSetupExperience.tsx` | Wire `SecureFoundationStep` and `SetupLanguageRegion` into render + state; add them to exclusion lists |
| `src/components/sita/onboarding/DeviceOwnershipStep.tsx` | Add "Learn what this changes" secondary CTA |
| `src/components/sita/onboarding/NetworkSetupStep.tsx` | Add "Advanced setup" tertiary CTA |
| `src/components/sita/RestoreFlow.tsx` | Enhance with spec-compliant restore preview UI (profile, categories, CTAs) |
| `src/lib/engines/setup-orchestration-engine.ts` | Add `globalSetupState` computed property |

## Implementation Order

1. Add 2 new phase IDs to contract
2. Create `SecureFoundationStep.tsx`
3. Add 2 phase definitions to DAG with correct ordering
4. Wire both into `OSSetupExperience` (imports, render, state, exclusions)
5. Add missing CTAs to DeviceOwnershipStep, NetworkSetupStep
6. Enhance RestoreFlow with spec-compliant preview UI
7. Add globalSetupState to orchestration engine
8. Verify with `tsc --noEmit`

