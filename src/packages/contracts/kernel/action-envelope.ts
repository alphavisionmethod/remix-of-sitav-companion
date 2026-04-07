// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel Contract: ActionEnvelope
// The SACRED universal entry point for ALL governed execution.
// No service, workflow, or UI may accept raw execution params.
// Everything becomes an ActionEnvelope first.
// ═══════════════════════════════════════════════════════════════

// ── Execution Modes (Tri-Mode) ─────────────────────────────────
// EMULATED: No side effects, synthetic output (maps to draft)
// REAL_MOCK: Real logic, mock adapters (maps to simulation)
// REAL: Live execution with full side effects
// INVARIANT: Output schema MUST be identical across all three modes.
export type KernelExecutionMode = "EMULATED" | "REAL_MOCK" | "REAL";

// ── Source of the action ───────────────────────────────────────
export type ActionSource = "ui" | "advisor" | "system" | "workflow" | "connector" | "replay";

// ── Actor type ─────────────────────────────────────────────────
export type ActorType = "user" | "advisor" | "agent" | "system" | "scheduler";

// ── Side effect class ──────────────────────────────────────────
export type SideEffectClass = "none" | "read-only" | "state-mutation" | "external-call" | "financial" | "destructive";

// ── Approval tier ──────────────────────────────────────────────
export type ApprovalTier = "none" | "single" | "dual" | "owner-only";

// ── Risk classification ────────────────────────────────────────
export interface ActionRisk {
  tier: "standard" | "elevated" | "critical";
  costEstimateCents?: number;
  sideEffectClass: SideEffectClass;
}

// ── Intent description ─────────────────────────────────────────
export interface ActionIntent {
  action: string;
  domain: string;
  description?: string;
  parameters: Record<string, unknown>;
}

// ── Approval requirements ──────────────────────────────────────
export interface ActionApproval {
  required: boolean;
  tier: ApprovalTier;
  approvalId?: string;
  approvedBy?: string;
  approvedAt?: string;
}

// ── Execution context ──────────────────────────────────────────
export interface ActionExecution {
  mode: KernelExecutionMode;
  isReplay: boolean;
  replaySourceReceiptId?: string;
  idempotencyKey?: string;
}

// ── Evidence references ────────────────────────────────────────
export interface ActionEvidence {
  references: string[];
  confidence: number;
  sourceTypes?: string[];
}

// ── The Sacred ActionEnvelope ──────────────────────────────────
export interface ActionEnvelope {
  // Identity
  id: string;
  schemaVersion: number;

  // Action classification
  actionType: string;
  capabilityId: string;

  // Tenant & actor
  tenantId: string;
  workspaceId?: string;
  actorId: string;
  actorType: ActorType;

  // Origin
  source: ActionSource;
  causationId?: string;
  correlationId: string;
  traceId: string;

  // Intent
  intent: ActionIntent;

  // Risk
  risk: ActionRisk;

  // Approval
  approval: ActionApproval;

  // Execution
  execution: ActionExecution;

  // Evidence
  evidence: ActionEvidence;

  // Metadata sandbox (never leaks execution authority)
  metadata: Record<string, unknown>;

  // Timestamps
  createdAt: string;
  expiresAt?: string;
}

// ── Factory ────────────────────────────────────────────────────

export function createActionEnvelope(params: {
  actionType: string;
  capabilityId: string;
  tenantId: string;
  actorId: string;
  intent: ActionIntent;
  source?: ActionSource;
  actorType?: ActorType;
  mode?: KernelExecutionMode;
  risk?: Partial<ActionRisk>;
  approval?: Partial<ActionApproval>;
  evidence?: Partial<ActionEvidence>;
  metadata?: Record<string, unknown>;
  causationId?: string;
  correlationId?: string;
  idempotencyKey?: string;
  expiresAt?: string;
}): ActionEnvelope {
  return {
    id: crypto.randomUUID(),
    schemaVersion: 1,
    actionType: params.actionType,
    capabilityId: params.capabilityId,
    tenantId: params.tenantId,
    workspaceId: undefined,
    actorId: params.actorId,
    actorType: params.actorType ?? "user",
    source: params.source ?? "ui",
    causationId: params.causationId,
    correlationId: params.correlationId ?? crypto.randomUUID(),
    traceId: crypto.randomUUID(),
    intent: params.intent,
    risk: {
      tier: params.risk?.tier ?? "standard",
      costEstimateCents: params.risk?.costEstimateCents,
      sideEffectClass: params.risk?.sideEffectClass ?? "state-mutation",
    },
    approval: {
      required: params.approval?.required ?? false,
      tier: params.approval?.tier ?? "none",
      approvalId: params.approval?.approvalId,
      approvedBy: params.approval?.approvedBy,
      approvedAt: params.approval?.approvedAt,
    },
    execution: {
      mode: params.mode ?? "REAL",
      isReplay: false,
      idempotencyKey: params.idempotencyKey,
    },
    evidence: {
      references: params.evidence?.references ?? [],
      confidence: params.evidence?.confidence ?? 1.0,
      sourceTypes: params.evidence?.sourceTypes,
    },
    metadata: params.metadata ?? {},
    createdAt: new Date().toISOString(),
    expiresAt: params.expiresAt,
  };
}

// ── Validation ─────────────────────────────────────────────────

export function validateActionEnvelope(envelope: ActionEnvelope): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!envelope.id) errors.push("Missing id");
  if (!envelope.actionType) errors.push("Missing actionType");
  if (!envelope.capabilityId) errors.push("Missing capabilityId");
  if (!envelope.tenantId) errors.push("Missing tenantId");
  if (!envelope.actorId) errors.push("Missing actorId");
  if (!envelope.correlationId) errors.push("Missing correlationId");
  if (!envelope.traceId) errors.push("Missing traceId");
  if (!envelope.intent?.action) errors.push("Missing intent.action");
  if (!envelope.intent?.domain) errors.push("Missing intent.domain");
  if (envelope.schemaVersion < 1) errors.push("Invalid schemaVersion");
  if (envelope.approval.required && !envelope.approval.approvalId && envelope.execution.mode === "REAL") {
    errors.push("Approval required but no approvalId provided for REAL execution");
  }
  return { valid: errors.length === 0, errors };
}

// ── Mode Mapping ───────────────────────────────────────────────

export function mapKernelModeToExecutor(mode: KernelExecutionMode): "draft" | "simulation" | "real" {
  switch (mode) {
    case "EMULATED": return "draft";
    case "REAL_MOCK": return "simulation";
    case "REAL": return "real";
  }
}
