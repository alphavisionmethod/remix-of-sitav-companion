// ═══════════════════════════════════════════════════════════════
// SITA OS — Desk Executor
// Unified facade over executor-service, recommendation-execution,
// and connector-runners for controlled tool/action execution
// ═══════════════════════════════════════════════════════════════

import { conscienceGate, type GateRequest } from "@/lib/services/conscience-gate";
import { getTaskContract } from "@/lib/contracts/global-contracts-registry";

// ── Tool Plan Types ────────────────────────────────────────────

export type ToolStepType = "connector" | "recommendation" | "workflow" | "calculation" | "query";
export type ExecutionStatus = "pending" | "approved" | "executing" | "completed" | "failed" | "rolled-back";

export interface ToolStep {
  stepId: string;
  type: ToolStepType;
  action: string;
  params: Record<string, unknown>;
  requiresApproval: boolean;
  riskTier: string;
  estimatedDurationMs: number;
  rollbackAction?: string;
}

export interface ToolPlan {
  planId: string;
  taskType: string;
  steps: ToolStep[];
  totalSteps: number;
  approvalRequired: boolean;
  riskClass: string;
  estimatedSideEffects: string[];
  createdAt: string;
  correlationId: string;
}

export interface ExecutionReceipt {
  receiptId: string;
  planId: string;
  stepId: string;
  status: ExecutionStatus;
  outputs: Record<string, unknown>;
  sideEffects: string[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
  error?: string;
  rollbackPerformed: boolean;
}

// ── Desk Executor ──────────────────────────────────────────────

export class DeskExecutor {
  private executionLog: ExecutionReceipt[] = [];
  private planLog: ToolPlan[] = [];

  planExecution(
    taskType: string,
    context: Record<string, unknown>,
    correlationId?: string
  ): ToolPlan {
    const contract = getTaskContract(taskType);
    const planId = crypto.randomUUID();
    const corrId = correlationId || crypto.randomUUID();

    const steps: ToolStep[] = [];

    if (taskType === "connector-action") {
      steps.push({
        stepId: crypto.randomUUID(),
        type: "connector",
        action: String(context.action || "execute"),
        params: (context.params as Record<string, unknown>) || {},
        requiresApproval: true,
        riskTier: "critical",
        estimatedDurationMs: 5000,
        rollbackAction: "revert-connector-action",
      });
    } else if (taskType === "workflow-step") {
      steps.push({
        stepId: crypto.randomUUID(),
        type: "workflow",
        action: String(context.stepId || "execute"),
        params: (context.inputs as Record<string, unknown>) || {},
        requiresApproval: contract?.requiresApproval ?? true,
        riskTier: contract?.riskTier || "elevated",
        estimatedDurationMs: 10000,
      });
    } else if (taskType === "recommendation-generate") {
      steps.push({
        stepId: crypto.randomUUID(),
        type: "recommendation",
        action: "generate-and-present",
        params: context,
        requiresApproval: true,
        riskTier: "elevated",
        estimatedDurationMs: 15000,
      });
    } else {
      steps.push({
        stepId: crypto.randomUUID(),
        type: "query",
        action: taskType,
        params: context,
        requiresApproval: contract?.requiresApproval ?? false,
        riskTier: contract?.riskTier || "standard",
        estimatedDurationMs: contract?.maxLatencyMs || 10000,
      });
    }

    const plan: ToolPlan = {
      planId,
      taskType,
      steps,
      totalSteps: steps.length,
      approvalRequired: steps.some((s) => s.requiresApproval),
      riskClass: contract?.riskTier || "standard",
      estimatedSideEffects: this.estimateSideEffects(steps),
      createdAt: new Date().toISOString(),
      correlationId: corrId,
    };

    this.planLog.push(plan);
    if (this.planLog.length > 200) this.planLog = this.planLog.slice(-100);

    return plan;
  }

  async execute(
    plan: ToolPlan,
    userId: string,
    tenantId: string,
    approvalToken?: string
  ): Promise<ExecutionReceipt[]> {
    const receipts: ExecutionReceipt[] = [];

    // Validate through ConscienceGate first
    const gateRequest: GateRequest = {
      taskType: plan.taskType,
      userId,
      tenantId,
      input: { planId: plan.planId, steps: plan.steps.length },
      correlationId: plan.correlationId,
    };
    const verdict = await conscienceGate.evaluate(gateRequest);

    if (verdict.decision === "block" || verdict.decision === "refuse") {
      const receipt = this.createReceipt(plan.planId, plan.steps[0]?.stepId || "none", "failed", {
        error: `ConscienceGate ${verdict.decision}: ${verdict.reasons.join("; ")}`,
      });
      receipts.push(receipt);
      return receipts;
    }

    for (const step of plan.steps) {
      if (step.requiresApproval && !approvalToken) {
        const receipt = this.createReceipt(plan.planId, step.stepId, "pending", {
          outputs: { message: "Awaiting approval", riskTier: step.riskTier },
        });
        receipts.push(receipt);
        continue;
      }

      const receipt = await this.executeStep(plan.planId, step);
      receipts.push(receipt);

      if (receipt.status === "failed") break;
    }

    this.executionLog.push(...receipts);
    if (this.executionLog.length > 1000) this.executionLog = this.executionLog.slice(-500);

    return receipts;
  }

