// ════════════════════════════════════════════════════════════
// SITA OS — useTrustEmit hook (Phase 3)
// Pillar-side ergonomic wrapper around the Trust layer so
// components can fire receipts without importing supabase.
// ════════════════════════════════════════════════════════════

import { useCallback } from "react";
import {
  emitTrustReceipt,
  openTrustApproval,
  type TrustReceiptInput,
  type ApprovalRequestInput,
} from "@/modules/_trust";

export function useTrustEmit() {
  const receipt = useCallback(
    (input: TrustReceiptInput) => emitTrustReceipt(input),
    [],
  );
  const approval = useCallback(
    (input: ApprovalRequestInput) => openTrustApproval(input),
    [],
  );
  return { receipt, approval };
}
