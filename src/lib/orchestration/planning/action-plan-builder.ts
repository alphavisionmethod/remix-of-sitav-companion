// ═══════════════════════════════════════════════════════════════
// SITA OS — Action Plan Builder (Planning Layer)
// Constructs ActionEnvelopes from approved plans
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope, PlannedStep } from "../shared/orchestration-envelope";

export interface ActionPlan {
  actionPlanId: string;
  envelopeId: string;
  domain: string;
  capability: string;
  steps: ActionStep[];
  totalEstimatedMs: number;
  rollbackPlanId?: string;
}

export interface ActionStep {
  stepId: string;
  order: number;
  actionType: string;
  target: string;
  params: Record<string, unknown>;
  timeoutMs: number;
  retryPolicy: RetryPolicy;
  rollbackAction?: string;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY: RetryPolicy = { maxRetries: 3, backoffMs: 500, backoffMultiplier: 2 };

export function buildActionPlan(envelope: OrchestrationEnvelope): ActionPlan {
  const planState = envelope.planningState;
  if (!planState) {
    return {
      actionPlanId: crypto.randomUUID(),
      envelopeId: envelope.envelopeId,
      domain: envelope.domain,
      capability: envelope.capabilityId,
      steps: [],
      totalEstimatedMs: 0,
    };
  }

  const steps: ActionStep[] = planState.steps
    .filter(s => s.type === "capability_call" || s.type === "side_effect")
    .map((s, i) => ({
      stepId: s.stepId,
      order: i + 1,
      actionType: s.type,
      target: s.target,
      params: s.params,
      timeoutMs: Math.max(s.estimatedDurationMs * 3, 5000),
      retryPolicy: DEFAULT_RETRY,
      rollbackAction: s.reversible ? `rollback-${s.stepId}` : undefined,
    }));

  return {
    actionPlanId: crypto.randomUUID(),
    envelopeId: envelope.envelopeId,
    domain: envelope.domain,
    capability: envelope.intentState?.resolvedCapability ?? envelope.capabilityId,
    steps,
    totalEstimatedMs: planState.steps.reduce((acc, s) => acc + s.estimatedDurationMs, 0),
  };
}
