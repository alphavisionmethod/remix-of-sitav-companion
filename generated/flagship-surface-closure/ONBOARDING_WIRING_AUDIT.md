# Onboarding Wiring Audit — Honest Deferral

**Scope:** Admin AI Engineering closure pass
**Verdict:** DEFERRED — out of admin AI engineering scope
**Cross-references:** [ADMIN_AI_RUNTIME_CLOSURE_SPEC.md](./ADMIN_AI_RUNTIME_CLOSURE_SPEC.md), [ADMIN_INTEGRATIONS_CLOSURE_SPEC.md](./ADMIN_INTEGRATIONS_CLOSURE_SPEC.md)
**Validator:** `scripts/validation/check-onboarding-simulated-persona-disclosure.ts` (WARN-tier)

## Spec compliance verdict

The Flagship Surface Closure spec lists Onboarding as one of 6 in-scope surfaces. Per the user constraint **"integrate it correctly only on the admin AI engineer team"**, onboarding UI polish (screens, persona disclosures, narrative continuity) is **out-of-admin-AI-scope**. This document encodes that boundary honestly rather than fake-greening the surface.

## What IS in admin AI scope (already done)

- The canonical onboarding runtime hook `useOnboardingDaemon` (`src/hooks/useOnboardingDaemon.ts`) and the daemon service `src/lib/services/onboarding-daemon.ts` are wired and reactive.
- Step-completion, skip, back, restore-source selection, and validation are exposed through a single canonical hook with `useSyncExternalStore` (no parallel state systems).
- Session persistence and first-boot detection are implemented at the service layer.

## What is NOT in admin AI scope

- `src/pages/onboarding/**` does not exist as a top-level admin AI surface; onboarding screens live in user-flagship territory.
- Simulated-persona disclosure components (banner/badge), per-screen consistency enforcement, success/retry/resume/exit visual states, and trust-copy tightening are **user-flagship-pass-required**.
- Cross-screen analytics consistency and mid-flow recovery UX are **user-flagship-pass-required**.

## Canonical evidence locations

| Concern | Source of truth |
|---|---|
| Onboarding state machine | `src/lib/services/onboarding-daemon.ts` |
| Reactive bridge | `src/hooks/useOnboardingDaemon.ts` |
| First-boot detection | `onboardingDaemon.isFirstBoot()` |
| Step lifecycle | `completeStep`, `skipStep`, `goBack`, `completeOnboarding`, `resetOnboarding` |

## Honest WARN-tier classification

The validator emits WARN-tier `deferred-to-user-flagship-pass` issues. These are NOT silent passes — they are explicit deferral markers with cross-references to this audit. Modeled on the mobile-archived stub pattern from the previous closure pass.

## Required for green

A future user-flagship-pass must:
1. Add `src/pages/onboarding/**` screens that consume `useOnboardingDaemon`.
2. Add a centralized `SimulatedPersonaBanner` component used on every persona-bearing screen.
3. Add screen-level state coverage (success / retry / resume / exit) with shared canonical state primitives.
4. Tighten trust copy to never imply live autonomous agent behavior beyond simulated persona.

Until then, this gate stays honest WARN.
