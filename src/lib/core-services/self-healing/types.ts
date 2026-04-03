// ═══════════════════════════════════════════════════════════════
// SITA OS — Self-Healing Operations Type System
// Full incident lifecycle, healing capabilities, fleet health
// ═══════════════════════════════════════════════════════════════

// ── Severity & State ────────────────────────────────────────────

export type IncidentSeverity = "P0" | "P1" | "P2" | "P3" | "P4";

export type IncidentState =
  | "detected"
  | "classified"
  | "triaging"
  | "planning"
  | "healing"
  | "verifying"
  | "resolved"
  | "escalated";

export type RootCauseCategory =
  | "resource-exhaustion"
  | "dependency-failure"
  | "config-error"
  | "workflow-stuck"
  | "connector-failure"
  | "release-failure"
  | "trust-failure"
  | "runtime-cost"
  | "ux-quality"
  | "authentication-failure"
  | "rate-limiting"
  | "schema-drift"
  | "permission-drift"
  | "model-routing"
  | "cache-failure"
  | "queue-pressure"
  | "unknown";

export type HealingCapability =
  | "service-restart"
  | "circuit-breaker"
  | "connector-failover"
  | "cache-flush"
  | "workflow-unstick"
  | "rollback"
  | "auto-scale"
  | "rate-limit-adjust"
  | "model-swap"
  | "queue-drain"
  | "permission-revert";

export type ServiceHealthStatus = "healthy" | "degraded" | "unhealthy" | "quarantined";

export type AutonomyLevel = "L1" | "L2" | "L3" | "L4" | "L5" | "L6";

// ── Healing Action ──────────────────────────────────────────────

export interface HealingAction {
  readonly id: string;
  readonly capability: HealingCapability;
  readonly targetService: string;
  readonly description: string;
  readonly autonomyRequired: AutonomyLevel;
  readonly reversible: boolean;
  readonly simulationRequired: boolean;
  readonly status: "planned" | "simulated" | "approved" | "executing" | "completed" | "failed" | "rolled-back";
  readonly result?: Record<string, unknown>;
  readonly startedAt?: number;
  readonly completedAt?: number;
  readonly error?: string;
}

export interface HealingPlan {
  readonly id: string;
  readonly incidentId: string;
  readonly actions: HealingAction[];
  readonly strategy: "single" | "sequential" | "parallel";
  readonly approvalRequired: boolean;
  readonly approvalSource?: "auto" | "council" | "human";
  readonly confidence: number;
  readonly createdAt: number;
}

// ── Incident ────────────────────────────────────────────────────

export interface IncidentTimelineEntry {
  readonly timestamp: number;
  readonly state: IncidentState;
  readonly message: string;
  readonly actor: string;
  readonly data?: Record<string, unknown>;
}