  private async executeStep(planId: string, step: ToolStep): Promise<ExecutionReceipt> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    try {
      let outputs: Record<string, unknown> = {};
      const sideEffects: string[] = [];

      switch (step.type) {
        case "connector":
          outputs = await this.executeConnectorAction(step);
          sideEffects.push(`Connector action: ${step.action}`);
          break;
        case "recommendation":
          outputs = await this.executeRecommendation(step);
          break;
        case "workflow":
          outputs = await this.executeWorkflowStep(step);
          sideEffects.push(`Workflow step: ${step.action}`);
          break;
        case "calculation":
          outputs = { result: "Delegated to Math-OS", deterministic: true };
          break;
        case "query":
          outputs = { result: "Query executed", params: step.params };
          break;
      }

      return {
        receiptId: crypto.randomUUID(),
        planId,
        stepId: step.stepId,
        status: "completed",
        outputs,
        sideEffects,
        startedAt,
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        rollbackPerformed: false,
      };
    } catch (error) {
      return {
        receiptId: crypto.randomUUID(),
        planId,
        stepId: step.stepId,
        status: "failed",
        outputs: {},
        sideEffects: [],
        startedAt,
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
        rollbackPerformed: false,
      };
    }
  }

  private async executeConnectorAction(step: ToolStep): Promise<Record<string, unknown>> {
    // In production, delegates to connector-runners service
    return {
      connectorId: step.params.connectorId,
      action: step.action,
      status: "executed",
      timestamp: new Date().toISOString(),
    };
  }

  private async executeRecommendation(step: ToolStep): Promise<Record<string, unknown>> {
    // In production, delegates to recommendation-execution service
    return {
      recommendationId: crypto.randomUUID(),
      status: "generated",
      domain: step.params.domain,
      timestamp: new Date().toISOString(),
    };
  }

  private async executeWorkflowStep(step: ToolStep): Promise<Record<string, unknown>> {
    // In production, delegates to executor-service
    return {
      workflowId: step.params.workflowId,
      stepId: step.action,
      status: "completed",
      timestamp: new Date().toISOString(),
    };
  }

  private estimateSideEffects(steps: ToolStep[]): string[] {
    const effects: string[] = [];
    for (const step of steps) {
      if (step.type === "connector") effects.push(`External API call: ${step.action}`);
      if (step.type === "workflow") effects.push(`Workflow mutation: ${step.action}`);
      if (step.type === "recommendation") effects.push("Recommendation generated for user review");
    }
    return effects;
  }

  private createReceipt(
    planId: string,
    stepId: string,
    status: ExecutionStatus,
    overrides: Partial<ExecutionReceipt> = {}
  ): ExecutionReceipt {
    const now = new Date().toISOString();
    return {
      receiptId: crypto.randomUUID(),
      planId,
      stepId,
      status,
      outputs: {},
      sideEffects: [],
      startedAt: now,
      completedAt: now,
      durationMs: 0,
      rollbackPerformed: false,
      ...overrides,
    };
  }

  getExecutionLog(limit?: number): ExecutionReceipt[] {
    const log = [...this.executionLog].reverse();
    return limit ? log.slice(0, limit) : log;
  }

  getPlanLog(limit?: number): ToolPlan[] {
    const log = [...this.planLog].reverse();
    return limit ? log.slice(0, limit) : log;
  }

  getExecutionStats(): { total: number; completed: number; failed: number; pending: number; avgDurationMs: number } {
    const stats = { total: this.executionLog.length, completed: 0, failed: 0, pending: 0, avgDurationMs: 0 };
    let totalMs = 0;
    for (const r of this.executionLog) {
      if (r.status === "completed") stats.completed++;
      else if (r.status === "failed") stats.failed++;
      else if (r.status === "pending") stats.pending++;
      totalMs += r.durationMs;
    }
    if (stats.total > 0) stats.avgDurationMs = totalMs / stats.total;
    return stats;
  }
}

export const deskExecutor = new DeskExecutor();
