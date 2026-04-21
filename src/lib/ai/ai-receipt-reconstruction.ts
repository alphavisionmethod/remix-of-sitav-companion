// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Receipt Reconstruction
// Deterministic reconstruction contract for AI actions.
// Cross-references ai-trust-enforcer.ts receipt structure.
// ═══════════════════════════════════════════════════════════════

export type ReconstructionMethod = "ledger-join" | "receipt-direct" | "inference-chain";

export interface ReceiptReconstructionEntry {
  capabilityId: string;
  tables: readonly string[];
  requiredFields: readonly string[];
  reconstructionMethod: ReconstructionMethod;
  supportsDeterministicReconstruction: boolean;
}

export const RECEIPT_RECONSTRUCTION_MAP: readonly ReceiptReconstructionEntry[] = [
  { capabilityId: "advisor.money", tables: ["ai_inference_receipts", "ai_invocations", "ai_usage_ledger", "ai_action_receipts", "ai_fallback_events"], requiredFields: ["model", "provider", "prompt_family", "cost_estimate_cents", "capability_id", "status"], reconstructionMethod: "ledger-join", supportsDeterministicReconstruction: true },
  { capabilityId: "advisor.business", tables: ["ai_inference_receipts", "ai_invocations", "ai_usage_ledger", "ai_action_receipts", "ai_fallback_events"], requiredFields: ["model", "provider", "prompt_family", "cost_estimate_cents", "capability_id", "status"], reconstructionMethod: "ledger-join", supportsDeterministicReconstruction: true },
  { capabilityId: "advisor.concierge", tables: ["ai_inference_receipts", "ai_invocations", "ai_usage_ledger", "ai_action_receipts"], requiredFields: ["model", "provider", "prompt_family", "cost_estimate_cents", "status"], reconstructionMethod: "ledger-join", supportsDeterministicReconstruction: true },
  { capabilityId: "advisor.strategy", tables: ["ai_inference_receipts", "ai_invocations", "ai_usage_ledger", "ai_action_receipts", "ai_fallback_events"], requiredFields: ["model", "provider", "prompt_family", "cost_estimate_cents", "capability_id", "status"], reconstructionMethod: "ledger-join", supportsDeterministicReconstruction: true },
  { capabilityId: "advisor.security", tables: ["ai_inference_receipts", "ai_invocations", "ai_usage_ledger"], requiredFields: ["model", "provider", "capability_id", "status"], reconstructionMethod: "ledger-join", supportsDeterministicReconstruction: true },
  { capabilityId: "advisor.legal", tables: ["ai_inference_receipts", "ai_invocations", "ai_usage_ledger"], requiredFields: ["model", "provider", "prompt_family", "capability_id", "status"], reconstructionMethod: "ledger-join", supportsDeterministicReconstruction: true },
  { capabilityId: "advisor.tax", tables: ["ai_inference_receipts", "ai_invocations", "ai_usage_ledger"], requiredFields: ["model", "provider", "prompt_family", "capability_id", "status"], reconstructionMethod: "ledger-join", supportsDeterministicReconstruction: true },
  { capabilityId: "boardroom.synthesis", tables: ["ai_inference_receipts", "ai_invocations", "ai_usage_ledger", "ai_action_receipts"], requiredFields: ["model", "provider", "prompt_family", "cost_estimate_cents", "capability_id", "status"], reconstructionMethod: "ledger-join", supportsDeterministicReconstruction: true },
  { capabilityId: "boardroom.debate", tables: ["ai_inference_receipts", "ai_invocations", "ai_usage_ledger"], requiredFields: ["model", "provider", "prompt_family", "status"], reconstructionMethod: "ledger-join", supportsDeterministicReconstruction: true },
  { capabilityId: "simulation.monte-carlo", tables: ["ai_inference_receipts", "ai_invocations"], requiredFields: ["model", "provider", "status"], reconstructionMethod: "receipt-direct", supportsDeterministicReconstruction: true },
  { capabilityId: "brain.personal", tables: ["ai_invocations"], requiredFields: ["model", "status"], reconstructionMethod: "inference-chain", supportsDeterministicReconstruction: false },
  { capabilityId: "brain.core", tables: ["ai_invocations"], requiredFields: ["model", "status"], reconstructionMethod: "inference-chain", supportsDeterministicReconstruction: false },
  { capabilityId: "admin.intelligence", tables: ["ai_inference_receipts", "ai_invocations"], requiredFields: ["model", "provider", "status"], reconstructionMethod: "receipt-direct", supportsDeterministicReconstruction: true },
  { capabilityId: "gateway.general", tables: ["ai_inference_receipts"], requiredFields: ["model", "status"], reconstructionMethod: "receipt-direct", supportsDeterministicReconstruction: false },
  { capabilityId: "files.ai-processing", tables: ["ai_inference_receipts", "ai_invocations"], requiredFields: ["model", "provider", "status"], reconstructionMethod: "receipt-direct", supportsDeterministicReconstruction: true },
];

export function getReconstructionEntry(capabilityId: string): ReceiptReconstructionEntry | undefined {
  return RECEIPT_RECONSTRUCTION_MAP.find((e) => e.capabilityId === capabilityId);
}

export function getDeterministicCapabilities(): string[] {
  return RECEIPT_RECONSTRUCTION_MAP.filter((e) => e.supportsDeterministicReconstruction).map((e) => e.capabilityId);
}