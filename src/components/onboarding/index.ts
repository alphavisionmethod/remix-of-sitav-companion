// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Onboarding Primitives Barrel
// ═══════════════════════════════════════════════════════════════
// All shared UI building blocks used by the 29 personalization
// ceremony screens live here. Pages compose; components are reused.
// Drift-prevented by BLOCK gate `check-onboarding-components-folder`.
// ═══════════════════════════════════════════════════════════════

export { OnboardingShell } from "./OnboardingShell";
export type { OnboardingShellProps } from "./OnboardingShell";

export { OnboardingProgress } from "./OnboardingProgress";
export type { OnboardingProgressProps } from "./OnboardingProgress";

export { OnboardingChoiceCard } from "./OnboardingChoiceCard";
export type { OnboardingChoiceCardProps } from "./OnboardingChoiceCard";

export { OnboardingStepHeader } from "./OnboardingStepHeader";
export type { OnboardingStepHeaderProps } from "./OnboardingStepHeader";

export { OnboardingFooterNav } from "./OnboardingFooterNav";
export type { OnboardingFooterNavProps } from "./OnboardingFooterNav";

export { OnboardingMomentReveal } from "./OnboardingMomentReveal";
export type { OnboardingMomentRevealProps } from "./OnboardingMomentReveal";
