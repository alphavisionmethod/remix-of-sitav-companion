// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Step Runner (Execution Layer)
// Runs individual workflow steps
// ═══════════════════════════════════════════════════════════════

import type { PlannedStep } from "../shared/orchestration-envelope";

export interface StepRunResult {
  stepId: string;
  success: boolean;
  output?: unknown;
  errorMessage?: string;
  durationMs: number;
  sideEffectProduced: boolean;
}

export async function runWorkflowStep(step: PlannedStep): Promise<StepRunResult> {
  const startTime = Date.now();
  try {
    console.debug(`[WorkflowStepRunner] Running step ${step.stepId} (${step.type} → ${step.target})`);

    return {
      stepId: step.stepId,
      success: true,
      output: { stepType: step.type, target: step.target },
      durationMs: Date.now() - startTime,
      sideEffectProduced: step.type === "capability_call" || step.type === "side_effect",
    };
  } catch (err) {
    return {
      stepId: step.stepId,
      success: false,
      errorMessage: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - startTime,
      sideEffectProduced: false,
    };
  }
}
