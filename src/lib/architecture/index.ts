// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Layer Barrel Export
// ═══════════════════════════════════════════════════════════════

// ── 1. Canonical Service Registry ───────────────────────────
export {
  CANONICAL_SERVICES, SERVICE_COUNT,
  getService, getServicesByTier, getAbsorbedServices,
  isCanonicalService, getCanonicalOwner, validateServiceCount,
} from "./canonical-service-registry";
export type { CanonicalService, ServiceTier } from "./canonical-service-registry";

// ── 2. Domain Hierarchy ─────────────────────────────────────
export {
  DOMAIN_HIERARCHY,
  isDomainModule, isSubmoduleOf, getSubmoduleDomain,
  getFormerStandalones, validateNoDomain4,
} from "./domain-hierarchy";
export type { DomainModule, DomainSubmodule } from "./domain-hierarchy";

// ── 3. Canonical Execution Chain (8-stage abstract) ─────────
export {
  EXECUTION_CHAIN,
  validateEnvelope, isStageReachable,
} from "./canonical-execution-chain";
export type {
  ExecutionStage,
  ExecutionEnvelope as AbstractExecutionEnvelope,
  ExecutionReceipt as AbstractExecutionReceipt,
  RefusalReceipt as AbstractRefusalReceipt,
} from "./canonical-execution-chain";

// ── 4. Full 16-Stage Canonical Pipeline ─────────────────────
export {
  PIPELINE_STAGES,
  createPipelineExecution, advancePipeline,
} from "./canonical-pipeline";
export type {
  CanonicalIntent, ResolvedIdentity, PolicyDecision,
  ProposalPackage, ProposalOption, ExecutionMode, ModeDecision,
  FullExecutionEnvelope, ReceiptCategory, FullReceipt,
  PostconditionResult, PostconditionCheck, GovernanceUpdate,
  PipelineStage, PipelineExecution,
} from "./canonical-pipeline";

// ── 5. Immutable Event Taxonomy ─────────────────────────────
export {
  createEvent, filterByCorrelation, filterByClass, replayFrom,
  EVENT_TAXONOMY,
} from "./immutable-event-taxonomy";
export type {
  EventClass, ImmutableEvent, EventStream,
} from "./immutable-event-taxonomy";

// ── 6. Unified Proof Layer ──────────────────────────────────
export {
  createProofRecord, chainProofs,
} from "./unified-proof-layer";
export type { ProofRecord, ProofType, EvidenceGrade, EvidenceBundle, ReplayableProjection } from "./unified-proof-layer";

// ── 7. Unified Memory System ────────────────────────────────
export {
  createMemory, correctMemory, forgetMemory, detectConflict,
} from "./unified-memory-system";
export type { MemoryRecord, MemoryType, PrivacyTier, MemoryConfidence, MemorySource, MemoryConflict, MemoryCorrection } from "./unified-memory-system";

// ── 8. Identity / Role / Relationship Graph ─────────────────
export { cascadeRevocation } from "./identity-relationship-graph";
export type {
  Principal, RoleTemplate, RoleAssignment,
  Permission, PermissionAction, PermissionCondition,
  DelegatedAuthority, HouseholdGraph, HouseholdMember,
  OrganizationGraph, OrgMember, OrgTeam,
  DeviceTrustRecord, RelationshipType, RelationshipEdge,
  PermissionQuery, PermissionResolution, RevocationEvent,
} from "./identity-relationship-graph";

// ── 9. Workflow State Machine ───────────────────────────────
export {
  WORKFLOW_TRANSITIONS,
  canTransition, getValidTransitions, getTransitionDef,
  isTerminal, isFailureState, transition, createWorkflow,
} from "./workflow-state-machine";
export type { WorkflowState, WorkflowTransition, WorkflowInstance, WorkflowTransitionLog } from "./workflow-state-machine";

// ── 10. Exception & Recovery ────────────────────────────────
export {
  createException, createRecoveryPlan,
} from "./exception-recovery";
export type {
  ExceptionCategory, ExceptionSeverity, RecoveryStrategy,
  TypedException, RecoveryPlan, RecoveryStep,
  CompensationRecord, PostmortemReceipt,
} from "./exception-recovery";

