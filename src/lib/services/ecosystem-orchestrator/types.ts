// ═══════════════════════════════════════════════════════════════
// SITA OS — Distributed Ecosystem Orchestrator: Types & Contracts
// Admin-only subsystem for OS + Cloud + App layer coordination
// ═══════════════════════════════════════════════════════════════

// ── Layer Model ─────────────────────────────────────────────
export type EcosystemLayer = "os" | "cloud" | "app";

export type LayerStatus = "online" | "degraded" | "offline" | "maintenance";

export interface LayerHealthReport {
  layer: EcosystemLayer;
  status: LayerStatus;
  servicesTotal: number;
  servicesHealthy: number;
  servicesDegraded: number;
  servicesOffline: number;
  healthScore: number; // 0-100
  lastHeartbeat: number;
  responsibilities: string[];
  activeWorkloads: number;
}

// ── Command Intent Model ────────────────────────────────────
export type CommandScope =
  | "device_local"
  | "device_system"
  | "fleet_wide"
  | "cloud_global"
  | "cross_layer"
  | "security"
  | "rollout";

export type RiskClass = "low" | "medium" | "high" | "critical";

export type CommandUrgency = "routine" | "elevated" | "urgent" | "emergency";

export interface CommandIntent {
  intent: string;
  description: string;
  scope: CommandScope;
  targetLayers: EcosystemLayer[];
  urgency: CommandUrgency;
  riskClass: RiskClass;
  trustRequirement: number; // 0-1
  approvalMandatory: boolean;
  simulationRequired: boolean;
  rollbackAvailable: boolean;
  affectedDomains: string[];
}

// ── Command Lifecycle ───────────────────────────────────────
export type CommandLifecycleState =
  | "submitted"
  | "parsed"
  | "evaluated"
  | "routed"
  | "pending_approval"
  | "approved"
  | "dispatched"
  | "executing"
  | "verifying"
  | "completed"
  | "failed"
  | "rolled_back"
  | "denied";

export interface EcosystemCommand {
  id: string;
  input: string;
  intent: CommandIntent | null;
  state: CommandLifecycleState;
  routeDecision: CommandRouteDecision | null;
  guarantees: SystemGuarantee[];
  dualAuthChallenge: DualAuthorityChallenge | null;
  executionResult: ExecutionResult | null;
  verificationResult: VerificationResult | null;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
  correlationId: string;
  userId: string;
}

// ── Routing ─────────────────────────────────────────────────
export interface CommandRouteDecision {
  commandId: string;
  selectedLayers: EcosystemLayer[];
  approvalFlow: "none" | "standard" | "dual_authority" | "emergency_override";
  executionPlan: ExecutionStep[];
  guaranteeChecks: SystemGuarantee[];
  decidedAt: number;
  rationale: string;
}

export interface ExecutionStep {
  order: number;
  layer: EcosystemLayer;
  action: string;
  description: string;
  requiresPrior: boolean;
  timeoutMs: number;
  rollbackAction?: string;
}

// ── Dual Authority ──────────────────────────────────────────
export type ChallengeStatus = "pending" | "approved" | "denied" | "expired";

export interface DualAuthorityChallenge {
  id: string;
  commandId: string;
  action: string;
  riskLevel: RiskClass;
  source: string;
  challengeToken: string;
  expiresAt: number;
  status: ChallengeStatus;
  respondedAt: number | null;
  explanation: string;
  consequences: string[];
}

// ── System Guarantees ───────────────────────────────────────
export type GuaranteeType =
  | "no_data_loss"
  | "rollback_available"
  | "no_trust_downgrade"
  | "verification_path_exists"
  | "no_service_disruption"
  | "audit_trail_complete";

export type GuaranteeStatus = "verified" | "unverified" | "violated" | "not_applicable";

export interface SystemGuarantee {
  type: GuaranteeType;
  status: GuaranteeStatus;
  explanation: string;
  checkedAt: number;
}

