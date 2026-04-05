// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Unified Index
// Single import point for all intelligence layers
// ═══════════════════════════════════════════════════════════════

export { ObservationLayer } from "./observation-layer";
export type { RawSignal, SignalSource, SignalSeverity, SignalIngestionResult } from "./observation-layer";

export { DiagnosisLayer } from "./diagnosis-layer";
export type { IssueCluster, DiagnosisResult } from "./diagnosis-layer";

export { PlanningLayer } from "./planning-layer";
export type { EngineeringMission, MissionTask, MissionType, MissionStatus, AutonomyMode } from "./planning-layer";

export { ChangePlanLayer } from "./change-plan-layer";
export type { ChangePlan, ChangePlanStatus, ChangePlanValidation } from "./change-plan-layer";

export { VerificationLayer } from "./verification-layer";
export type { VerificationGate, VerificationReport, VerificationGateType } from "./verification-layer";

export { ExecutionLayer } from "./execution-layer";
export type { ExecutionReceipt, ExecutionAction } from "./execution-layer";

export { LearningLayer } from "./learning-layer";
export type { LearningEvent, LearningEventType, AgentRoutingWeight, LearnedPattern } from "./learning-layer";

export { SelfHealingEngine } from "./self-healing-engine";
export type { SelfHealingRule, HealingAttempt } from "./self-healing-engine";
