// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Execution Path Law
// The non-negotiable runtime spine that every consequential
// action must traverse. Defines the execution stages, sidecar
// chains, and integration points.
//
// CANONICAL EXECUTION PATH:
//   surface → api-gateway → brain-core → domain-os →
//   policy-engine → approval-service (if needed) →
//   capability-router → executor-service → receipt-service →
//   verification-engine → event-bus → projection-service → surfaces
//
// IDENTITY/TRUST SIDECAR (attached before execution):
//   identity → household-org-graph → entity-graph →
//   role-permission-engine → memory-service →
//   trusted-device-service → trust-state-service
//
// ADMIN/OWNER INTEGRATION (same event/proof/trust chain):
//   admin-service, owner-control-room, support-diagnostics,
//   observability, boardroom
//
// COMMERCIAL INTELLIGENCE (shared opportunity/value events):
//   opportunity-graph, revenue-autopilot, integration-concierge,
//   sovereign-calculation, ai-economics
// ═══════════════════════════════════════════════════════════════

// ── Canonical Execution Stages ──────────────────────────────────

export const CANONICAL_EXECUTION_STAGES = [
  "surface-ingress",
  "api-gateway",
  "brain-core",
  "domain-os",
  "policy-engine",
  "approval-service",
  "capability-router",
  "executor-service",
  "receipt-service",
  "verification-engine",
  "event-bus",
  "projection-service",
  "surface-delivery",
] as const;

export type CanonicalStage = typeof CANONICAL_EXECUTION_STAGES[number];

export const SIDECAR_STAGES = [
  "identity",
  "household-org-graph",
  "entity-graph",
  "role-permission-engine",
  "memory-service",
  "trusted-device-service",
  "trust-state-service",
] as const;

export type SidecarStage = typeof SIDECAR_STAGES[number];

// ── Execution Path Record ───────────────────────────────────────

export interface ExecutionPathRecord {
  correlationId: string;
  stages: ExecutionStageRecord[];
  sidecar: SidecarRecord;
  startedAt: number;
  completedAt?: number;
  completedStages: CanonicalStage[];
  skippedStages: CanonicalStage[];
  currentStage: CanonicalStage;
  isValid: boolean;
  violations: PathViolation[];
}

export interface ExecutionStageRecord {
  stage: CanonicalStage;
  enteredAt: number;
  exitedAt?: number;
  status: "pending" | "active" | "completed" | "skipped" | "failed";
  serviceId: string;
  output?: Record<string, unknown>;
  error?: string;
}

export interface SidecarRecord {
  attachedAt: number;
  identity: { userId: string; tenantId: string; resolved: boolean };
  entityGraph: { entityId: string; entityType: string; resolved: boolean };
  permissions: { role: string; actions: string[]; resolved: boolean };
  memory: { contextLoaded: boolean; staleWarnings: string[] };
  deviceTrust: { level: "trusted" | "verified" | "unknown"; attestedAt?: string };
  trustState: { score: number; posture: string; flags: string[] };
}

export interface PathViolation {
  type: "stage-skipped" | "out-of-order" | "sidecar-missing" | "proof-gap" | "approval-bypassed";
  stage: string;
  description: string;
  severity: "warning" | "error" | "critical";
}

// ── Path Validator ──────────────────────────────────────────────

const SKIPPABLE_STAGES: CanonicalStage[] = ["approval-service", "brain-core"];

export function validateExecutionPath(path: ExecutionPathRecord): PathViolation[] {
  const violations: PathViolation[] = [];
  const completed = new Set(path.completedStages);

  // 1. Check stage order
  let lastIndex = -1;
  for (const stage of path.completedStages) {
    const idx = CANONICAL_EXECUTION_STAGES.indexOf(stage);
    if (idx < lastIndex) {
      violations.push({
        type: "out-of-order",
        stage,
        description: `Stage "${stage}" executed out of canonical order (after index ${lastIndex})`,
        severity: "critical",
      });
    }
    lastIndex = idx;
  }

  // 2. Check mandatory stages (all except skippable)
  for (const stage of CANONICAL_EXECUTION_STAGES) {
    if (!completed.has(stage) && !path.skippedStages.includes(stage) && !SKIPPABLE_STAGES.includes(stage)) {
      violations.push({
        type: "stage-skipped",
        stage,
        description: `Mandatory stage "${stage}" was neither completed nor explicitly skipped`,
        severity: "error",
      });
    }
  }

  // 3. Check sidecar attachment
  if (!path.sidecar.identity.resolved) {
    violations.push({ type: "sidecar-missing", stage: "identity", description: "Identity not resolved before execution", severity: "critical" });
  }
  if (!path.sidecar.permissions.resolved) {
    violations.push({ type: "sidecar-missing", stage: "role-permission-engine", description: "Permissions not resolved before execution", severity: "critical" });
  }
  if (!path.sidecar.entityGraph.resolved) {
    violations.push({ type: "sidecar-missing", stage: "entity-graph", description: "Entity graph not resolved", severity: "warning" });
  }

  // 4. Proof chain: receipt must follow execution
  if (completed.has("executor-service") && !completed.has("receipt-service")) {
    violations.push({ type: "proof-gap", stage: "receipt-service", description: "Execution completed without receipt", severity: "critical" });
  }

  // 5. Verification must follow receipt
  if (completed.has("receipt-service") && !completed.has("verification-engine")) {
    violations.push({ type: "proof-gap", stage: "verification-engine", description: "Receipt created without verification", severity: "warning" });
  }

  return violations;
}

