// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Unified Index
// Single import point for all 9 intelligence layers
// ═══════════════════════════════════════════════════════════════

export { ObservationLayer } from "./observation-layer";
export type { RawSignal, SignalSource, SignalSeverity, SignalQuality, SignalIngestionResult, NormalizedEvent } from "./observation-layer";

export { DiagnosisLayer } from "./diagnosis-layer";
export type { IssueCluster, DiagnosisResult, RootCauseCategory, CausalLink, ReproducibilityEstimate } from "./diagnosis-layer";

export { PlanningLayer } from "./planning-layer";
export type { EngineeringMission, MissionTask, MissionType, MissionStatus, AutonomyMode } from "./planning-layer";

export { AgentOrchestrationLayer } from "./agent-orchestration-layer";
export type { AgentInstance, AgentRole, AgentState, AgentProposal, ConflictDetection, EscalationRecord, EngineeringSynthesis, TaskHandoff } from "./agent-orchestration-layer";

export { ChangePlanLayer } from "./change-plan-layer";
export type { ChangePlan, ChangePlanStatus, ChangePlanValidation, RiskClass, ChangeType, PolicyCheckResult } from "./change-plan-layer";

export { VerificationLayer } from "./verification-layer";
export type { VerificationGate, VerificationReport, VerificationGateType } from "./verification-layer";

export { ExecutionLayer } from "./execution-layer";
export type { ExecutionReceipt, ExecutionAction } from "./execution-layer";

export { LearningLayer } from "./learning-layer";
export type { LearningEvent, LearningEventType, AgentRoutingWeight, LearnedPattern, AutonomyRecommendation, ImprovementSuggestion } from "./learning-layer";

export { SelfHealingEngine } from "./self-healing-engine";
export type { SelfHealingRule, HealingAttempt, HealingPolicy, HealingMode } from "./self-healing-engine";

export { AGENT_SPECIFICATIONS, getAgentSpec, getAgentSpecByRole, getAgentsRequiredForRelease, getAgentsWithVetoPower, getAutoHealCapableAgents, generateChiefSynthesis } from "./agent-specifications";
export type { AgentSpecification, ChiefEngineeringSynthesis } from "./agent-specifications";
