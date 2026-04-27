// ═══════════════════════════════════════════════════════════════
// SITA OS — useOrchestrationProof Hook
// Read-only hook for proof/receipt/audit inspection
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { orchestrationFacade } from "@/platform/orchestration";

export function useOrchestrationProof() {
  const truthRecord = useMemo(() => orchestrationFacade.getLastTruthRecord(), []);
  const lastResult = useMemo(() => orchestrationFacade.getLastResult(), []);

  return {
    truthRecord,
    receipt: truthRecord?.receipt ?? null,
    auditTrail: truthRecord?.auditTrail ?? [],
    lineage: truthRecord?.lineage ?? [],
    reversibility: truthRecord?.reversibility ?? null,
    approvalProof: truthRecord?.approvalProof ?? null,
    proofHash: truthRecord?.proofHash ?? null,
    integrity: truthRecord?.integrity ?? "degraded",
    lastOutcome: lastResult?.outcome ?? null,
  };
}
