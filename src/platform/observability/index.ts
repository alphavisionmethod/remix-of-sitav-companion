// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Barrel: Observability (consumer)
// Canonical import: @/platform/observability
// ═══════════════════════════════════════════════════════════════

export * from "@/hooks/useOrchestrationHealth";

// Layer 3 truth re-exports — uses the lib wrapper which forwards to canonical
export * from "@/lib/platform/observability/index";
