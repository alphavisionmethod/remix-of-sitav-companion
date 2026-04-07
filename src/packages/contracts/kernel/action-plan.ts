// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel Contract: ActionPlan & ActionSpec
// Typed planning output for the kernel execution loop.
// ═══════════════════════════════════════════════════════════════

import type { ActionEnvelope, KernelExecutionMode } from "./action-envelope";

/** A single step in an action plan */
export interface ActionSpec {
  stepId: string;
  capabilityId: string;
  description: string;
  domain: string;
  parameters: Record<string, unknown>;
  dependsOn: string[];
  riskTier: "standard" | "elevated" | "critical";
  estimatedCostCents?: number;
  requiresApproval: boolean;
  canReplay: boolean;
  canDryRun: boolean;
}

/** A plan composed of ordered action specs */
export interface ActionPlan {
  id: string;
  envelopeId: string;
  correlationId: string;
  steps: ActionSpec[];
  mode: KernelExecutionMode;
  totalEstimatedCostCents: number;
  requiresAnyApproval: boolean;
  createdAt: string;
  createdBy: string;
  status: "draft" | "approved" | "executing" | "completed" | "failed" | "cancelled";
}

/** Create a single-step plan from an envelope */
export function createSingleStepPlan(envelope: ActionEnvelope): ActionPlan {
  return {
    id: crypto.randomUUID(),
    envelopeId: envelope.id,
    correlationId: envelope.correlationId,
    steps: [{
      stepId: crypto.randomUUID(),
      capabilityId: envelope.capabilityId,
      description: envelope.intent.description ?? envelope.intent.action,
      domain: envelope.intent.domain,
      parameters: envelope.intent.parameters,
      dependsOn: [],
      riskTier: envelope.risk.tier,
      estimatedCostCents: envelope.risk.costEstimateCents,
      requiresApproval: envelope.approval.required,
      canReplay: true,
      canDryRun: true,
    }],
    mode: envelope.execution.mode,
    totalEstimatedCostCents: envelope.risk.costEstimateCents ?? 0,
    requiresAnyApproval: envelope.approval.required,
    createdAt: new Date().toISOString(),
    createdBy: envelope.actorId,
    status: "draft",
  };
}
