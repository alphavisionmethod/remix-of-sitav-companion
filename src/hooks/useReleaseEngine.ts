// ═══════════════════════════════════════════════════════════════
// SITA OS — useReleaseEngine Hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useMemo } from "react";
import { getReleaseEngine } from "@/lib/engines/release-engine";

export function useReleaseEngine() {
  const engine = useMemo(() => getReleaseEngine(), []);

  const planRollout = useCallback((version: string, config: {
    previousVersion: string; initialCanaryPercent: number;
    expansionSteps: number[]; observationMinutes: number;
    autoPromote: boolean; ownerId: string;
  }) => engine.planner.planRollout(version, config), [engine]);

  const evaluateCanary = useCallback((rolloutId: string, metrics: Array<{
    metric_name: string; canary_value: number; baseline_value: number;
    threshold: number; weight: number;
  }>) => engine.planner.evaluateCanary(rolloutId, metrics), [engine]);

  const checkRollbackEligibility = useCallback((releaseId: string, reason: string) =>
    engine.rollback.checkEligibility(releaseId, reason), [engine]);

  const orchestrateRollback = useCallback((releaseId: string, opts: {
    strategy: "immediate" | "staged" | "blue_green"; reason: string; approvedBy: string;
  }) => engine.rollback.orchestrate(releaseId, opts), [engine]);

  const checkCompatibility = useCallback((source: string, sourceVersion: string, targets: Array<{
    component: string; version: string; minimumVersion?: string;
  }>) => engine.compatibility.check(source, sourceVersion, targets), [engine]);

  const detectRegressions = useCallback((releaseId: string, metrics: Array<{
    metric: string; baseline: number; current: number; threshold: number;
  }>) => engine.regression.detect(releaseId, metrics), [engine]);

  const scoreReleaseHealth = useCallback((releaseId: string) =>
    engine.health.score(releaseId), [engine]);

  return {
    planRollout, evaluateCanary, checkRollbackEligibility,
    orchestrateRollback, checkCompatibility, detectRegressions, scoreReleaseHealth,
  };
}
