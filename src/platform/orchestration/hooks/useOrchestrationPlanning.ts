// ═══════════════════════════════════════════════════════════════
// SITA OS — useOrchestrationPlanning Hook
// Read-only hook for active plans, approval queue
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { orchestrationFacade } from "@/platform/orchestration";

export function useOrchestrationPlanning() {
  const lastResult = useMemo(() => orchestrationFacade.getLastResult(), []);
  const planning = lastResult?.planningOutcome ?? null;

  return {
    activePlan: planning,
    planId: planning?.planId ?? null,
    stepCount: planning?.stepCount ?? 0,
    approvalRequired: planning?.approvalRequired ?? false,
    approvalStatus: planning?.approvalStatus ?? "not_required",
    simulationPassed: planning?.simulationPassed ?? null,
    estimatedDurationMs: planning?.estimatedDurationMs ?? 0,
  };
}
