// ═══════════════════════════════════════════════════════════════
// SITA OS — Backend Plane Public API
// All consumer code MUST import backend capabilities from here.
// Direct imports from @/lib/core-services/ are forbidden.
// ═══════════════════════════════════════════════════════════════

// ── Trust & Approval ──
export { trustEngine } from "@/lib/core-services/trust/trust-engine";
export type { TrustEvaluation, TrustContext, TrustDecision } from "@/lib/core-services/trust/types";
export { approvalEngine } from "@/lib/core-services/approval-engine/approval-engine";
export type { ApprovalRequest, ApprovalDecision } from "@/lib/core-services/approval-engine/types";

// ── AI Gateway ──
export { invokeAICapability, invokeSynthesis, invokeUtility } from "@/lib/ai/ai-capability-client";
export type { TrustEnrichedResponse } from "@/lib/ai/ai-capability-client";

// ── Canonical Execution ──
export { canonicalExecutionPath } from "@/lib/core-services/canonical-execution-path";
export { canonicalChainOrchestrator } from "@/lib/core-services/canonical-chain-orchestrator";

// ── Brain Core ──
export { brainCore } from "@/lib/core-services/brain-core/brain-core";

// ── Capability Router ──
export { capabilityRouter } from "@/lib/core-services/capability-router";

// ── API Gateway ──
export { apiGateway } from "@/lib/core-services/api-gateway";

// ── Analytics ──
export { analyticsService } from "@/lib/core-services/analytics-service";

// ── Billing ──
export { billingService } from "@/lib/core-services/billing-service";

// ── Receipt & Proof ──
export { receiptService } from "@/lib/core-services/receipt-service";
export { proofService } from "@/lib/core-services/proof-service";