// ── 11. Policy Versioning ───────────────────────────────────
export {
  hashPolicyBundle, classifyChange, createPolicyChange,
} from "./policy-versioning";
export type {
  PolicyEnvironment, PolicyChangeType, PolicyRule, PolicyBundle,
  PolicyChange, PolicyRegressionTest,
} from "./policy-versioning";

// ── 12. Capability Contract System ──────────────────────────
export {
  resolveApprovalTier, validateCapabilityContract,
} from "./capability-contract-system";
export type {
  CapabilityRiskClass, ApprovalRequirement, CapabilityContract,
  CapabilityInput, EvidenceRequirement, ConnectorBinding,
  RetryConfig, RollbackConfig, BudgetProfile, ApprovalTierInput,
  ResolvedApprovalTier,
} from "./capability-contract-system";

// ── 13. Risk-Tiered Approval ────────────────────────────────
export { resolveApproval } from "./approval-tiers";
export type {
  ApprovalClass, ApprovalContext, ApprovalDecision,
  FinancialApprovalThresholds,
} from "./approval-tiers";

// ── 14. Connector Governance ────────────────────────────────
export {
  certifyConnector, killConnector, validateConnectorAction,
} from "./connector-governance";
export type {
  ConnectorStatus, ConnectorManifest, ConnectorPolicyOverlay,
  ConnectorHealthReport,
} from "./connector-governance";

// ── 15. Cost & Token Governance ─────────────────────────────
export { routeModel, checkBudget } from "./cost-token-governance";
export type {
  BudgetScope, ModelTier, BudgetPolicy, BudgetUsage,
  ModelRoutingDecision, ConnectorCostRecord,
} from "./cost-token-governance";

// ── 16. Truth Validation ────────────────────────────────────
export {
  validateTruthClaim, canExecuteBasedOnEvidence,
  wrapModelOutput, promoteToFact,
} from "./truth-validation";
export type {
  TruthSource, CertaintyLevel, TruthEnvelope, ActionRecommendation,
} from "./truth-validation";

// ── 17. Observability & Diagnostics ─────────────────────────
export { createExplanation } from "./observability-diagnostics";
export type {
  ExecutionTrace, TraceStage, PolicyTrace, AdvisorLog,
  ConnectorHealthDashboard, UserExplanation, OperatorDiagnostic,
} from "./observability-diagnostics";

// ── 18. Boardroom Architecture ──────────────────────────────
export { createActionPackage } from "./boardroom-architecture";
export type {
  BoardroomSession, BoardroomParticipant, BoardroomProposal,
  BoardroomDissent, BoardroomSimulation, BoardroomDecision,
  BoardroomMinutes, FollowThroughItem, BoardroomActionPackage,
} from "./boardroom-architecture";

// ── 19. Multi-Tenant Sovereignty ────────────────────────────
export {
  validateTenantIsolation, scopeQuery, createTenantSafeView,
} from "./tenant-sovereignty";
export type { TenantBoundary, TenantScope, TenantSafeView } from "./tenant-sovereignty";

// ── 20. Advisor Orchestration ───────────────────────────────
export { routeToAdvisors, synthesizeCouncil } from "./advisor-orchestration";
export type {
  AdvisorDeclaration, CouncilSession, AdvisorParticipation,
  CouncilSynthesis, AdvisorRoutingRule,
} from "./advisor-orchestration";

// ── 21. Self-Learning Constraints ───────────────────────────
export { validateLearningAction, createLearningProposal } from "./self-learning-constraints";
export type { LearningAction, LearningProposal } from "./self-learning-constraints";

// ── 22. OS Unification Layer ────────────────────────────────
export {
  WEB_SURFACE_CONTRACT, MOBILE_SURFACE_CONTRACT, ADMIN_SURFACE_CONTRACT,
  DOMAIN_MODULE_CONTRACT,
  validateSurfaceCompliance, validateDomainCompliance,
} from "./os-unification-layer";
export type {
  PlatformContract, PlatformContractCategory,
  SurfaceType, SurfaceContract, DomainModuleContract,
} from "./os-unification-layer";

// ── 23. Phased Rollout Plan ─────────────────────────────────
export {
  ROLLOUT_PLAN,
  getPhaseItems, getP0Items, checkDependenciesMet, getReadinessScore,
} from "./phased-rollout-plan";
export type { RolloutPhase, RolloutPriority, RolloutItem } from "./phased-rollout-plan";
