// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust & Safety Isolation Cluster
// Security-critical services isolated behind a single boundary
// Justification: These services handle fraud detection, system
// healing, and error patrol — all require isolation to prevent
// compromise propagation and maintain independent audit trails.
// ═══════════════════════════════════════════════════════════════

export { FraudSentinelService } from "../fraud-sentinel";
export type { FraudSignal, FraudRule, FraudContext, FraudSummary } from "../fraud-sentinel";

export { SelfHealingService, createSelfHealingService } from "../self-healing/service";
export { ImmuneController, createImmuneController } from "../self-healing/immune-controller";
export { FleetHealthService, createFleetHealthService } from "../self-healing/fleet-health";
export type { HealthDegradedCallback } from "../self-healing/fleet-health";
export { wireIncidentBridge, createIncidentBridge } from "../self-healing/incident-bridge";
export type { IncidentBridgeOptions } from "../self-healing/incident-bridge";
export {
  ESCALATION_RULES, HEALING_CAPABILITY_MAP, ROOT_CAUSE_HEALING_MAP,
  AUTO_ALLOWED_ACTIONS, NEVER_AUTO_ACTIONS, DEGRADED_MODES,
} from "../self-healing/types";
export type {
  Incident, ServiceHealthRecord, QuarantineRecord, CircuitBreakerState,
  SelfHealingIncidentSeverity, RootCauseCategory,
} from "../self-healing/types";

export { ErrorPatrol, createErrorPatrol } from "../error-patrol";
export type { PatrolIssue, HealthReport, IssueCategory, IssueSeverity } from "../error-patrol";

// ── Cluster Facade ──────────────────────────────────────────────

export interface TrustSafetyClusterStatus {
  fraudSentinel: { activeSignals: number; criticalCount: number };
  selfHealing: { activeIncidents: number; circuitBreakers: number };
  errorPatrol: { openIssues: number; criticalIssues: number };
  isolationIntact: boolean;
}