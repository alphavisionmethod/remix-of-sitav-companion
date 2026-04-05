// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Layer Barrel Export
// ═══════════════════════════════════════════════════════════════

// ── Canonical Service Registry ──────────────────────────────
export {
  CANONICAL_SERVICES, SERVICE_COUNT,
  getService, getServicesByTier, getAbsorbedServices,
  isCanonicalService, getCanonicalOwner, validateServiceCount,
} from "./canonical-service-registry";
export type { CanonicalService, ServiceTier } from "./canonical-service-registry";

// ── Domain Hierarchy ────────────────────────────────────────
export {
  DOMAIN_HIERARCHY,
  isDomainModule, isSubmoduleOf, getSubmoduleDomain,
  getFormerStandalones, validateNoDomain4,
} from "./domain-hierarchy";
export type { DomainModule, DomainSubmodule } from "./domain-hierarchy";

// ── Canonical Execution Chain ───────────────────────────────
export {
  EXECUTION_CHAIN,
  validateEnvelope, isStageReachable,
} from "./canonical-execution-chain";
export type { ExecutionStage, ExecutionEnvelope, ExecutionReceipt, RefusalReceipt } from "./canonical-execution-chain";

// ── Unified Proof Layer ─────────────────────────────────────
export {
  createProofRecord, chainProofs,
} from "./unified-proof-layer";
export type { ProofRecord, ProofType, EvidenceGrade, EvidenceBundle, ReplayableProjection } from "./unified-proof-layer";

// ── Unified Memory System ───────────────────────────────────
export {
  createMemory, correctMemory, forgetMemory, detectConflict,
} from "./unified-memory-system";
export type { MemoryRecord, MemoryType, PrivacyTier, MemoryConfidence, MemorySource, MemoryConflict, MemoryCorrection } from "./unified-memory-system";

// ── Workflow State Machine ──────────────────────────────────
export {
  WORKFLOW_TRANSITIONS,
  canTransition, getValidTransitions, getTransitionDef,
  isTerminal, isFailureState, transition, createWorkflow,
} from "./workflow-state-machine";
export type { WorkflowState, WorkflowTransition, WorkflowInstance, WorkflowTransitionLog } from "./workflow-state-machine";

// ── Exception & Recovery ────────────────────────────────────
export {
  createException, createRecoveryPlan,
} from "./exception-recovery";
export type {
  ExceptionCategory, ExceptionSeverity, RecoveryStrategy,
  TypedException, RecoveryPlan, RecoveryStep,
  CompensationRecord, PostmortemReceipt,
} from "./exception-recovery";

// ── Policy Versioning ───────────────────────────────────────
export {
  hashPolicyBundle, classifyChange, createPolicyChange,
} from "./policy-versioning";
export type {
  PolicyEnvironment, PolicyChangeType, PolicyRule, PolicyBundle,
  PolicyChange, PolicyRegressionTest,
} from "./policy-versioning";

// ── Capability Contract System ──────────────────────────────
export {
  resolveApprovalTier, validateCapabilityContract,
} from "./capability-contract-system";
export type {
  CapabilityRiskClass, ApprovalRequirement, CapabilityContract,
  CapabilityInput, EvidenceRequirement, ConnectorBinding,
  RetryConfig, RollbackConfig, BudgetProfile, ApprovalTierInput,
  ResolvedApprovalTier,
} from "./capability-contract-system";

// ── Cost & Token Governance ─────────────────────────────────
export {
  routeModel, checkBudget,
} from "./cost-token-governance";
export type {
  BudgetScope, ModelTier, BudgetPolicy, BudgetUsage,
  ModelRoutingDecision, ConnectorCostRecord,
} from "./cost-token-governance";

// ── Connector Governance ────────────────────────────────────
export {
  certifyConnector, killConnector, validateConnectorAction,
} from "./connector-governance";
export type {
  ConnectorStatus, ConnectorManifest, ConnectorPolicyOverlay,
  ConnectorHealthReport,
} from "./connector-governance";

// ── Truth Validation ────────────────────────────────────────
export {
  validateTruthClaim, canExecuteBasedOnEvidence,
  wrapModelOutput, promoteToFact,
} from "./truth-validation";
export type {
  TruthSource, CertaintyLevel, TruthEnvelope, ActionRecommendation,
} from "./truth-validation";

// ── Risk-Tiered Approval ────────────────────────────────────
export {
  resolveApproval,
} from "./approval-tiers";
export type {
  ApprovalClass, ApprovalContext, ApprovalDecision,
  FinancialApprovalThresholds,
} from "./approval-tiers";

// ── Multi-Tenant Sovereignty ────────────────────────────────
export {
  validateTenantIsolation, scopeQuery, createTenantSafeView,
} from "./tenant-sovereignty";
export type {
  TenantBoundary, TenantScope, TenantSafeView,
} from "./tenant-sovereignty";

// ── Advisor Orchestration ───────────────────────────────────
export {
  routeToAdvisors, synthesizeCouncil,
} from "./advisor-orchestration";
export type {
  AdvisorDeclaration, CouncilSession, AdvisorParticipation,
  CouncilSynthesis, AdvisorRoutingRule,
} from "./advisor-orchestration";

// ── Self-Learning Constraints ───────────────────────────────
export {
  validateLearningAction, createLearningProposal,
} from "./self-learning-constraints";
export type { LearningAction, LearningProposal } from "./self-learning-constraints";

// ── OS Unification Layer ────────────────────────────────────
export {
  WEB_SURFACE_CONTRACT, MOBILE_SURFACE_CONTRACT, ADMIN_SURFACE_CONTRACT,
  DOMAIN_MODULE_CONTRACT,
  validateSurfaceCompliance, validateDomainCompliance,
} from "./os-unification-layer";
export type {
  PlatformContract, PlatformContractCategory,
  SurfaceType, SurfaceContract, DomainModuleContract,
} from "./os-unification-layer";
