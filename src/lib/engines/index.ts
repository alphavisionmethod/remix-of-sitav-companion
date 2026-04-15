// ═══════════════════════════════════════════════════════════════
// SITA OS — Engine Barrel Export
//
// ARCHITECTURE ROLE:
//   Page-facing pure engines. These are stateless computation
//   engines instantiated by the OSRuntimeProvider and consumed
//   via useOSRuntime() in React components.
//
//   ✅ Pages/components import from here (via useOSRuntime)
//   ❌ Engines MUST NOT import from services/ or core-services/
//   ❌ Engines MUST NOT perform I/O or side effects
//
//   For backend-ready service functions, use src/lib/services/
//   For persistence, use src/lib/persistence/
// ═══════════════════════════════════════════════════════════════

export { ActionStateMachine, isDuplicateAction, findAgingWorkflows } from "./action-state-machine";
export { EntityRoleGraph } from "./entity-role-graph";
export { MemoryGovernanceEngine } from "./memory-governance";
export { AdvisorOrchestrationEngine } from "./advisor-orchestration";
export { PolicyDepthEngine } from "./policy-depth-engine";
export { RevenueOpportunityEngine } from "./revenue-opportunity";
export { DigitalTwinEngine, BoardroomIntelligenceEngine, ScenarioIntelligenceEngine } from "./digital-twin";
export { TokenGovernanceEngine } from "./token-governance";
export { IntegrationConciergeEngine } from "./connector-concierge";
export { ReplayRecoveryEngine } from "./replay-recovery";
export {
  EnterpriseControlPlaneEngine, SupportDiagnosticsEngine, ObservabilityEngine,
  ReleaseSafetyEngine, TrustDeviceEngine, ComplianceAuditEngine,
} from "./enterprise-maturity";

// ── Meta-Governance Layer ───────────────────────────────────────
export { MetaGovernanceEngine, getMetaGovernanceEngine, createMetaGovernanceEngine } from "./meta-governance-engine";
export { TrustDebtEngine } from "./trust-debt-engine";
export { ExecutionDebtEngine } from "./execution-debt-engine";
export { DragEngine } from "./drag-engine";
export { ReadinessEngine } from "./readiness-engine";
export { InvisibleLaborEngine } from "./invisible-labor-engine";
export { FounderBottleneckEngine } from "./founder-bottleneck-engine";
export { DelegationEngine } from "./delegation-engine";
export { WorkspaceViewEngine } from "./workspace-view-engine";
export { SetupOrchestrationEngine, createSetupOrchestrationEngine } from "./setup-orchestration-engine";

// ── Lead Scoring & Prioritization ───────────────────────────────
export { computeLeadScore, computeBatchScores } from "./lead-scoring-engine";
export type { LeadScoreResult, ScoreableLead, PriorityTier, HeatStatus, UrgencyBand, ConfidenceLevel } from "./lead-scoring-engine";

// ── Lead Recovery Engine ────────────────────────────────────────
export { MOCK_RECOVERY_CANDIDATES, RECOVERY_QUEUES, FAILURE_MODE_META, SUCCESS_BAND_META, RECOVERY_PATH_META,
  computeRecoveryScore, computeSuccessBand, computeUrgency, recommendPath, assignQueue,
  getQueueCounts, getQueueValueAtRisk, getTotalValueAtRisk, getTopPriorityRescues,
  filterByQueue, getRecoveryStats } from "./lead-recovery-engine";
export type { RecoveryCandidate, FailureMode, RecoveryPath, SuccessBand, UrgencyLevel,
  RelationshipSensitivity, RecoveryQueueDef, RecoveryTimelineEvent } from "./lead-recovery-engine";

// ── Business Advisor Intelligence Engine ────────────────────────
export { generateHomeAdvisors, generateRecoveryAdvisors, generateInboxAdvisors,
  synthesizeBusinessBoard, buildEscalationPacket, detectAdvisorDisagreements,
  runSummaryAdvisor, runPressureAdvisor, runPriorityAdvisor,
  runLeadPrioritizationAdvisor, runOpportunityAdvisor, runQualificationAdvisor,
  runTriageAdvisor, runDuplicateReviewAdvisor, runOwnerSuggestionAdvisor,
  runScoringAdvisor, runConversionAdvisor, runTimingAdvisor,
  runProgressionAdvisor, runStuckStageAdvisor, runLifecycleAdvisor,
  runRecoveryAdvisor, runCommunicationRecoveryAdvisor, runRevenueRescueAdvisor,
} from "./business-advisor-engine";
export type { AdvisorOutput, EscalationPacket, BoardSynthesisTheme,
  AdvisorDisagreement, AdvisorAction, EscalationRec } from "./business-advisor-engine";

// ── Part 2: Deep Intelligence Layer ─────────────────────────────
export { AdvisorMemoryEngine, getAdvisorMemoryEngine } from "./advisor-memory-engine";
export { SharedBusinessContextGraph, getBusinessContextGraph } from "./business-context-graph";
export { BusinessArchetypeEngine, getBusinessArchetypeEngine, ARCHETYPE_PROFILES } from "./business-archetype-engine";
export { CrossAdvisorCoordinator, getCrossAdvisorCoordinator } from "./cross-advisor-coordinator";
export { ConfidenceRiskScorer, getConfidenceRiskScorer } from "./confidence-risk-scorer";
export { ContinuousProfitEngine, getContinuousProfitEngine } from "./continuous-profit-engine";
export { AdvisorReflectionEngine, getAdvisorReflectionEngine } from "./advisor-reflection-engine";

