// ═══════════════════════════════════════════════════════════════
// SITA OS — useReleaseEngine Hook
// Exposes rollout planner, health scorer, compatibility checker,
// regression detector, and release narrative generator.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useMemo } from "react";
import { ReleaseEngine, getReleaseEngine } from "@/lib/engines/release-engine";

export function useReleaseEngine() {
  const engine = useMemo(() => getReleaseEngine(), []);

  const planRollout = useCallback((version: string, config: {
    previousVersion: string;
    initialCanaryPercent: number;
    expansionSteps: number[];
    observationMinutes: number;
    autoPromote: boolean;
    ownerId: string;
  }) => engine.planRollout(version, config), [engine]);

  const evaluateCanary = useCallback((rolloutId: string, metrics: Array<{
    metric_name: string;
    canary_value: number;
    baseline_value: number;
    threshold: number;
    weight: number;
  }>) => engine.evaluateCanary(rolloutId, metrics), [engine]);

  const checkRollbackEligibility = useCallback((releaseId: string, reason: string) =>
    engine.checkRollbackEligibility(releaseId, reason), [engine]);

  const orchestrateRollback = useCallback((releaseId: string, opts: {
    strategy: "immediate" | "staged" | "blue_green";
    reason: string;
    approvedBy: string;
  }) => engine.orchestrateRollback(releaseId, opts), [engine]);

  const checkCompatibility = useCallback((source: string, sourceVersion: string, targets: Array<{
    component: string;
    version: string;
    minimumVersion?: string;
  }>) => engine.checkCompatibility(source, sourceVersion, targets), [engine]);

  const detectRegressions = useCallback((releaseId: string, metrics: Array<{
    metric: string;
    baseline: number;
    current: number;
    threshold: number;
  }>) => engine.detectRegressions(releaseId, metrics), [engine]);

  const scoreReleaseHealth = useCallback((releaseId: string) =>
    engine.scoreReleaseHealth(releaseId), [engine]);

  const generateNarrative = useCallback((releaseId: string) =>
    engine.generateNarrative(releaseId), [engine]);

  return {
    planRollout,
    evaluateCanary,
    checkRollbackEligibility,
    orchestrateRollback,
    checkCompatibility,
    detectRegressions,
    scoreReleaseHealth,
    generateNarrative,
  };
}
