// ═══════════════════════════════════════════════════════════════
// SITA OS — Golden Path Evaluator
// Pure runtime helper that, given the live kill-switch state,
// returns which Golden Paths are currently blocked, degraded, or
// healthy. Used by admin surfaces and the launch-readiness gate.
// ═══════════════════════════════════════════════════════════════

import type { GoldenPathEntry, GoldenPathId } from "./golden-path-types";
import { GOLDEN_PATH_REGISTRY } from "./golden-path-registry";

export type GoldenPathHealth = "healthy" | "degraded" | "blocked";

export interface GoldenPathEvaluation {
  readonly pathId: GoldenPathId;
  readonly health: GoldenPathHealth;
  readonly blockedBy: readonly string[];
  readonly degradedSteps: readonly string[];
}

/**
 * Evaluate health for every Golden Path against a snapshot of armed
 * kill switches. A path is:
 *   • blocked    — any path-level blocking switch is armed.
 *   • degraded   — any step-level blocking switch is armed but no
 *                  path-level switch is armed.
 *   • healthy    — otherwise.
 */
export function evaluateGoldenPaths(
  armedSwitchIds: ReadonlySet<string>
): readonly GoldenPathEvaluation[] {
  return GOLDEN_PATH_REGISTRY.map((p) => evaluatePath(p, armedSwitchIds));
}

export function evaluatePath(
  path: GoldenPathEntry,
  armedSwitchIds: ReadonlySet<string>
): GoldenPathEvaluation {
  const pathBlocking = path.blockingKillSwitches.filter((s) => armedSwitchIds.has(s));
  const degradedSteps: string[] = [];
  for (const step of path.steps) {
    if (step.blockingKillSwitches.some((s) => armedSwitchIds.has(s))) {
      degradedSteps.push(step.stepId);
    }
  }
  let health: GoldenPathHealth = "healthy";
  if (pathBlocking.length > 0) health = "blocked";
  else if (degradedSteps.length > 0) health = "degraded";
  return {
    pathId: path.pathId,
    health,
    blockedBy: pathBlocking,
    degradedSteps,
  };
}

export function summarizeEvaluation(
  evaluations: readonly GoldenPathEvaluation[]
): {
  total: number;
  healthy: number;
  degraded: number;
  blocked: number;
} {
  let healthy = 0, degraded = 0, blocked = 0;
  for (const e of evaluations) {
    if (e.health === "healthy") healthy++;
    else if (e.health === "degraded") degraded++;
    else blocked++;
  }
  return { total: evaluations.length, healthy, degraded, blocked };
}
