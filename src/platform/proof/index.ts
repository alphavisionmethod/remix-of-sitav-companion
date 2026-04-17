// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Barrel: Proof (consumer)
// Canonical import path: @/platform/proof
// ═══════════════════════════════════════════════════════════════

export * from "@/lib/services/projections/proof/proof-projection.service";
export * from "@/lib/services/receipt-service/proof-bundles.service";
export * from "@/lib/orchestration/proof/proof-types";
export * from "@/lib/orchestration/proof/proof-orchestrator";

// Layer 3 truth re-exports
export * from "@/lib/platform/proof";
