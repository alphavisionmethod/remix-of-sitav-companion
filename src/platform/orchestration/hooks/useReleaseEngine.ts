// ═══════════════════════════════════════════════════════════════
// SITA OS — useReleaseEngine Hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useMemo } from "react";
import { getReleaseEngine } from "@/domains/engines/release-engine";
import type { RolloutStateMachine } from "@/packages/release-contracts/rollout-types";
import type { ReleaseHealthSnapshot, ReleaseHealthThresholds } from "@/packages/release-contracts/health-types";
import type { ReleaseGateSet } from "@/packages/release-contracts/compatibility-types";

export function useReleaseEngine() {
  const engine = useMemo(() => getReleaseEngine(), []);

  const planRollout = useCallback((version: string, config: {
    previousVersion: string; initialCanaryPercent: number;
    expansionSteps: number[]; observationMinutes: number;
    autoPromote: boolean; ownerId: string;
  }) => engine.planner.planRollout(version, config), [engine]);

  const evaluateCanaryPromotion = useCallback((
    rollout: RolloutStateMachine, metrics: Record<string, number>, baselineMetrics: Record<string, number>,
  ) => engine.planner.evaluateCanaryPromotion(rollout, metrics, baselineMetrics), [engine]);

  const estimateBlastRadius = useCallback((rollout: RolloutStateMachine, totalUsers: number) =>
    engine.planner.estimateBlastRadius(rollout, totalUsers), [engine]);

  const evaluateRollbackEligibility = useCallback((rolloutId: string, version: string) =>
    engine.rollback.evaluateEligibility(rolloutId, version), [engine]);

  const createRollback = useCallback((rolloutId: string, version: string, targetVersion: string, reason: string, initiatedBy: string) =>
    engine.rollback.createRollback(rolloutId, version, targetVersion, reason, initiatedBy), [engine]);

  const checkGates = useCallback((version: string, gates: ReleaseGateSet) =>
    engine.compatibility.checkGates(version, gates), [engine]);

  const buildCompatibilityMatrix = useCallback((components: Array<{ name: string; version: string; compatibleWith: Record<string, string> }>) =>
    engine.compatibility.buildMatrix(components), [engine]);

  const detectRegressions = useCallback((baseline: Record<string, number>, current: Record<string, number>, thresholds: Record<string, number>) =>
    engine.regression.detectRegressions(baseline, current, thresholds), [engine]);

  const compareReleases = useCallback((baseline: Record<string, number>, current: Record<string, number>) =>
    engine.regression.compareReleases(baseline, current), [engine]);

  const scoreHealth = useCallback((snapshot: ReleaseHealthSnapshot, thresholds: ReleaseHealthThresholds) =>
    engine.health.scoreHealth(snapshot, thresholds), [engine]);

  return {
    planRollout, evaluateCanaryPromotion, estimateBlastRadius,
    evaluateRollbackEligibility, createRollback,
    checkGates, buildCompatibilityMatrix,
    detectRegressions, compareReleases, scoreHealth,
  };
}
