// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Frontend Integration Barrel
// ═══════════════════════════════════════════════════════════════

// State types & helpers
export * from "./ai-state-types";

// Canonical client
export { invokeAICapability, invokeSynthesis, invokeUtility } from "./ai-capability-client";

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
