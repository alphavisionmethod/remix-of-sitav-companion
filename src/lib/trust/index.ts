// ═══════════════════════════════════════════════════════════════
// SITA OS — Client-Side Trust Helpers (canonical barrel)
// Import from `@/lib/trust`. Do NOT import from individual files
// outside this directory — these helpers are the single source of
// truth for in-app trust emission.
// ═══════════════════════════════════════════════════════════════

export {
  emitClientReceipt,
  emitClientFailureReceipt,
  type EmitClientReceiptOptions,
  type EmitClientReceiptResult,
  type EmitClientFailureReceiptOptions,
  type ClientReceiptStatus,
  type ClientReceiptRiskTier,
} from "./emit-client-receipt";

export {
  requestApproval,
  withApprovalGate,
  type RequestApprovalOptions,
  type RequestApprovalResult,
  type WithApprovalGateOptions,
  type ApprovalGateResult,
  type ApprovalQueuePriority,
} from "./request-approval";

export {
  receiptRowToProofEntry,
  type ProofEntry,
  type ProofActorType,
  type ProofActionKind,
} from "./proof-entry";