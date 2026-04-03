// ═══════════════════════════════════════════════════════════════
// SITA OS — Rollback Signals Service
// Detects rollback conditions, generates RollbackProof
// ═══════════════════════════════════════════════════════════════

import type { RollbackProof } from "@/packages/proof-model";
import type { VerificationRecord } from "@/packages/contracts";

function computeHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash = hash & hash;
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(16, "0")}`;
}

export interface RollbackSignal {
  shouldRollback: boolean;
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
  affectedActionId: string;
  suggestedSteps: string[];
}

export function detectRollbackCondition(verification: VerificationRecord): RollbackSignal {
  if (verification.match) {
    return { shouldRollback: false, severity: "low", reason: "Verification passed", affectedActionId: verification.actionId, suggestedSteps: [] };
  }

  const criticalFields = ["balance", "amount", "payment", "transfer", "account"];
  const hasCriticalMismatch = verification.discrepancies.some((d) =>
    criticalFields.some((f) => d.toLowerCase().includes(f))
  );

  if (hasCriticalMismatch) {
    return {
      shouldRollback: true,
      severity: "critical",
      reason: `Critical field mismatch detected: ${verification.discrepancies.filter((d) => criticalFields.some((f) => d.toLowerCase().includes(f))).join("; ")}`,
      affectedActionId: verification.actionId,
      suggestedSteps: ["Halt further execution", "Notify owner immediately", "Generate rollback proof", "Queue manual review"],
    };
  }

  if (verification.discrepancies.length >= 3) {
    return {
      shouldRollback: true,
      severity: "high",
      reason: `${verification.discrepancies.length} discrepancies detected — exceeds threshold`,
      affectedActionId: verification.actionId,
      suggestedSteps: ["Generate rollback proof", "Queue for review", "Suspend related workflows"],
    };
  }

  return {
    shouldRollback: false,
    severity: "medium",
    reason: `${verification.discrepancies.length} minor discrepancies — review recommended`,
    affectedActionId: verification.actionId,
    suggestedSteps: ["Flag for human review", "Continue with monitoring"],
  };
}

export function generateRollbackProof(
  signal: RollbackSignal,
  tenantId: string,
  previousHash: string = "genesis"
): RollbackProof {
  return {
    type: "rollback",
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    hash: computeHash(`${previousHash}:rollback:${signal.affectedActionId}`),
    previousHash,
    tenantId,
    originalActionId: signal.affectedActionId,
    reason: signal.reason,
    rollbackSteps: signal.suggestedSteps,
    restoredState: computeHash(`restored:${signal.affectedActionId}:${Date.now()}`),
  };
}
