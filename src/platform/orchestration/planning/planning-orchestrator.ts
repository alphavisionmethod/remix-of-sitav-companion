// ═══════════════════════════════════════════════════════════════
// SITA OS — Planning Orchestrator (Layer B)
// Canonical "how should it happen" authority
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope, PlanningLayerState, PlannedStep } from "../shared/orchestration-envelope";
import type { OrchestrationContext } from "../shared/orchestration-context";
import { PlanConstructionError, ApprovalDeniedError } from "../shared/orchestration-errors";

export class CanonicalPlanningOrchestrator {
  /**
   * Build an execution plan from a resolved intent.
   * Determines steps, dependencies, approval needs, and contingencies.
   * Does NOT execute side effects.
   */
  async buildPlan(
    envelope: OrchestrationEnvelope,
    context: OrchestrationContext
  ): Promise<OrchestrationEnvelope> {
    const intentState = envelope.intentState;
    if (!intentState) {
      throw new PlanConstructionError("Cannot build plan without resolved intent");
    }

    const steps = this.buildSteps(intentState.resolvedCapability, envelope);
    const approvalRequired = this.requiresApproval(intentState.riskTier, context);
    const dependencyGraph = this.resolveDependencies(steps);
    const planId = crypto.randomUUID();

    const planningState: PlanningLayerState = {
      planId,
      steps,
      approvalRequired,
      approvalStatus: approvalRequired ? "pending" : "not_required",
      dependencyGraph,
    };

    // Simulate if requested
    if (envelope.isSimulation) {
      planningState.simulationResult = {
        simulationId: crypto.randomUUID(),
        passed: true,
        riskScore: intentState.riskTier === "critical" ? 0.8 : 0.3,
        sideEffectsDetected: steps.filter(s => s.type === "side_effect").length,
        durationMs: steps.reduce((acc, s) => acc + s.estimatedDurationMs, 0),
      };
    }

    return {
      ...envelope,
      planningState,
      currentLayer: "planning",
      status: approvalRequired ? "awaiting_approval" : "in_progress",
      updatedAt: new Date().toISOString(),
    };
  }

  private buildSteps(capability: string, envelope: OrchestrationEnvelope): PlannedStep[] {
    const steps: PlannedStep[] = [];
    const intentState = envelope.intentState;

    // Step 1: Validate preconditions
    steps.push({
      stepId: crypto.randomUUID(),
      order: 1,
      type: "checkpoint",
      target: "precondition-validator",
      params: { capability, domain: envelope.domain },
      dependsOn: [],
      estimatedDurationMs: 50,
      reversible: false,
    });

    // Step 2: Main capability call
    steps.push({
      stepId: crypto.randomUUID(),
      order: 2,
      type: "capability_call",
      target: capability,
      params: envelope.metadata,
      dependsOn: [steps[0].stepId],
      estimatedDurationMs: 500,
      reversible: true,
    });

    // Step 3: Approval gate if risk is elevated
    if (intentState?.riskTier === "critical" || intentState?.riskTier === "elevated") {
      steps.push({
        stepId: crypto.randomUUID(),
        order: 2, // parallel with capability prep
        type: "approval_gate",
        target: "approval-service",
        params: { riskTier: intentState.riskTier },
        dependsOn: [steps[0].stepId],
        estimatedDurationMs: 100,
        reversible: false,
      });
    }

    // Step 4: Notification
    steps.push({
      stepId: crypto.randomUUID(),
      order: 3,
      type: "notification",
      target: "notification-router",
      params: { type: "execution_complete", domain: envelope.domain },
      dependsOn: [steps[1].stepId],
      estimatedDurationMs: 30,
      reversible: false,
    });

    return steps;
  }

  private requiresApproval(riskTier: string, context: OrchestrationContext): boolean {
    if (riskTier === "critical") return true;
    if (riskTier === "elevated" && context.permission.maxAutonomyLevel < 3) return true;
    return false;
  }

  private resolveDependencies(steps: PlannedStep[]): Record<string, string[]> {
    const graph: Record<string, string[]> = {};
    for (const step of steps) {
      graph[step.stepId] = step.dependsOn;
    }
    return graph;
  }
}

export const canonicalPlanningOrchestrator = new CanonicalPlanningOrchestrator();
