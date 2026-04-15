// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Orchestration Barrel
// Exports facade + all layer types
// ═══════════════════════════════════════════════════════════════

// ── Facade (THE entry point) ──
export { OrchestrationFacade, orchestrationFacade } from "./orchestration-facade";
export type { ProcessIntentRequest } from "./orchestration-facade";

// ── Shared Types ──
export type { OrchestrationLayer, OrchestrationDomain, OrchestrationPriority, OrchestrationStatus, OrchestrationClassEntry } from "./shared/orchestration-types";
export { ORCHESTRATION_CLASSES, LAYER_ORDER, isLayerTransitionValid, getClassForLayer } from "./shared/orchestration-types";

export type { OrchestrationEnvelope, IntentLayerState, PlanningLayerState, ExecutionLayerState, ProofLayerState, PlannedStep, PolicySnapshot } from "./shared/orchestration-envelope";
export { createOrchestrationEnvelope, advanceEnvelopeLayer } from "./shared/orchestration-envelope";

export type { OrchestrationContext, UserContext, TrustContext, CapabilityContext, SurfaceContext, DomainContext, PermissionContext, ProvenanceContext } from "./shared/orchestration-context";
export { createDefaultContext } from "./shared/orchestration-context";

export type { OrchestrationResult, OrchestrationOutcome, IntentOutcome, PlanningOutcome, ExecutionOutcome, ProofOutcome } from "./shared/orchestration-result";

export { evaluateTransition, DEFAULT_TRANSITION_POLICIES, buildPolicySnapshot } from "./shared/orchestration-policy";
export type { TransitionPolicy, TransitionEvaluation, TransitionDecision } from "./shared/orchestration-policy";

// ── Error types ──
export {
  OrchestrationError, IntentParsingError, IntentClassificationError, EscalationError,
  PlanConstructionError, DependencyResolutionError, ApprovalDeniedError,
  ExecutionFailedError, ConnectorError, RollbackError, RetryExhaustedError,
  ReceiptCreationError, ProofIntegrityError, PolicyViolationError, BudgetExceededError,
} from "./shared/orchestration-errors";

// ── Registry ──
export { LEGACY_ORCHESTRATOR_MAP, getLegacyEntry, getEntriesByLayer, getMigrationReport } from "./shared/orchestration-registry";
export type { LegacyOrchestratorEntry, MigrationStatus } from "./shared/orchestration-registry";

// ── Intent Layer ──
export { canonicalIntentOrchestrator } from "./intent/intent-orchestrator";
export { routeDecision } from "./intent/decision-router";
export { prioritizeRecommendations } from "./intent/recommendation-prioritizer";
export { selectIssues } from "./intent/issue-selection-engine";
export { selectOpportunities } from "./intent/opportunity-selection-engine";
export { evaluateEscalation } from "./intent/escalation-router";

// ── Planning Layer ──
export { canonicalPlanningOrchestrator } from "./planning/planning-orchestrator";
export { buildWorkflowPlan, reorderByDependencies } from "./planning/workflow-planner";
export { runPlanSimulation } from "./planning/simulation-planner";
export { resolveDependencies } from "./planning/dependency-resolver";
export { buildApprovalPackage } from "./planning/approval-package-builder";
export { buildActionPlan } from "./planning/action-plan-builder";
export { buildContingencyPlan } from "./planning/contingency-planner";

// ── Execution Layer ──
export { canonicalExecutionOrchestrator } from "./execution/execution-orchestrator";
export { resolveExecutionRoute } from "./execution/execution-router";
export { executeConnector } from "./execution/connector-executor";
export { dispatchJob } from "./execution/job-dispatcher";
export { runWorkflowStep } from "./execution/workflow-step-runner";
export { withRetry, DEFAULT_RETRY_CONFIG } from "./execution/retry-engine";
export { executeRollback } from "./execution/rollback-engine";
export { checkPostconditions } from "./execution/postcondition-checker";

// ── Proof Layer ──
export { canonicalProofOrchestrator } from "./proof/proof-orchestrator";
export { buildReceipt } from "./proof/receipt-builder";
export { buildAuditTrail } from "./proof/audit-trail-writer";
export { buildEventLineage } from "./proof/event-lineage-builder";
export { buildApprovalProof } from "./proof/approval-proof-builder";
export { buildReversibilityRecord } from "./proof/reversibility-writer";
export { buildTruthRecord } from "./proof/truth-record-builder";

// ── Layer type barrels ──
export type * from "./intent/intent-types";
export type * from "./planning/planning-types";
export type * from "./execution/execution-types";
export type * from "./proof/proof-types";
