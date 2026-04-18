// ═══════════════════════════════════════════════════════════════
// SITA OS — Exception Handling & Recovery System
// First-class failure handling. Every failure generates a receipt.
// ═══════════════════════════════════════════════════════════════

export type ExceptionCategory =
  | "policy_refusal"
  | "approval_missing"
  | "connector_unavailable"
  | "budget_exceeded"
  | "evidence_insufficient"
  | "identity_ambiguous"
  | "permission_denied"
  | "execution_timeout"
  | "partial_side_effect"
  | "simulation_mismatch"
  | "capability_not_found"
  | "tenant_boundary_violation"
  | "memory_conflict"
  | "workflow_stuck";

export type ExceptionSeverity = "low" | "medium" | "high" | "critical";

export type RecoveryStrategy =
  | "auto-retry"
  | "fallback-provider"
  | "compensation"
  | "rollback"
  | "human-escalation"
  | "user-choice"
  | "degrade-gracefully"
  | "abort-and-receipt";

export interface TypedException {
  exceptionId: string;
  category: ExceptionCategory;
  severity: ExceptionSeverity;
  tenantId: string;
  userId: string;
  workflowId?: string;
  envelopeId?: string;
  capabilityId?: string;
  connectorId?: string;
  message: string;
  details: Record<string, unknown>;
  stackContext: string[];        // breadcrumb of what led here
  suggestedRecoveries: RecoveryStrategy[];
  timestamp: string;
}

export interface RecoveryPlan {
  planId: string;
  exceptionId: string;
  strategy: RecoveryStrategy;
  steps: RecoveryStep[];
  status: "proposed" | "approved" | "executing" | "completed" | "failed" | "abandoned";
  requiresApproval: boolean;
  estimatedImpact: string;
  rollbackAvailable: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface RecoveryStep {
  stepId: string;
  action: string;
  type: "rollback" | "retry" | "compensate" | "notify" | "escalate" | "degrade" | "abort";
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  output?: Record<string, unknown>;
  durationMs?: number;
}

export interface CompensationRecord {
  compensationId: string;
  originalEnvelopeId: string;
  originalReceiptId: string;
  compensatingAction: string;
  status: "pending" | "executed" | "failed" | "unnecessary";
  affectedEntities: string[];
  timestamp: string;
}

export interface PostmortemReceipt {
  postmortemId: string;
  exceptionId: string;
  recoveryPlanId?: string;
  timeline: Array<{ timestamp: string; event: string; detail: string }>;
  rootCause: string;
  impact: string;
  recoveryOutcome: string;
  lessonsLearned: string[];
  preventionRecommendations: string[];
  createdAt: string;
}

// ── Exception Factory ───────────────────────────────────────

export function createException(
  category: ExceptionCategory,
  severity: ExceptionSeverity,
  message: string,
  opts: {
    tenantId: string;
    userId: string;
    workflowId?: string;
    envelopeId?: string;
    capabilityId?: string;
    connectorId?: string;
    details?: Record<string, unknown>;
    stackContext?: string[];
  },
): TypedException {
  const recoveries = getDefaultRecoveries(category);
  return {
    exceptionId: crypto.randomUUID(),
    category,
    severity,
    tenantId: opts.tenantId,
    userId: opts.userId,
    workflowId: opts.workflowId,
    envelopeId: opts.envelopeId,
    capabilityId: opts.capabilityId,
    connectorId: opts.connectorId,
    message,
    details: opts.details ?? {},
    stackContext: opts.stackContext ?? [],
    suggestedRecoveries: recoveries,
    timestamp: new Date().toISOString(),
  };
}

export function createRecoveryPlan(
  exception: TypedException,
  strategy: RecoveryStrategy,
  steps: Omit<RecoveryStep, "stepId" | "status">[],
  requiresApproval: boolean,
): RecoveryPlan {
  return {
    planId: crypto.randomUUID(),
    exceptionId: exception.exceptionId,
    strategy,
    steps: steps.map(s => ({ ...s, stepId: crypto.randomUUID(), status: "pending" as const })),
    status: requiresApproval ? "proposed" : "approved",
    requiresApproval,
    estimatedImpact: assessImpact(exception),
    rollbackAvailable: ["auto-retry", "compensation", "rollback"].includes(strategy),
    createdAt: new Date().toISOString(),
  };
}

function getDefaultRecoveries(category: ExceptionCategory): RecoveryStrategy[] {
  const map: Record<ExceptionCategory, RecoveryStrategy[]> = {
    policy_refusal: ["user-choice", "human-escalation"],
    approval_missing: ["human-escalation", "abort-and-receipt"],
    connector_unavailable: ["auto-retry", "fallback-provider", "degrade-gracefully"],
    budget_exceeded: ["user-choice", "degrade-gracefully", "abort-and-receipt"],
    evidence_insufficient: ["user-choice", "human-escalation"],
    identity_ambiguous: ["user-choice", "human-escalation"],
    permission_denied: ["human-escalation", "abort-and-receipt"],
    execution_timeout: ["auto-retry", "human-escalation"],
    partial_side_effect: ["compensation", "rollback", "human-escalation"],
    simulation_mismatch: ["abort-and-receipt", "human-escalation"],
    capability_not_found: ["abort-and-receipt"],
    tenant_boundary_violation: ["abort-and-receipt"],
    memory_conflict: ["user-choice", "human-escalation"],
    workflow_stuck: ["auto-retry", "human-escalation", "abort-and-receipt"],
  };
  return map[category];
}

function assessImpact(exception: TypedException): string {
  if (exception.severity === "critical") return "System-wide impact possible";
  if (exception.severity === "high") return "Workflow and dependent processes affected";
  if (exception.severity === "medium") return "Current operation affected";
  return "Minimal impact";
}