// ── Execution & Verification ────────────────────────────────
export interface ExecutionResult {
  success: boolean;
  layerResults: Record<EcosystemLayer, LayerExecutionResult>;
  duration: number;
  errorMessage?: string;
}

export interface LayerExecutionResult {
  layer: EcosystemLayer;
  success: boolean;
  action: string;
  startedAt: number;
  completedAt: number;
  output?: string;
  error?: string;
}

export interface VerificationResult {
  passed: boolean;
  checks: VerificationCheck[];
  verifiedAt: number;
}

export interface VerificationCheck {
  name: string;
  passed: boolean;
  detail: string;
}

// ── Command Memory ──────────────────────────────────────────
export interface CommandMemoryEntry {
  id: string;
  commandId: string;
  intent: string;
  context: Record<string, unknown>;
  riskClass: RiskClass;
  outcome: "success" | "failure" | "partial" | "rolled_back";
  durationMs: number;
  userPreferences: Record<string, unknown>;
  learnedAt: number;
  patternTags: string[];
}

// ── Events ──────────────────────────────────────────────────
export type EcosystemEventType =
  | "command.submitted"
  | "command.parsed"
  | "command.routed"
  | "command.approval_required"
  | "command.approved"
  | "command.denied"
  | "command.dispatched"
  | "command.executed"
  | "command.verified"
  | "command.failed"
  | "command.rolled_back"
  | "layer.status_changed"
  | "layer.health_snapshot"
  | "trust.alert"
  | "guarantee.violated"
  | "dual_auth.challenge_issued"
  | "dual_auth.response_received";

export interface EcosystemEvent {
  id: string;
  type: EcosystemEventType;
  correlationId: string;
  sourceLayer: EcosystemLayer | "orchestrator";
  payload: Record<string, unknown>;
  emittedAt: number;
  version: number;
}

// ── Feature Contracts ───────────────────────────────────────
export interface FeatureContract {
  featureName: string;
  osOwnership: string;
  cloudOwnership: string;
  appOwnership: string;
  failureBehavior: string;
  approvalRequired: boolean;
  rollbackExists: boolean;
  events: string[];
}

// ── Orchestrator State ──────────────────────────────────────
export interface EcosystemState {
  layers: Record<EcosystemLayer, LayerHealthReport>;
  activeCommands: EcosystemCommand[];
  commandHistory: EcosystemCommand[];
  pendingChallenges: DualAuthorityChallenge[];
  recentEvents: EcosystemEvent[];
  contracts: FeatureContract[];
  commandMemory: CommandMemoryEntry[];
  bootedAt: number;
}

// ── IPC Contracts ───────────────────────────────────────────
export interface IPCContract {
  method: string;
  requestSchema: Record<string, string>;
  responseSchema: Record<string, string>;
  requiredIdentity: string;
  authRequired: boolean;
  auditBehavior: "always" | "on_failure" | "never";
  timeoutMs: number;
  errorModel: string;
}

export const ECOSYSTEM_IPC_CONTRACTS: IPCContract[] = [
  {
    method: "ecosystem.submit_command",
    requestSchema: { input: "string", urgency: "CommandUrgency" },
    responseSchema: { commandId: "string", state: "CommandLifecycleState" },
    requiredIdentity: "admin",
    authRequired: true,
    auditBehavior: "always",
    timeoutMs: 30000,
    errorModel: "EcosystemError",
  },
  {
    method: "ecosystem.respond_challenge",
    requestSchema: { challengeId: "string", response: "approved|denied" },
    responseSchema: { success: "boolean", commandState: "CommandLifecycleState" },
    requiredIdentity: "admin",
    authRequired: true,
    auditBehavior: "always",
    timeoutMs: 10000,
    errorModel: "ChallengeError",
  },
  {
    method: "ecosystem.layer_health",
    requestSchema: { layer: "EcosystemLayer" },
    responseSchema: { report: "LayerHealthReport" },
    requiredIdentity: "admin",
    authRequired: true,
    auditBehavior: "never",
    timeoutMs: 5000,
    errorModel: "HealthError",
  },
];
