// ═══════════════════════════════════════════════════════════════
// SITA OS — useOnboardingDaemon Hook
// Reactive bridge for onboarding UI
// ═══════════════════════════════════════════════════════════════

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
