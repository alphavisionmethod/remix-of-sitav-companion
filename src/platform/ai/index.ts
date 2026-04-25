// ═══════════════════════════════════════════════════════════════════
// SITA OS — Shared AI Orchestration barrel (Phase 4)
// Canonical import: @/modules/_shared/ai
// ═══════════════════════════════════════════════════════════════════

export {
  useOrchestrator,
  callOrchestrator,
  isBlocked,
  type OrchestratorMode,
  type OrchestratorMessage,
  type OrchestratorRequest,
  type OrchestratorResponse,
  type OrchestratorBlocked,
  type OrchestratorOutcome,
  type OrchestratorContextSources,
} from "./useOrchestrator";

export {
  useInvocationPlan,
  useExplainabilityTraces,
  useRecentInvocations,
  EXPLAINABILITY_QUERY_KEY,
  type ExplainabilityTraceRow,
  type InvocationPlanRow,
} from "./use-explainability";

export { ExplainabilityPanel } from "./ExplainabilityPanel";