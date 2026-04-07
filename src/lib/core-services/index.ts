// ═══════════════════════════════════════════════════════════════
// SITA OS — Core Services Facade (Re-export Layer)
//
// ARCHITECTURE ROLE:
//   This is a FACADE. It re-exports from two canonical layers:
//
//   1. src/lib/services/   — Backend-ready service implementations
//      (approval, capability routing, event bus, receipts, etc.)
//
//   2. src/lib/core-services/*.ts — Orchestration & infrastructure
//      (canonical chain, execution path, service manifest, etc.)
//
//   Pages and components should NOT import from here directly.
//   Instead use:
//     - src/lib/engines/    for page-facing pure engines
//     - src/lib/services/   for backend-ready service functions
//     - src/lib/hooks/      for React-integrated access
//
//   This barrel exists for backward compatibility and for the
//   canonical chain orchestrator which ties services together.
// ═══════════════════════════════════════════════════════════════

// ── Re-export from src/lib/services/ (canonical backend layer) ──

export * from "@/lib/services";

// ── 7 OS services merged into core-services barrel ──
export * from "@/lib/services/brain-core";
export * from "@/lib/services/model-router";
export * from "@/lib/services/conscience-gate";
export * from "@/lib/services/inference-gateway";
export * from "@/lib/services/mnemosyne";
export * from "@/lib/services/trust-governor";
export * from "@/lib/services/approval-engine";

// ── Local orchestration & infrastructure (owned by core-services) ──

// Tier 1 platform organs that live here (not yet in services/)
export * from "./policy-engine";
export * from "./executor-service";
export * from "./receipt-service";
export * from "./workflow-engine";
export * from "./projection-service";
export * from "./identity-graph";
export { type ConnectorStatus, type ConnectorMode, type ConnectorDefinition, type HealthMetrics, type CanonicalIntegrationStatus, calculateHealthScore, qualifiesForLive, ConnectorControlPlane, createConnectorControlPlane } from "./connector-control";
export * from "./event-bus";
export * from "./memory-service";
export * from "./approval-service";
export * from "./trust-state-service";
export * from "./verification-engine";
export * from "./api-gateway";
export * from "./capability-router";
export * from "./entity-graph";
export * from "./role-permission-engine";
export * from "./connector-runners";
export * from "./analytics-service";
export * from "./billing-service";
export { type CanonicalDiagnosticBundle, type SupportCorrelationContext, type DiagnosticSeverity, type DiagnosticCategory, type DiagnosticEntry, type SystemHealthReport, type DebugTrace, SupportDiagnosticsService, createSupportDiagnostics, type AuditLedgerEntry, AuditLedger, createAuditLedger } from "./support-diagnostics";

// Tier 2 subdomains
export { type CanonicalScenarioType, type SimulationType, type SimulationInput, type SimulationResult, type SimulationInputResult, type SimulationSummary, type ImpactProjection, GovernanceSimulatorService } from "./governance-simulator";
export * from "./agent-orchestrator";
export * from "./lease-manager";
export { ConstitutionCompiler, createConstitutionCompiler, type ConstitutionRule, type ConstitutionRuleCategory, type ConstitutionEvaluation, type EnforcementMode, type CompiledPolicy, type AdvisorConstraint, type UIFrictionRule, type NotificationRule, type ApprovalRule, type MemorySharingRule, type ApproverSpec } from "./constitution-compiler";
export * from "./budget-automation";
export * from "./payment-execution";
export * from "./manifest-generator";
export * from "./self-learning-engine";
export * from "./life-intelligence-engine";
export * from "./companion-engine";
export { NLPCompanion, createNLPCompanion, type Intent, type NLPResult, type NLPAction, type ConversationTurn, type PredictiveSuggestion, type Sentiment, type ExtractedEntity } from "./nlp-companion";
export * from "./productivity-engine";
export { FeatureProposalEngine, createFeatureProposalEngine, type ProposalCategory, type ProposalStatus, type ProposalRisk, type ProposalChange, type FeatureProposal } from "./feature-proposal-engine";
export * from "./investment-policy-rules";
export * from "./file-ingestion";
export * from "./cloud-sync-manager";

// Tier 3 infrastructure
export * from "./search-fabric";
export * from "./regression-comparison-engine";
export * from "./document-system";

// Isolated trust & safety cluster
export * from "./fraud-sentinel";
export { type SelfHealingIncidentSeverity, type IncidentState, type RootCauseCategory, type HealingCapability, type ServiceHealthStatus, type AutonomyLevel, type HealingAction, type HealingPlan, type IncidentTimelineEntry, type Incident, type CircuitBreakerState, type DegradedService, type ServiceHealthRecord, type ServiceMetrics, type EscalationRule, type SelfHealingDiagnosticBundle, type RecoverySequence, type QuarantineRecord, type ImmuneRule, type HealingCapabilityMapping, HEALING_CAPABILITY_MAP, ESCALATION_RULES, ROOT_CAUSE_HEALING_MAP, AUTO_ALLOWED_ACTIONS, NEVER_AUTO_ACTIONS, type DegradedModeDefinition, DEGRADED_MODES, SelfHealingService, createSelfHealingService, ImmuneController, createImmuneController, FleetHealthService, createFleetHealthService, SELF_HEALING_CAPABILITY_REGISTRATIONS, SELF_HEALING_SCHEMA_REGISTRY, SELF_HEALING_CAPABILITY_SUMMARY } from "./self-healing";
export * from "./error-patrol";
export * from "./clusters/trust-and-safety";

// Service tier manifest
export { SERVICE_MANIFEST, getServiceByTier, getServiceById, getChildServices, getIsolatedServices, validateServiceImport } from "./service-tier-manifest";
export type { ServiceTier, ServiceManifestEntry } from "./service-tier-manifest";

// Canonical execution path
export {
  CANONICAL_EXECUTION_STAGES, SIDECAR_STAGES,
  ADMIN_INTEGRATION_CONSUMERS, COMMERCIAL_INTELLIGENCE_SERVICES,
  ADMIN_REQUIRED_SUBSCRIPTIONS, COMMERCIAL_REQUIRED_SUBSCRIPTIONS,
  createExecutionPath, advanceStage, attachSidecar, finalizePath,
  validateExecutionPath,
} from "./canonical-execution-path";
export type {
  CanonicalStage, SidecarStage,
  ExecutionPathRecord, ExecutionStageRecord, SidecarRecord, PathViolation,
} from "./canonical-execution-path";

// Canonical chain orchestrator
export {
  CanonicalChainOrchestrator,
  createCanonicalChain,
} from "./canonical-chain-orchestrator";
export type {
  CanonicalChainResult,
  CanonicalChainInput,
} from "./canonical-chain-orchestrator";
