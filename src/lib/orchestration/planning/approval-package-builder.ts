// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Package Builder (Planning Layer)
// Builds approval packages when plan requires approval
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope } from "../shared/orchestration-envelope";
import type { OrchestrationContext } from "../shared/orchestration-context";

export interface ApprovalPackage {
  packageId: string;
  envelopeId: string;
  correlationId: string;
  requesterUserId: string;
  domain: string;
  riskTier: string;
  justification: string;
  impactSummary: string;
  planStepCount: number;
  sideEffectCount: number;
  reversible: boolean;
  requiredApprovers: string[];
  expiresAt: string;
  createdAt: string;
}

export function buildApprovalPackage(
  envelope: OrchestrationEnvelope,
  context: OrchestrationContext
): ApprovalPackage {
  const planState = envelope.planningState;
  const intentState = envelope.intentState;

  const sideEffects = planState?.steps.filter(s =>
    s.type === "side_effect" || s.type === "capability_call"
  ).length ?? 0;

  const reversible = planState?.steps.every(s => s.reversible) ?? false;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return {
    packageId: crypto.randomUUID(),
    envelopeId: envelope.envelopeId,
    correlationId: envelope.correlationId,
    requesterUserId: context.user.userId,
    domain: envelope.domain,
    riskTier: intentState?.riskTier ?? "standard",
    justification: `Intent: ${envelope.intentRaw.slice(0, 200)}`,
    impactSummary: `${sideEffects} side effects, ${reversible ? "fully reversible" : "partially irreversible"}`,
    planStepCount: planState?.steps.length ?? 0,
    sideEffectCount: sideEffects,
    reversible,
    requiredApprovers: intentState?.riskTier === "critical" ? ["admin", "domain-owner"] : ["admin"],
    expiresAt,
    createdAt: new Date().toISOString(),
  };
}
