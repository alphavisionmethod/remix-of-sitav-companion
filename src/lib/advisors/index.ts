// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Runtime Contracts Barrel
// Canonical import: @/lib/advisors
// ═══════════════════════════════════════════════════════════════

export * from "./advisor-identity-registry";
export * from "./advisor-persona-boundary-map";
export * from "./advisor-debate-orchestrator";
export * from "./advisor-conflict-resolution-policy";
export * from "./advisor-confidence-policy";
export * from "./advisor-disablement-policy";
export * from "./advisor-memory-aging-policy";
export * from "./advisor-reflection-policy-loop";
export * from "./advisor-override-model";
export * from "./advisor-support-diagnostics";

// Re-export canonical upstream contracts
export { ADVISOR_PERMISSION_MATRIX, isActionAllowed } from "@/lib/ai-platform/runtime/advisor-permission-matrix";
export { ESCALATION_RULES, shouldEscalate } from "@/lib/ai-platform/runtime/advisor-escalation-policy";
export { REVERSIBILITY_MAP, getReversibility, isReversible } from "@/lib/ai-platform/runtime/advisor-reversibility-map";