// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Behavioral Proof Barrel
// Canonical exports for AI capability, fallback, refusal, evidence,
// action boundary, prompt drift, routing, receipt, cost, outage,
// autonomy, cross-domain, memory repair, and boardroom scoring.
// Also re-exports ai-platform/runtime for backward compatibility.
// ═══════════════════════════════════════════════════════════════

export * from "@/lib/ai-platform/runtime";

// ── Capability Registry ──
export { AI_CAPABILITY_REGISTRY, getCapability, getCapabilitiesByOwner, getCriticalCapabilities, getCapabilitiesRequiringReceipts } from "./ai-capability-registry";
export type { AICapabilityEntry, EvidenceGrade, ActionBoundarySensitivity, DegradedBehavior } from "./ai-capability-registry";

// ── Fallback Policy ──
export { FALLBACK_POLICIES, REPLAY_FAMILIES, resolveFallback, getFallbackPolicy } from "./ai-fallback-policy";
export type { FallbackTrigger, FallbackResolution, FallbackPolicyEntry } from "./ai-fallback-policy";

// ── Refusal Policy ──
export { REFUSAL_POLICIES, evaluateRefusal, getRefusalPolicy } from "./ai-refusal-policy";
export type { RefusalTrigger, RefusalDecision, RefusalContext } from "./ai-refusal-policy";

// ── Evidence Grade Policy ──
export { AI_SURFACE_EVIDENCE_POLICIES, getSurfacePolicy, getSurfacesByType, isEvidenceGradeSufficient } from "./ai-evidence-grade-policy";
export type { AISurfaceType, AISurfaceEvidencePolicy } from "./ai-evidence-grade-policy";

// ── Action Boundary Tests ──
export { ACTION_BOUNDARY_TESTS, getTestsByCategory, getTestsBySystem, getBlockingTests } from "./ai-action-boundary-tests";
export type { ActionBoundaryTest, BoundaryCategory } from "./ai-action-boundary-tests";

// ── Prompt Drift Detection ──
export { PROMPT_DRIFT_CONFIGS, detectPromptDrift, getDriftConfig } from "./ai-prompt-drift-detection";
export type { PromptDriftConfig, DriftSignal } from "./ai-prompt-drift-detection";

// ── Routing Replay ──
export { ROUTING_REPLAY_FAMILIES, reconstructRoutingDecision, getReplayFamily } from "./ai-routing-replay";
export type { RoutingTrace, RoutingReplayFamily } from "./ai-routing-replay";

// ── Receipt Reconstruction ──
export { RECEIPT_RECONSTRUCTION_MAP, getReconstructionEntry, getDeterministicCapabilities } from "./ai-receipt-reconstruction";
export type { ReceiptReconstructionEntry } from "./ai-receipt-reconstruction";

// ── Cost Anomaly Detection ──
export { AI_COST_ANOMALY_RULES, getAnomalyRulesByType, getCriticalAnomalyRules } from "./ai-cost-anomaly-detector";
export type { AICostAnomalyRule, AICostAnomalyType } from "./ai-cost-anomaly-detector";

// ── Provider Outage Simulation ──
export { OUTAGE_SCENARIOS, simulateOutage } from "./ai-provider-outage-simulator";
export type { OutageScenario, OutageScenarioId, SimulationResult } from "./ai-provider-outage-simulator";

// ── Autonomy Ceiling Policy ──
export { AUTONOMY_CEILING_MAP, enforceAutonomyCeiling, getAutonomyCeiling } from "./ai-autonomy-ceiling-policy";
export type { AutonomyCeilingEntry, AutonomyTier } from "./ai-autonomy-ceiling-policy";

// ── Cross-Domain Restriction Map ──
export { CROSS_DOMAIN_RESTRICTIONS, isCrossDomainAllowed, getCrossDomainRestriction } from "./ai-cross-domain-restriction-map";
export type { CrossDomainRestriction, CrossDomainActionType } from "./ai-cross-domain-restriction-map";

// ── Memory Repair Manager ──
export { MEMORY_REPAIR_ENTRIES, getRepairEntry, getRepairableDomainsRequiringAudit, getSafeRepairDomains } from "./ai-memory-repair-manager";
export type { MemoryRepairEntry } from "./ai-memory-repair-manager";

// ── Boardroom Outcome Scoring ──
export { BOARDROOM_QUALITY_DIMENSIONS, scoreBoardroomOutcome } from "./boardroom-outcome-scoring";
export type { BoardroomQualityDimension, RecommendationOutcome } from "./boardroom-outcome-scoring";
