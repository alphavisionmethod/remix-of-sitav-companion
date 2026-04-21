// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Routing Replay
// Deterministic reconstruction of routing decisions from receipts.
// Uses ai_inference_receipts, ai_fallback_events, ai_usage_ledger.
// ═══════════════════════════════════════════════════════════════

export interface RoutingTrace {
  receiptId: string;
  capabilityId: string | null;
  modelSelected: string;
  provider: string | null;
  fallbackTriggered: boolean;
  fallbackReason: string | null;
  budgetCheckResult: string | null;
  promptFamily: string | null;
  promptVersion: string | null;
  costEstimateCents: number | null;
  latencyMs: number | null;
  status: string | null;
}

export type ReconstructionMethod = "ledger-join" | "receipt-direct" | "inference-chain";

export interface RoutingReplayFamily {
  capabilityId: string;
  reconstructionMethod: ReconstructionMethod;
  requiredTables: readonly string[];
  supportsFullReplay: boolean;
}

export const ROUTING_REPLAY_FAMILIES: readonly RoutingReplayFamily[] = [
  { capabilityId: "advisor.money", reconstructionMethod: "ledger-join", requiredTables: ["ai_inference_receipts", "ai_fallback_events", "ai_usage_ledger", "ai_invocations"], supportsFullReplay: true },
  { capabilityId: "advisor.business", reconstructionMethod: "ledger-join", requiredTables: ["ai_inference_receipts", "ai_fallback_events", "ai_usage_ledger", "ai_invocations"], supportsFullReplay: true },
  { capabilityId: "advisor.concierge", reconstructionMethod: "ledger-join", requiredTables: ["ai_inference_receipts", "ai_fallback_events", "ai_usage_ledger", "ai_invocations"], supportsFullReplay: true },
  { capabilityId: "advisor.strategy", reconstructionMethod: "ledger-join", requiredTables: ["ai_inference_receipts", "ai_fallback_events", "ai_usage_ledger", "ai_invocations"], supportsFullReplay: true },
  { capabilityId: "advisor.security", reconstructionMethod: "ledger-join", requiredTables: ["ai_inference_receipts", "ai_fallback_events", "ai_usage_ledger", "ai_invocations"], supportsFullReplay: true },
  { capabilityId: "advisor.legal", reconstructionMethod: "ledger-join", requiredTables: ["ai_inference_receipts", "ai_fallback_events", "ai_usage_ledger", "ai_invocations"], supportsFullReplay: true },
  { capabilityId: "advisor.tax", reconstructionMethod: "ledger-join", requiredTables: ["ai_inference_receipts", "ai_fallback_events", "ai_usage_ledger", "ai_invocations"], supportsFullReplay: true },
  { capabilityId: "boardroom.synthesis", reconstructionMethod: "ledger-join", requiredTables: ["ai_inference_receipts", "ai_fallback_events", "ai_usage_ledger", "ai_invocations"], supportsFullReplay: true },
  { capabilityId: "boardroom.debate", reconstructionMethod: "ledger-join", requiredTables: ["ai_inference_receipts", "ai_fallback_events", "ai_usage_ledger", "ai_invocations"], supportsFullReplay: true },
  { capabilityId: "simulation.monte-carlo", reconstructionMethod: "receipt-direct", requiredTables: ["ai_inference_receipts", "ai_invocations"], supportsFullReplay: true },
  { capabilityId: "admin.intelligence", reconstructionMethod: "receipt-direct", requiredTables: ["ai_inference_receipts", "ai_invocations"], supportsFullReplay: true },
  { capabilityId: "gateway.general", reconstructionMethod: "receipt-direct", requiredTables: ["ai_inference_receipts"], supportsFullReplay: false },
  { capabilityId: "files.ai-processing", reconstructionMethod: "receipt-direct", requiredTables: ["ai_inference_receipts"], supportsFullReplay: false },
  { capabilityId: "brain.personal", reconstructionMethod: "inference-chain", requiredTables: ["ai_invocations"], supportsFullReplay: false },
  { capabilityId: "brain.core", reconstructionMethod: "inference-chain", requiredTables: ["ai_invocations"], supportsFullReplay: false },
];

export function reconstructRoutingDecision(receiptFields: {
  id: string;
  model: string;
  provider?: string | null;
  capability_id?: string | null;
  route_reason?: string | null;
  prompt_family?: string | null;
  cost_estimate_cents?: number | null;
  latency_ms?: number | null;
  status?: string | null;
  verification_outcome?: string | null;
}): RoutingTrace {
  const isFallback = receiptFields.route_reason?.includes("fallback") ?? false;
  return {
    receiptId: receiptFields.id,
    capabilityId: receiptFields.capability_id ?? null,
    modelSelected: receiptFields.model,
    provider: receiptFields.provider ?? null,
    fallbackTriggered: isFallback,
    fallbackReason: isFallback ? receiptFields.route_reason : null,
    budgetCheckResult: receiptFields.verification_outcome ?? null,
    promptFamily: receiptFields.prompt_family ?? null,
    promptVersion: null,
    costEstimateCents: receiptFields.cost_estimate_cents ?? null,
    latencyMs: receiptFields.latency_ms ?? null,
    status: receiptFields.status ?? null,
  };
}

export function getReplayFamily(capabilityId: string): RoutingReplayFamily | undefined {
  return ROUTING_REPLAY_FAMILIES.find((f) => f.capabilityId === capabilityId);
}