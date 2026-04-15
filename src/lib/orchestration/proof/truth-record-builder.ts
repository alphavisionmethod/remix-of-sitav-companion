// ═══════════════════════════════════════════════════════════════
// SITA OS — Truth Record Builder (Proof Layer)
// Builds truth records for admin inspection
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope } from "../shared/orchestration-envelope";
import type { OrchestrationReceipt } from "./receipt-builder";
import type { AuditTrailEntry } from "./audit-trail-writer";
import type { ReversibilityRecord } from "./reversibility-writer";
import type { ApprovalProofRecord } from "./approval-proof-builder";
import type { LineageEvent } from "./event-lineage-builder";

export interface TruthRecord {
  truthRecordId: string;
  envelopeId: string;
  correlationId: string;

  // Summaries
  outcome: string;
  domain: string;
  capability: string;
  riskTier: string;

  // Proof artifacts
  receipt: OrchestrationReceipt;
  auditTrail: AuditTrailEntry[];
  lineage: LineageEvent[];
  reversibility: ReversibilityRecord;
  approvalProof: ApprovalProofRecord;

  // Integrity
  proofHash: string;
  integrity: "full" | "partial" | "degraded";

  // Timestamps
  createdAt: string;
  expiresAt?: string;
}

export function buildTruthRecord(
  envelope: OrchestrationEnvelope,
  receipt: OrchestrationReceipt,
  auditTrail: AuditTrailEntry[],
  lineage: LineageEvent[],
  reversibility: ReversibilityRecord,
  approvalProof: ApprovalProofRecord
): TruthRecord {
  return {
    truthRecordId: envelope.proofState?.truthRecordId ?? crypto.randomUUID(),
    envelopeId: envelope.envelopeId,
    correlationId: envelope.correlationId,
    outcome: envelope.status,
    domain: envelope.domain,
    capability: envelope.intentState?.resolvedCapability ?? envelope.capabilityId,
    riskTier: envelope.intentState?.riskTier ?? "standard",
    receipt,
    auditTrail,
    lineage,
    reversibility,
    approvalProof,
    proofHash: envelope.proofState?.proofChainHash ?? "",
    integrity: envelope.proofState?.proofIntegrity ?? "degraded",
    createdAt: new Date().toISOString(),
  };
}
