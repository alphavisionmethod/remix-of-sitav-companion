// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Runtime Contracts Package
// Unified import surface for advisor governance contracts.
// ═══════════════════════════════════════════════════════════════

// Typed context
export type { AdvisorRuntimeContext } from "./types";
export { resolveAdvisorContext } from "./resolver";

// Identity & Persona
export { ADVISOR_IDENTITIES, getAdvisorIdentity, getDisabledFallback } from "@/lib/advisors/advisor-identity-registry";
export type { AdvisorIdentity } from "@/lib/advisors/advisor-identity-registry";
export { PERSONA_BOUNDARIES, getPersonaBoundary, isDomainFenced } from "@/lib/advisors/advisor-persona-boundary-map";

// Confidence & Debate
export { CONFIDENCE_GATES, evaluateConfidenceGate } from "@/lib/advisors/advisor-confidence-policy";
export { DEFAULT_DEBATE_POLICY, resolveDebate } from "@/lib/advisors/advisor-debate-orchestrator";
export { CONFLICT_RESOLUTION_RULES, resolveConflict } from "@/lib/advisors/advisor-conflict-resolution-policy";

// Memory & Reflection
export { MEMORY_AGING_RULES, getAgingRule, shouldPromote, shouldExpire } from "@/lib/advisors/advisor-memory-aging-policy";
export { deriveAdjustments } from "@/lib/advisors/advisor-reflection-policy-loop";

// Disablement & Override
export { DISABLEMENT_POLICIES, getDisablementPolicy } from "@/lib/advisors/advisor-disablement-policy";
export { OVERRIDE_ACTIONS, getOverrideAction, requiresDualApproval } from "@/lib/advisors/advisor-override-model";

// Support
export { createEmptyDiagnosticSnapshot } from "@/lib/advisors/advisor-support-diagnostics";
export type { AdvisorDiagnosticSnapshot, AdvisorSupportBundle } from "@/lib/advisors/advisor-support-diagnostics";

// Permissions, Escalation, Reversibility (from ai-platform/runtime)
export { ADVISOR_PERMISSION_MATRIX, isActionAllowed } from "@/lib/ai-platform/runtime/advisor-permission-matrix";
export { ESCALATION_RULES, shouldEscalate } from "@/lib/ai-platform/runtime/advisor-escalation-policy";
export { REVERSIBILITY_MAP, getReversibility, isReversible } from "@/lib/ai-platform/runtime/advisor-reversibility-map";