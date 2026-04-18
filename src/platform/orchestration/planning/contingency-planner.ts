// ═══════════════════════════════════════════════════════════════
// SITA OS — Contingency Planner (Planning Layer)
// Builds rollback/fallback strategies
// ═══════════════════════════════════════════════════════════════

import type { PlannedStep } from "../shared/orchestration-envelope";

export interface ContingencyPlan {
  contingencyId: string;
  primaryPlanId: string;
  rollbackSteps: RollbackStep[];
  fallbackCapability?: string;
  maxRollbackWindowMs: number;
  fullRollbackPossible: boolean;
}

export interface RollbackStep {
  originalStepId: string;
  rollbackAction: string;
  rollbackTarget: string;
  priority: number;
  estimatedDurationMs: number;
}

export function buildContingencyPlan(planId: string, steps: PlannedStep[]): ContingencyPlan {
  const reversibleSteps = steps.filter(s => s.reversible);

  const rollbackSteps: RollbackStep[] = reversibleSteps
    .reverse()
    .map((s, i) => ({
      originalStepId: s.stepId,
      rollbackAction: `undo-${s.type}`,
      rollbackTarget: s.target,
      priority: i + 1,
      estimatedDurationMs: s.estimatedDurationMs,
    }));

  return {
    contingencyId: crypto.randomUUID(),
    primaryPlanId: planId,
    rollbackSteps,
    maxRollbackWindowMs: 30 * 60 * 1000, // 30 minutes
    fullRollbackPossible: steps.every(s => s.reversible),
  };
}
