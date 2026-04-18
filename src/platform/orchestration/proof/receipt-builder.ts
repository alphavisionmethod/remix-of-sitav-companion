// ═══════════════════════════════════════════════════════════════
// SITA OS — Receipt Builder (Proof Layer)
// Constructs receipts from execution results
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope } from "../shared/orchestration-envelope";

export interface OrchestrationReceipt {
  receiptId: string;
  envelopeId: string;
  correlationId: string;
  domain: string;
  capability: string;
  outcome: string;
  intentClassification: string;
  riskTier: string;
  stepsExecuted: number;
  sideEffectCount: number;
  rollbackAvailable: boolean;
  durationMs: number;
  proofHash: string;
  createdAt: string;
}

export function buildReceipt(envelope: OrchestrationEnvelope): OrchestrationReceipt {
  return {
    receiptId: envelope.proofState?.receiptId ?? crypto.randomUUID(),
    envelopeId: envelope.envelopeId,
    correlationId: envelope.correlationId,
    domain: envelope.domain,
    capability: envelope.intentState?.resolvedCapability ?? envelope.capabilityId,
    outcome: envelope.executionState?.result ?? envelope.status,
    intentClassification: envelope.intentState?.classification ?? "unknown",
    riskTier: envelope.intentState?.riskTier ?? "standard",
    stepsExecuted: envelope.executionState?.stepsCompleted ?? 0,
    sideEffectCount: envelope.executionState?.sideEffects.length ?? 0,
    rollbackAvailable: envelope.executionState?.rollbackAvailable ?? false,
    durationMs: envelope.executionState?.durationMs ?? 0,
    proofHash: envelope.proofState?.proofChainHash ?? "",
    createdAt: new Date().toISOString(),
  };
}
