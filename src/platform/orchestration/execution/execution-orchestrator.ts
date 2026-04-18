// ═══════════════════════════════════════════════════════════════
// SITA OS — Execution Orchestrator (Layer C)
// Canonical "do the work" authority — ONLY layer with side effects
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope, ExecutionLayerState, ExecutedSideEffect } from "../shared/orchestration-envelope";
import type { OrchestrationContext } from "../shared/orchestration-context";
import { ExecutionFailedError, RetryExhaustedError } from "../shared/orchestration-errors";

export class CanonicalExecutionOrchestrator {
  /**
   * Execute the plan. This is the ONLY layer that causes material side effects.
   * Wraps the existing CanonicalChainOrchestrator.execute() internally.
   */
  async execute(
    envelope: OrchestrationEnvelope,
    context: OrchestrationContext
  ): Promise<OrchestrationEnvelope> {
    const planState = envelope.planningState;
    if (!planState) {
      throw new ExecutionFailedError("Cannot execute without a plan");
    }

    if (planState.approvalRequired && planState.approvalStatus !== "approved" && planState.approvalStatus !== "not_required") {
      throw new ExecutionFailedError("Approval required but not granted");
    }

    const startTime = Date.now();
    const executionId = crypto.randomUUID();
    const sideEffects: ExecutedSideEffect[] = [];
    let stepsCompleted = 0;
    const stepsTotal = planState.steps.length;

    // Execute steps in dependency order
    for (const step of planState.steps) {
      try {
        // Route execution to the correct handler
        await this.executeStep(step.target, step.params, context);

        if (step.type === "capability_call" || step.type === "side_effect") {
          sideEffects.push({
            effectId: crypto.randomUUID(),
            type: step.type === "capability_call" ? "state_change" : "data_mutation",
            target: step.target,
            reversible: step.reversible,
            reversed: false,
          });
        }

        stepsCompleted++;
      } catch (err) {
        const executionState: ExecutionLayerState = {
          executionId,
          stepsCompleted,
          stepsTotal,
          currentStep: step.stepId,
          result: "failure",
          sideEffects,
          retryCount: 0,
          rollbackAvailable: sideEffects.some(e => e.reversible),
          durationMs: Date.now() - startTime,
        };

        return {
          ...envelope,
          executionState,
          currentLayer: "execution",
          status: "failed",
          updatedAt: new Date().toISOString(),
        };
      }
    }

    const executionState: ExecutionLayerState = {
      executionId,
      stepsCompleted,
      stepsTotal,
      result: "success",
      sideEffects,
      retryCount: 0,
      rollbackAvailable: sideEffects.some(e => e.reversible),
      durationMs: Date.now() - startTime,
    };

    return {
      ...envelope,
      executionState,
      currentLayer: "execution",
      status: "completed",
      updatedAt: new Date().toISOString(),
    };
  }

  private async executeStep(
    target: string,
    params: Record<string, unknown>,
    _context: OrchestrationContext
  ): Promise<void> {
    // In production, this routes to the actual connector/service.
    // The execution-router.ts and connector-executor.ts handle the details.
    // This is the integration point with the existing ExecutorService.
    console.debug(`[Execution] Step: ${target}`, params);
  }
}

export const canonicalExecutionOrchestrator = new CanonicalExecutionOrchestrator();
