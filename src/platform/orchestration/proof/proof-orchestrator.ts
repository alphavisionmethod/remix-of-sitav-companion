// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Orchestrator (Layer D)
// Canonical "what happened" authority — records and explains
// Never decides. Never executes.
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope, ProofLayerState } from "../shared/orchestration-envelope";
import type { OrchestrationContext } from "../shared/orchestration-context";
import { ReceiptCreationError } from "../shared/orchestration-errors";

export class CanonicalProofOrchestrator {
  /**
   * Record proof for the completed orchestration.
   * Creates receipts, audit trail entries, and event lineage.
   * This layer NEVER decides and NEVER executes — it records.
   */
  async recordProof(
    envelope: OrchestrationEnvelope,
    context: OrchestrationContext
  ): Promise<OrchestrationEnvelope> {
    const receiptId = crypto.randomUUID();
    const auditTrailId = crypto.randomUUID();
    const eventLineageId = crypto.randomUUID();

    // Build proof chain hash from envelope state
    const proofChainHash = await this.computeProofHash(envelope);
    const integrity = this.assessIntegrity(envelope);

    const proofState: ProofLayerState = {
      receiptId,
      auditTrailId,
      eventLineageId,
      proofChainHash,
      proofIntegrity: integrity,
    };

    // If execution happened, record truth record
    if (envelope.executionState) {
      proofState.truthRecordId = crypto.randomUUID();
    }

    return {
      ...envelope,
      proofState,
      currentLayer: "proof",
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

  private async computeProofHash(envelope: OrchestrationEnvelope): Promise<string> {
    const data = JSON.stringify({
      envelopeId: envelope.envelopeId,
      correlationId: envelope.correlationId,
      domain: envelope.domain,
      status: envelope.status,
      intentState: envelope.intentState,
      executionResult: envelope.executionState?.result,
    });

    // Use SubtleCrypto for hash if available, otherwise fallback
    try {
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    } catch {
      // Fallback: simple string hash
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      return `fallback-${Math.abs(hash).toString(16)}`;
    }
  }

  private assessIntegrity(envelope: OrchestrationEnvelope): "full" | "partial" | "degraded" {
    if (!envelope.intentState) return "degraded";
    if (!envelope.planningState) return "partial";
    if (!envelope.executionState) return "partial";
    if (envelope.executionState.result === "failure") return "partial";
    return "full";
  }
}

export const canonicalProofOrchestrator = new CanonicalProofOrchestrator();
