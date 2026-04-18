// ═══════════════════════════════════════════════════════════════
// SITA OS — useOrchestrationExecution Hook
// Read-only hook for execution status, job state
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { orchestrationFacade } from "@/platform/orchestration";

export function useOrchestrationExecution() {
  const lastResult = useMemo(() => orchestrationFacade.getLastResult(), []);
  const execution = lastResult?.executionOutcome ?? null;

  return {
    executionId: execution?.executionId ?? null,
    stepsCompleted: execution?.stepsCompleted ?? 0,
    stepsTotal: execution?.stepsTotal ?? 0,
    sideEffectCount: execution?.sideEffectCount ?? 0,
    rollbackAvailable: execution?.rollbackAvailable ?? false,
    durationMs: execution?.durationMs ?? 0,
    isComplete: execution !== null && execution.stepsCompleted === execution.stepsTotal,
  };
}