// ── Path Builder ────────────────────────────────────────────────

export function createExecutionPath(correlationId: string): ExecutionPathRecord {
  return {
    correlationId,
    stages: CANONICAL_EXECUTION_STAGES.map(stage => ({
      stage,
      enteredAt: 0,
      status: "pending" as const,
      serviceId: stage,
    })),
    sidecar: {
      attachedAt: 0,
      identity: { userId: "", tenantId: "", resolved: false },
      entityGraph: { entityId: "", entityType: "", resolved: false },
      permissions: { role: "", actions: [], resolved: false },
      memory: { contextLoaded: false, staleWarnings: [] },
      deviceTrust: { level: "unknown" },
      trustState: { score: 0, posture: "unknown", flags: [] },
    },
    startedAt: Date.now(),
    completedStages: [],
    skippedStages: [],
    currentStage: "surface-ingress",
    isValid: true,
    violations: [],
  };
}

export function advanceStage(
  path: ExecutionPathRecord,
  stage: CanonicalStage,
  output?: Record<string, unknown>
): ExecutionPathRecord {
  const stageRecord = path.stages.find(s => s.stage === stage);
  if (stageRecord) {
    stageRecord.enteredAt = Date.now();
    stageRecord.status = "completed";
    stageRecord.exitedAt = Date.now();
    stageRecord.output = output;
  }
  return {
    ...path,
    completedStages: [...path.completedStages, stage],
    currentStage: stage,
  };
}

export function attachSidecar(
  path: ExecutionPathRecord,
  sidecar: Partial<SidecarRecord>
): ExecutionPathRecord {
  return {
    ...path,
    sidecar: {
      ...path.sidecar,
      ...sidecar,
      attachedAt: Date.now(),
    },
  };
}

export function finalizePath(path: ExecutionPathRecord): ExecutionPathRecord {
  const violations = validateExecutionPath(path);
  return {
    ...path,
    completedAt: Date.now(),
    isValid: violations.filter(v => v.severity === "critical").length === 0,
    violations,
  };
}

// ── Integration Point Declarations ──────────────────────────────

/** Admin/owner services that consume the same event/proof/trust chain */
export const ADMIN_INTEGRATION_CONSUMERS = [
  "admin-service",
  "owner-control-room",
  "support-diagnostics",
  "observability",
  "boardroom",
] as const;

/** Commercial intelligence services sharing opportunity/value events */
export const COMMERCIAL_INTELLIGENCE_SERVICES = [
  "opportunity-graph",
  "revenue-autopilot",
  "integration-concierge",
  "sovereign-calculation",
  "ai-economics",
] as const;

/** Event topics that admin/owner surfaces must subscribe to */
export const ADMIN_REQUIRED_SUBSCRIPTIONS = [
  "intent.received.v1",
  "policy.evaluated.v1",
  "approval.requested.v1",
  "execution.completed.v1",
  "execution.failed.v1",
  "execution.denied.v1",
  "verification.failed.v1",
  "receipt.created.v1",
  "governance.rejected.v1",
  "governance.passed.v1",
  "trust.changed.v1",
  "incident.created.v1",
] as const;

/** Event topics that commercial intelligence must subscribe to */
export const COMMERCIAL_REQUIRED_SUBSCRIPTIONS = [
  "execution.completed.v1",
  "receipt.created.v1",
  "opportunity.detected.v1",
  "opportunity.converted.v1",
  "revenue.recovered.v1",
  "connector.health.changed.v1",
  "ai.spend.anomaly.v1",
] as const;