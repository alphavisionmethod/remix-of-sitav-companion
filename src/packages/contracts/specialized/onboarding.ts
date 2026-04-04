// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Onboarding
// ═══════════════════════════════════════════════════════════════

export type OnboardingPhase = "welcome" | "profile" | "connectors" | "preferences" | "verification" | "complete";

export interface OnboardingStep {
  id: string;
  phase: OnboardingPhase;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedAt?: string;
  skipped: boolean;
  order: number;
}

export interface OnboardingState {
  userId: string;
  currentPhase: OnboardingPhase;
  steps: OnboardingStep[];
  completionPercent: number;
  startedAt: string;
  completedAt?: string;
  tier: "standard" | "premium" | "enterprise";
}
