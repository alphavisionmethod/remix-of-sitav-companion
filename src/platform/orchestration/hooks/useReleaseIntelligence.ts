// ═══════════════════════════════════════════════════════════════
// SITA OS — useReleaseIntelligence Hook
// Provides release readiness scoring and compatibility checking.
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import {
  releaseIntelligence,
  type ReleaseReadinessScore,
  type CompatibilityEntry,
  type RegressionFingerprint,
} from "@/lib/services/release-intelligence";

export function useReleaseIntelligence() {
  const [readinessScore, setReadinessScore] = useState<ReleaseReadinessScore | null>(null);
  const [regressions, setRegressions] = useState<RegressionFingerprint[]>([]);

  const scoreRelease = useCallback((releaseId: string, dimensions: ReleaseReadinessScore["dimensions"]) => {
    const score = releaseIntelligence.scoreReadiness(releaseId, dimensions);
    setReadinessScore(score);
    return score;
  }, []);

  const checkCompatibility = useCallback((component: string, version: string, targets: Array<{ component: string; version: string }>) => {
    return releaseIntelligence.checkCompatibility(component, version, targets);
  }, []);

  const refreshRegressions = useCallback(() => {
    const active = releaseIntelligence.getActiveRegressions();
    setRegressions(active);
    return active;
  }, []);

  const registerCompatibility = useCallback((entry: CompatibilityEntry) => {
    releaseIntelligence.registerCompatibility(entry);
  }, []);

  return {
    readinessScore,
    regressions,
    scoreRelease,
    checkCompatibility,
    refreshRegressions,
    registerCompatibility,
  };
}
