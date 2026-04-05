// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Intelligence Layer Barrel Export
// ═══════════════════════════════════════════════════════════════

export * from "./types";
export * from "./specializations";
export { buildRetrievalPlan, assembleBriefingPacket, buildEvidenceBundle } from "./context-assembler";
export { verifyRecommendation, verifyCouncilRecommendations, detectCrossAdvisorContradictions } from "./recommendation-verifier";
export { runCouncilDeliberation, computeCalibrationUpdate } from "./council-deliberation";
export { computeCalibratedConfidence, computeEvidenceSufficiency, computeReliabilityForBucket } from "./confidence-model-v2";
export type { CalibratedConfidence, ConfidenceFactors, AdvisorReliabilityRecord } from "./confidence-model-v2";
export { scoreMemoryReliability, evaluateMemoryTransition, resolveMemoryConflict, detectPoisoningSignals, getTTLPolicy, MEMORY_TTL_POLICIES } from "./memory-lifecycle";
export type { AdvisorMemoryRecord, MemoryConflict, MemoryTransition } from "./memory-lifecycle";
export { classifyHallucinationSeverity, runVerificationDecisionTree, evaluateAbstentionRules, ANTI_HALLUCINATION_CONTROLS, VERIFICATION_DECISION_TREE, ABSTENTION_RULES } from "./hallucination-taxonomy";
export type { HallucinationIncident, HallucinationType } from "./hallucination-taxonomy";
export { gradeEvalScenario, evaluateMaturityPromotion, HALLUCINATION_RED_TEAM_SCENARIOS, CALIBRATION_EVAL_SCENARIOS, MATURITY_GATES } from "./evaluation-framework";
export type { EvalScenario, EvalResult, EvalSuiteResult } from "./evaluation-framework";
export { isAdvisorActive, shouldShowOutput, selectModel, isPreferenceUsable, computeReputation, classifyIncidentSeverity, evaluateDegradedMode, STRATEGIC_MODE_CONFIGS, DEFAULT_PERSONALIZATION_POLICY } from "./operational-safeguards";
export type { AdvisorOperationalState, StrategicMode, UserPreference, AdvisorReputation, RecommendationIncident, DegradedModeState } from "./operational-safeguards";
