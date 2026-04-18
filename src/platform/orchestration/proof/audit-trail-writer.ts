// ═══════════════════════════════════════════════════════════════
// SITA OS — Audit Trail Writer (Proof Layer)
// Writes audit trail entries
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope } from "../shared/orchestration-envelope";

export interface AuditTrailEntry {
  entryId: string;
  auditTrailId: string;
  envelopeId: string;
  correlationId: string;
  action: string;
  actorUserId: string;
  domain: string;
  layer: string;
  severity: "info" | "warning" | "critical";
  detail: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export function buildAuditTrail(envelope: OrchestrationEnvelope): AuditTrailEntry[] {
  const entries: AuditTrailEntry[] = [];
  const auditTrailId = envelope.proofState?.auditTrailId ?? crypto.randomUUID();
  const base = {
    auditTrailId,
    envelopeId: envelope.envelopeId,
    correlationId: envelope.correlationId,
    actorUserId: envelope.sourceUserId,
    domain: envelope.domain,
  };

  // Intent entry
  if (envelope.intentState) {
    entries.push({
      ...base,
      entryId: crypto.randomUUID(),
      action: "intent_resolved",
      layer: "intent",
      severity: "info",
      detail: `Classified as ${envelope.intentState.classification} in ${envelope.intentState.resolvedDomain}`,
      metadata: { riskTier: envelope.intentState.riskTier, confidence: envelope.intentState.confidenceScore },
      timestamp: envelope.updatedAt,
    });
  }

  // Planning entry
  if (envelope.planningState) {
    entries.push({
      ...base,
      entryId: crypto.randomUUID(),
      action: "plan_built",
      layer: "planning",
      severity: envelope.planningState.approvalRequired ? "warning" : "info",
      detail: `${envelope.planningState.steps.length} steps planned, approval ${envelope.planningState.approvalStatus}`,
      metadata: { planId: envelope.planningState.planId, stepCount: envelope.planningState.steps.length },
      timestamp: envelope.updatedAt,
    });
  }

  // Execution entry
  if (envelope.executionState) {
    entries.push({
      ...base,
      entryId: crypto.randomUUID(),
      action: "execution_completed",
      layer: "execution",
      severity: envelope.executionState.result === "failure" ? "critical" : "info",
      detail: `${envelope.executionState.stepsCompleted}/${envelope.executionState.stepsTotal} steps, result: ${envelope.executionState.result}`,
      metadata: {
        executionId: envelope.executionState.executionId,
        sideEffects: envelope.executionState.sideEffects.length,
        durationMs: envelope.executionState.durationMs,
      },
      timestamp: envelope.updatedAt,
    });
  }

  return entries;
}
