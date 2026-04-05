// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Intelligence Layer Barrel Export
// ═══════════════════════════════════════════════════════════════

export * from "./types";
export * from "./specializations";
export { buildRetrievalPlan, assembleBriefingPacket, buildEvidenceBundle } from "./context-assembler";
export { verifyRecommendation, verifyCouncilRecommendations, detectCrossAdvisorContradictions } from "./recommendation-verifier";
export { runCouncilDeliberation, computeCalibrationUpdate } from "./council-deliberation";
