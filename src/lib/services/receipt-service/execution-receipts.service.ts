// ═══════════════════════════════════════════════════════════════
// SITA OS — Execution Receipts Service
// Generates ExecutionProof from completed execution envelopes
// ═══════════════════════════════════════════════════════════════

import type { ExecutionProof } from "@/packages/proof-model";
import type { ExecutionEnvelope } from "../executor-service/execute-action.service";

function computeHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash = hash & hash;
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(16, "0")}`;
}

export function generateExecutionReceipt(
  envelope: ExecutionEnvelope,
  tenantId: string,
  previousHash: string = "genesis"
): ExecutionProof {
  const inputHash = computeHash(JSON.stringify(envelope.input));
  const resultHash = computeHash(JSON.stringify(envelope.output || {}));

  return {
    type: "execution",
    id: crypto.randomUUID(),
    timestamp: envelope.completedAt || new Date().toISOString(),
    hash: computeHash(`${previousHash}:${envelope.id}:${inputHash}:${resultHash}`),
    previousHash,
    tenantId,
    envelopeId: envelope.id,
    capabilityId: envelope.capabilityId,
    mode: envelope.mode,
    inputHash,
    resultHash,
    durationMs: envelope.durationMs || 0,
  };
}

export function generateBatchExecutionReceipts(
  envelopes: ExecutionEnvelope[],
  tenantId: string
): ExecutionProof[] {
  let previousHash = "genesis";
  return envelopes.map((env) => {
    const receipt = generateExecutionReceipt(env, tenantId, previousHash);
    previousHash = receipt.hash;
    return receipt;
  });
}

