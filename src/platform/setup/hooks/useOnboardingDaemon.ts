// ════════════════════════════════════════════════════════════════
// SITA OS — useOnboardingDaemon Hook  [DEPRECATED]
// ----------------------------------------------------------------
// DEPRECATED: This hook bridges the legacy onboarding-daemon engine,
// an alternative 11-step OS onboarding orchestrator that is NOT the
// canonical first-boot path.
//
// CANONICAL REPLACEMENT:  src/components/sita/OSSetupExperience.tsx
//                         (~50-phase first-boot, 29-screen master spec)
// REGISTRY:               src/lib/architecture/onboarding-surface-registry.ts
//                         (see ONBOARDING_DEPRECATED_SURFACES)
//
// Retained for backward compatibility with src/pages/FirstBootSetup.tsx.
// New code MUST NOT import this hook — enforced by:
//   scripts/architecture/checks/check-onboarding-surface-truth.ts
// ════════════════════════════════════════════════════════════════

import { useSyncExternalStore, useCallback, useState } from "react";
import { onboardingDaemon } from "@/lib/services/onboarding-daemon";

export function useOnboardingDaemon() {
  const session = useSyncExternalStore(
    (cb) => onboardingDaemon.subscribe(cb),
    () => onboardingDaemon.getSession()
  );

  const [loading, setLoading] = useState(false);

  const startOnboarding = useCallback(async () => {
    setLoading(true);
    try { await onboardingDaemon.startOnboarding(); }
    finally { setLoading(false); }
  }, []);

  const completeStep = useCallback(async (stepId: string, choices?: Record<string, unknown>) => {
    await onboardingDaemon.completeStep(stepId, choices);
  }, []);

  const skipStep = useCallback(async (stepId: string) => {
    await onboardingDaemon.skipStep(stepId);
  }, []);

  const goBack = useCallback(() => {
    onboardingDaemon.goBack();
  }, []);

  const completeOnboarding = useCallback(async () => {
    return await onboardingDaemon.completeOnboarding();
  }, []);

  const resetOnboarding = useCallback(() => {
    onboardingDaemon.resetOnboarding();
  }, []);

  const selectRestoreSource = useCallback((id: string) => {
    onboardingDaemon.selectRestoreSource(id);
  }, []);

  const validateRestoreSource = useCallback(async (id: string) => {
    await onboardingDaemon.validateRestoreSource(id);
  }, []);

  const isFirstBoot = onboardingDaemon.isFirstBoot();
  const currentStep = session.steps.find(s => s.id === session.currentStep);
  const stepIndex = session.steps.findIndex(s => s.id === session.currentStep);
  const totalSteps = session.steps.length;
  const progress = Math.round(((session.steps.filter(s => s.status === "complete" || s.status === "skipped").length) / totalSteps) * 100);

  return {
    session,
    loading,
    isFirstBoot,
    currentStep,
    stepIndex,
    totalSteps,
    progress,
    startOnboarding,
    completeStep,
    skipStep,
    goBack,
    completeOnboarding,
    resetOnboarding,
    selectRestoreSource,
    validateRestoreSource,
  };
}