export interface Incident {
  readonly id: string;
  readonly correlationId: string;
  readonly title: string;
  readonly description: string;
  readonly severity: IncidentSeverity;
  readonly state: IncidentState;
  readonly rootCause: RootCauseCategory;
  readonly affectedServices: string[];
  readonly affectedEntities: string[];
  readonly healingPlan?: HealingPlan;
  readonly healAttempts: number;
  readonly maxHealAttempts: number;
  readonly timeline: IncidentTimelineEntry[];
  readonly evidence: Record<string, unknown>[];
  readonly diagnosticBundleId?: string;
  readonly escalatedTo?: string;
  readonly resolvedAt?: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

// ── Circuit Breaker ─────────────────────────────────────────────

export interface CircuitBreakerState {
  readonly serviceId: string;
  readonly incidentId: string;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly lastAttemptAt: number;
  readonly cooldownMs: number;
  readonly windowResetMs: number;
  readonly state: "closed" | "open" | "half-open";
  readonly openedAt?: number;
}

// ── Degraded Service ────────────────────────────────────────────

export interface DegradedService {
  readonly serviceId: string;
  readonly reason: string;
  readonly enteredAt: number;
  readonly consecutiveHealthyChecks: number;
  readonly requiredHealthyChecks: number;
  readonly disabledFeatures: string[];
  readonly incidentId: string;
}

// ── Fleet Health ────────────────────────────────────────────────

export interface ServiceHealthRecord {
  readonly serviceId: string;
  readonly name: string;
  readonly status: ServiceHealthStatus;
  readonly healthScore: number;
  readonly lastCheckAt: number;
  readonly checkIntervalMs: number;
  readonly consecutiveFailures: number;
  readonly consecutiveSuccesses: number;
  readonly dependencies: string[];
  readonly dependents: string[];
  readonly metrics: ServiceMetrics;
}

export interface ServiceMetrics {
  readonly uptimePercent: number;
  readonly avgLatencyMs: number;
  readonly p99LatencyMs: number;
  readonly errorRate: number;
  readonly requestsPerMinute: number;
  readonly lastErrorAt?: number;
  readonly lastSuccessAt?: number;
}

// ── Escalation Rules ────────────────────────────────────────────

export interface EscalationRule {
  readonly severity: IncidentSeverity;
  readonly autoHeal: boolean;
  readonly autonomyLevel: AutonomyLevel;
  readonly requiresCouncilQuorum: boolean;
  readonly requiresHumanApproval: boolean;
  readonly maxAutoHealTimeMs: number;
  readonly escalationTarget: string;
  readonly notifyOwner: boolean;
  readonly maxAttempts: number;
}

// ── Diagnostic Bundle ───────────────────────────────────────────

export interface DiagnosticBundle {
  readonly id: string;
  readonly incidentId: string;
  readonly correlationId: string;
  readonly classification: RootCauseCategory;
  readonly timestamps: {
    readonly detected: number;
    readonly classified: number;
    readonly bundleGenerated: number;
  };
  readonly evidence: Record<string, unknown>[];
  readonly affectedServices: string[];
  readonly affectedEntities: string[];
  readonly probableCause: string;
  readonly recommendedActions: string[];
  readonly confidenceLevel: number;
  readonly supportReadable: boolean;
}

// ── Recovery Sequencing ─────────────────────────────────────────

export interface RecoveryStep {
  readonly serviceId: string;
  readonly action: HealingCapability;
  readonly dependsOn: string[];
  readonly cooldownAfterMs: number;
  readonly verifyHealthAfter: boolean;
}

export interface RecoverySequence {
  readonly id: string;
  readonly incidentId: string;
  readonly steps: RecoveryStep[];
  readonly currentStep: number;
  readonly status: "pending" | "executing" | "completed" | "failed";
  readonly createdAt: number;
}

// ── Quarantine ──────────────────────────────────────────────────

export interface QuarantineRecord {
  readonly serviceId: string;
  readonly reason: string;
  readonly quarantinedAt: number;
  readonly autoRelease: boolean;
  readonly autoReleaseAfterMs: number;
  readonly incidentId?: string;
  readonly blockedActions: string[];
}

// ── Immune Rule ─────────────────────────────────────────────────

export interface ImmuneRule {
  readonly id: string;
  readonly name: string;
  readonly pattern: RootCauseCategory;
  readonly condition: string;
  readonly action: HealingCapability;
  readonly autonomyLevel: AutonomyLevel;
  readonly enabled: boolean;
  readonly matchCount: number;
  readonly lastMatchedAt?: number;
}

// ── Capability → Agent Mapping ──────────────────────────────────

export interface HealingCapabilityMapping {
  readonly capability: HealingCapability;
  readonly detectionAgent: string;
  readonly actionAgent: string;
  readonly autonomyLevel: AutonomyLevel;
}

export const HEALING_CAPABILITY_MAP: readonly HealingCapabilityMapping[] = [
  { capability: "service-restart", detectionAgent: "aw-incident-response", actionAgent: "aw-incident-response", autonomyLevel: "L4" },
  { capability: "circuit-breaker", detectionAgent: "aw-incident-response", actionAgent: "aw-incident-response", autonomyLevel: "L4" },
  { capability: "connector-failover", detectionAgent: "aw-connector-health", actionAgent: "aw-connector-health", autonomyLevel: "L3" },
  { capability: "cache-flush", detectionAgent: "aw-latency-optimizer", actionAgent: "aw-cache-compression", autonomyLevel: "L3" },
  { capability: "workflow-unstick", detectionAgent: "aw-workflow-recovery", actionAgent: "aw-workflow-recovery", autonomyLevel: "L3" },
  { capability: "rollback", detectionAgent: "aw-release-safety", actionAgent: "aw-rollback", autonomyLevel: "L4" },
  { capability: "auto-scale", detectionAgent: "aw-fleet-health", actionAgent: "aw-capacity-planning", autonomyLevel: "L3" },
  { capability: "rate-limit-adjust", detectionAgent: "aw-connector-health", actionAgent: "aw-sre", autonomyLevel: "L3" },
  { capability: "model-swap", detectionAgent: "aw-model-routing", actionAgent: "aw-model-routing", autonomyLevel: "L3" },
  { capability: "queue-drain", detectionAgent: "aw-workflow-recovery", actionAgent: "aw-workflow-recovery", autonomyLevel: "L3" },
  { capability: "permission-revert", detectionAgent: "aw-permission-drift", actionAgent: "aw-permission-drift", autonomyLevel: "L2" },
] as const;

// ── Escalation Rule Table ───────────────────────────────────────

export const ESCALATION_RULES: readonly EscalationRule[] = [
  { severity: "P0", autoHeal: true, autonomyLevel: "L6", requiresCouncilQuorum: false, requiresHumanApproval: false, maxAutoHealTimeMs: 120_000, escalationTarget: "sup-reliability", notifyOwner: true, maxAttempts: 2 },
  { severity: "P1", autoHeal: true, autonomyLevel: "L4", requiresCouncilQuorum: true, requiresHumanApproval: false, maxAutoHealTimeMs: 300_000, escalationTarget: "sup-reliability", notifyOwner: true, maxAttempts: 3 },
  { severity: "P2", autoHeal: true, autonomyLevel: "L3", requiresCouncilQuorum: false, requiresHumanApproval: false, maxAutoHealTimeMs: 600_000, escalationTarget: "sup-reliability", notifyOwner: false, maxAttempts: 3 },
  { severity: "P3", autoHeal: false, autonomyLevel: "L2", requiresCouncilQuorum: false, requiresHumanApproval: true, maxAutoHealTimeMs: 0, escalationTarget: "sup-reliability", notifyOwner: false, maxAttempts: 0 },
  { severity: "P4", autoHeal: false, autonomyLevel: "L1", requiresCouncilQuorum: false, requiresHumanApproval: false, maxAutoHealTimeMs: 0, escalationTarget: "", notifyOwner: false, maxAttempts: 0 },
] as const;

// ── Root Cause → Healing Capability Mapping ─────────────────────

export const ROOT_CAUSE_HEALING_MAP: Readonly<Record<RootCauseCategory, HealingCapability[]>> = {
  "resource-exhaustion": ["auto-scale", "cache-flush", "queue-drain"],
  "dependency-failure": ["circuit-breaker", "connector-failover", "service-restart"],
  "config-error": ["rollback", "service-restart"],
  "workflow-stuck": ["workflow-unstick", "queue-drain"],
  "connector-failure": ["connector-failover", "rate-limit-adjust", "circuit-breaker"],
  "release-failure": ["rollback", "service-restart"],
  "trust-failure": ["permission-revert", "circuit-breaker"],
  "runtime-cost": ["model-swap", "rate-limit-adjust", "cache-flush"],
  "ux-quality": ["rollback", "cache-flush"],
  "authentication-failure": ["service-restart", "circuit-breaker"],
  "rate-limiting": ["rate-limit-adjust", "connector-failover"],
  "schema-drift": ["rollback", "connector-failover"],
  "permission-drift": ["permission-revert"],
  "model-routing": ["model-swap"],
  "cache-failure": ["cache-flush", "service-restart"],
  "queue-pressure": ["queue-drain", "auto-scale"],
  "unknown": ["circuit-breaker"],
};

// ── Auto-allowed actions (low-risk, no approval needed) ─────────

export const AUTO_ALLOWED_ACTIONS: readonly HealingCapability[] = [
  "cache-flush",
  "queue-drain",
  "rate-limit-adjust",
  "model-swap",
] as const;

// ── Never-auto actions (always require human approval) ──────────

export const NEVER_AUTO_ACTIONS: readonly string[] = [
  "widen-permissions",
  "change-policy-thresholds",
  "disable-privacy-controls",
  "destructive-data-actions",
  "sensitive-connector-enable",
  "irreversible-migrations",
  "cross-tenant-repair",
  "auto-call-users",
] as const;

// ── Degraded Mode Definitions ───────────────────────────────────

export interface DegradedModeDefinition {
  readonly mode: string;
  readonly description: string;
  readonly affectedCapabilities: string[];
  readonly fallbackBehavior: string;
}

export const DEGRADED_MODES: readonly DegradedModeDefinition[] = [
  { mode: "connector-unavailable", description: "Connector unavailable but UI preserved", affectedCapabilities: ["sync", "real-time-data"], fallbackBehavior: "cached-data-with-staleness-warning" },
  { mode: "ai-reduced", description: "AI summarization reduced but deterministic workflow active", affectedCapabilities: ["ai-summarization", "ai-recommendations"], fallbackBehavior: "deterministic-fallback" },
  { mode: "proof-readonly", description: "Proof center read-only mode", affectedCapabilities: ["proof-write", "receipt-generation"], fallbackBehavior: "read-only-display" },
  { mode: "boardroom-partial", description: "Boardroom generation partial mode", affectedCapabilities: ["full-boardroom-packet"], fallbackBehavior: "partial-packet-with-warning" },
  { mode: "communications-simulation", description: "Communications simulation-only mode", affectedCapabilities: ["send-email", "send-sms"], fallbackBehavior: "simulation-mode-only" },
  { mode: "finance-readonly", description: "Finance read-only safety mode", affectedCapabilities: ["payment-execution", "trade-execution"], fallbackBehavior: "read-only-with-approval-queue" },
] as const;
