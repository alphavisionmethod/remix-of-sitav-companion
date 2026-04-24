// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Frontend Integration Barrel
// ═══════════════════════════════════════════════════════════════

// State types & helpers
export * from "./ai-state-types";

// Canonical client
export { invokeAICapability, invokeSynthesis, invokeUtility } from "./ai-capability-client";
export type { TrustEnrichedResponse } from "./ai-capability-client";

// Response normalization
export { normalizeGatewayResponse } from "./ai-response-normalizer";

// Surface grammar
export {
  STATE_BADGE_CONFIG,
  LAUNCH_LEVEL_CONFIG,
  DEGRADED_MESSAGES,
  formatFreshness,
  isStale,
} from "./ai-surface-grammar";

// Launch honesty reclassifier
export { reclassifyAIFeatures } from "./ai-launch-honesty-reclassifier";

// Hooks
export { useAICapability } from "./hooks/use-ai-capability";
export { useAdvisorChat } from "./hooks/use-advisor-chat";
export { useBoardroomSummary } from "./hooks/use-boardroom-summary";
export { useDailyPulse } from "./hooks/use-daily-pulse";
export { useAdminSynthesis } from "./hooks/use-admin-synthesis";
export { useUtilityAI } from "./hooks/use-utility-ai";
export { useMemorySummary } from "./hooks/use-memory-summary";
export { useAIRuntimeVerification } from "./hooks/use-ai-runtime-verification";

// Workforce executor
export { executeWorkforceTask } from "./workforce-executor";
export type { WorkforceExecutionRequest, WorkforceExecutionResult } from "./workforce-executor";

// ── Phase 0: Business Advisor Shared Platform ──
export {
  BUSINESS_ADVISORS,
  BUSINESS_ADVISOR_LIST,
  getBusinessAdvisor,
  isBusinessAdvisor,
} from "./business-advisor-registry";
export type {
  BusinessAdvisorId,
  BusinessAdvisorManifest,
  AdvisorAuthorityLevel,
} from "./business-advisor-registry";
export { loadAdvisorContext } from "./advisor-context-loader";
export type { AdvisorContextSlice, AdvisorContextSnapshot } from "./advisor-context-loader";
export {
  askBusinessAdvisor,
  runAdvisorSimulation,
  AdvisorRuntimeError,
} from "./business-advisor-runtime";
export type {
  AdvisorAskRequest,
  AdvisorAskResult,
  AdvisorCitation,
  AdvisorSimulationRequest,
  AdvisorSimulationResult,
} from "./business-advisor-runtime";
