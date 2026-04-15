// ═══════════════════════════════════════════════════════════════
// SITA OS — Backend Plane Public API
// All consumer code MUST import backend capabilities from here.
// Direct imports from @/lib/core-services/ are forbidden.
// ═══════════════════════════════════════════════════════════════

// ── Trust & Approval ──
export * from "@/lib/core-services/approval-engine";
export { ReceiptService } from "@/lib/core-services/receipt-service";
export type { Receipt, ProofPack } from "@/lib/core-services/receipt-service";

// ── AI Gateway ──
export { invokeAICapability, invokeSynthesis, invokeUtility } from "@/lib/ai/ai-capability-client";
export type { TrustEnrichedResponse } from "@/lib/ai/ai-capability-client";

// ── Canonical Execution ──
export { CANONICAL_EXECUTION_STAGES } from "@/lib/core-services/canonical-execution-path";
export type { CanonicalStage, ExecutionPathRecord } from "@/lib/core-services/canonical-execution-path";
export { CanonicalChainOrchestrator, createCanonicalChain } from "@/lib/core-services/canonical-chain-orchestrator";

// ── Brain Core ──
export * from "@/lib/core-services/brain-core";

// ── Capability Router ──
export { CapabilityRouter } from "@/lib/core-services/capability-router";

// ── API Gateway ──
export type { GatewayRoute, GatewayRequest } from "@/lib/core-services/api-gateway";

// ── Analytics ──
export type { Metric, MetricAggregation, UsageReport } from "@/lib/core-services/analytics-service";

// ── Billing ──
export type { BillingAccount, BillingLimits } from "@/lib/core-services/billing-service";
