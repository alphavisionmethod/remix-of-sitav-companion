// ═══════════════════════════════════════════════════════════════
// SITA OS — Self-Healing Service (Re-export from core-services)
// Wire to the advanced 528-line self-healing engine
// ═══════════════════════════════════════════════════════════════
// @persistence: none — stateless module, no durable state to persist

export {
  SelfHealingService,
  createSelfHealingService,
} from "@/lib/core-services/self-healing/service";

export type {
  SelfHealingIncidentSeverity, IncidentState, RootCauseCategory,
  HealingCapability, ServiceHealthStatus, AutonomyLevel,
  HealingAction, HealingPlan, IncidentTimelineEntry, Incident,
  CircuitBreakerState, DegradedService, ServiceHealthRecord,
  ServiceMetrics, EscalationRule, SelfHealingDiagnosticBundle,
  RecoverySequence, QuarantineRecord, ImmuneRule,
} from "@/lib/core-services/self-healing/types";

// Convenience re-export for consumers that used the old simple factory
export { createSelfHealingService as createSelfHealing } from "@/lib/core-services/self-healing/service";

