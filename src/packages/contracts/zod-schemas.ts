// ═══════════════════════════════════════════════════════════════
// SITA OS — Zod Schemas
// Runtime validation schemas for all contract families
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";
import { SchemaRegistry } from "./schema-registry";

// ── Scaffold primitives ─────────────────────────────────────

export const DomainIdSchema = z.enum(["business", "finance", "concierge", "platform", "cross-domain"]);
export const UserRoleSchema = z.enum(["owner", "admin", "member", "viewer", "guest"]);
export const PrivacyTierSchema = z.enum(["public", "internal", "confidential", "restricted"]);
export const RiskTierSchema = z.enum(["standard", "elevated", "critical"]);
export const ApprovalTypeSchema = z.enum(["none", "single", "dual", "owner-only"]);
export const ExecutionModeSchema = z.enum(["live", "dry-run", "simulation", "replay"]);
export const ExecutionStatusSchema = z.enum(["pending", "executing", "completed", "failed", "rolled-back"]);
export const WorkflowStatusSchema = z.enum(["pending", "running", "waiting-approval", "completed", "failed", "stuck", "rolled-back"]);
export const ApprovalStatusSchema = z.enum(["pending", "approved", "rejected", "expired", "escalated", "delegated"]);
export const TrustFlagSchema = z.enum(["anomaly", "breach", "escalation", "policy-violation", "cost-overrun"]);
export const ReceiptTypeSchema = z.enum(["action", "approval", "verification", "rollback", "communication", "payment", "decision", "system"]);

export const CorrelationContextSchema = z.object({
  correlationId: z.string(),
  causationId: z.string().optional(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
});

export const ConfidenceMetadataSchema = z.object({
  score: z.number().min(0).max(1),
  reasons: z.array(z.string()),
  missingInputs: z.array(z.string()),
  staleInputs: z.array(z.string()),
});

// ── Core truth contract schemas ──────────────────────────────

export const TenantContextSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  householdId: z.string().optional(),
  orgId: z.string().optional(),
  role: UserRoleSchema,
  permissions: z.array(z.string()),
});

export const EntityScopeSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  domain: DomainIdSchema,
});

export const EventEnvelopeSchema = z.object({
  id: z.string(),
  type: z.string(),
  tenantId: z.string(),
  correlationId: z.string(),
  timestamp: z.string(),
  domain: DomainIdSchema,
  payload: z.record(z.unknown()),
  metadata: z.object({
    source: z.string(),
    version: z.string(),
    causedBy: z.string().optional(),
  }),
});

export const IntentEnvelopeSchema = z.object({
  id: z.string(),
  source: z.enum(["user", "advisor", "system", "device", "scheduler", "workflow"]),
  actorId: z.string(),
  tenantId: z.string(),
  domain: DomainIdSchema,
  action: z.string(),
  description: z.string(),
  parameters: z.record(z.unknown()),
  urgency: z.enum(["immediate", "normal", "deferred", "background"]),
  confidence: ConfidenceMetadataSchema,
  correlation: CorrelationContextSchema,
  capturedAt: z.string(),
  expiresAt: z.string().optional(),
  parentIntentId: z.string().optional(),
  requiresPolicy: z.boolean(),
  requiresApproval: z.boolean(),
  simulationRequested: z.boolean(),
});

export const PolicyConstraintSchema = z.object({
  type: z.string(),
  description: z.string(),
  limit: z.union([z.number(), z.string()]).optional(),
});

export const PolicyDecisionSchema = z.object({
  allowed: z.boolean(),
  reason: z.string(),
  requiredApprovals: z.number(),
  approvalType: ApprovalTypeSchema,
  constraints: z.array(PolicyConstraintSchema),
  trustScore: z.number(),
});

export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["pending", "running", "completed", "failed", "skipped"]),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  output: z.record(z.unknown()).optional(),
});

export const WorkflowStateSchema = z.object({
  id: z.string(),
  workflowType: z.string(),
  status: WorkflowStatusSchema,
  currentStep: z.string(),
  steps: z.array(WorkflowStepSchema),
  startedAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
  error: z.string().optional(),
  retryCount: z.number(),
});

export const TrustChangeSchema = z.object({
  timestamp: z.string(),
  previousScore: z.number(),
  newScore: z.number(),
  reason: z.string(),
  changedBy: z.string(),
});

export const TrustStateSchema = z.object({
  entityId: z.string(),
  entityType: z.string(),
  score: z.number().min(0).max(100),
  flags: z.array(TrustFlagSchema),
  lastVerified: z.string(),
  history: z.array(TrustChangeSchema),
});

export const TrustTransitionSchema = z.object({
  id: z.string(),
  entityId: z.string(),
  entityType: z.string(),
  previousScore: z.number(),
  newScore: z.number(),
  trigger: z.enum(["action-outcome", "policy-change", "incident", "verification", "delegation-change", "manual"]),
  proofId: z.string().optional(),
  policySnapshotId: z.string().optional(),
  timestamp: z.string(),
  changedBy: z.string(),
  reason: z.string(),
});

export const PolicySnapshotSchema = z.object({
  id: z.string(),
  capturedAt: z.string(),
  policyVersion: z.string(),
  activeRules: z.array(z.object({
    ruleId: z.string(),
    domain: DomainIdSchema,
    description: z.string(),
    enabled: z.boolean(),
  })),
  trustThresholds: z.record(z.number()),
  approvalRequirements: z.record(ApprovalTypeSchema),
  autonomyLimits: z.record(z.number()),
  capturedFor: z.string(),
});

// ── Execution schemas ────────────────────────────────────────

export const ExecutionEnvelopeSchema = z.object({
  id: z.string(),
  idempotencyKey: z.string(),
  capabilityId: z.string(),
  mode: ExecutionModeSchema,
  input: z.record(z.unknown()),
  policyDecision: PolicyDecisionSchema,
  approvalId: z.string().optional(),
  status: ExecutionStatusSchema,
  result: z.record(z.unknown()).optional(),
  error: z.string().optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
});

export const ExecutionPlanSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  steps: z.array(z.object({
    stepId: z.string(),
    capabilityId: z.string(),
    input: z.record(z.unknown()),
    dependsOn: z.array(z.string()),
    estimatedDurationMs: z.number().optional(),
    rollbackCapabilityId: z.string().optional(),
  })),
  estimatedTotalMs: z.number().optional(),
  requiresApproval: z.boolean(),
  simulationRequired: z.boolean(),
  createdAt: z.string(),
});

export const ExecutionReceiptSchema = z.object({
  id: z.string(),
  executionId: z.string(),
  capabilityId: z.string(),
  status: ExecutionStatusSchema,
  input: z.record(z.unknown()),
  output: z.record(z.unknown()).optional(),
  error: z.string().optional(),
  policyDecisionId: z.string().optional(),
  approvalId: z.string().optional(),
  proofBundleId: z.string().optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  durationMs: z.number().optional(),
  hash: z.string(),
  previousHash: z.string(),
});

// ── Exception/Recovery schemas ───────────────────────────────

export const ExceptionRecordSchema = z.object({
  id: z.string(),
  category: z.enum(["connector", "workflow", "payment", "approval", "data", "security", "system"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  source: z.string(),
  message: z.string(),
  correlationId: z.string(),
  timestamp: z.string(),
  resolved: z.boolean(),
  resolvedAt: z.string().optional(),
});

export const RecoveryPlanSchema = z.object({
  id: z.string(),
  exceptionId: z.string(),
  steps: z.array(z.object({
    id: z.string(),
    action: z.string(),
    type: z.enum(["rollback", "retry", "compensate", "notify", "escalate"]),
    status: z.enum(["pending", "running", "completed", "failed"]),
    result: z.string().optional(),
  })),
  status: z.enum(["pending", "executing", "completed", "failed"]),
  estimatedImpact: z.string(),
});

// ── Receipt / Proof schemas ──────────────────────────────────

export const ReceiptSchema = z.object({
  id: z.string(),
  type: ReceiptTypeSchema,
  actionId: z.string(),
  tenantId: z.string(),
  timestamp: z.string(),
  data: z.record(z.unknown()),
  hash: z.string(),
  previousHash: z.string(),
});

export const ProofBundleSchema = z.object({
  id: z.string(),
  intentId: z.string(),
  receipts: z.array(ReceiptSchema),
  chainHash: z.string(),
  timestamp: z.string(),
});

export const VerificationRecordSchema = z.object({
  id: z.string(),
  actionId: z.string(),
  expected: z.record(z.unknown()),
  actual: z.record(z.unknown()),
  match: z.boolean(),
  discrepancies: z.array(z.string()),
  recommendation: z.enum(["accept", "review", "rollback"]),
  timestamp: z.string(),
});

// ── Approval schemas ─────────────────────────────────────────

export const ApprovalDecisionSchema = z.object({
  approverId: z.string(),
  decision: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
  decidedAt: z.string(),
});

export const ApprovalRequestSchema = z.object({
  id: z.string(),
  actionId: z.string(),
  actionType: z.string(),
  requestedBy: z.string(),
  requestedAt: z.string(),
  expiresAt: z.string(),
  context: z.record(z.unknown()),
  requiredApprovers: z.number(),
  currentApprovals: z.array(ApprovalDecisionSchema),
  status: ApprovalStatusSchema,
});

export const ApprovalReceiptSchema = z.object({
  id: z.string(),
  approvalRequestId: z.string(),
  actionId: z.string(),
  status: ApprovalStatusSchema,
  decisions: z.array(ApprovalDecisionSchema),
  finalDecision: z.enum(["approved", "rejected"]),
  decidedAt: z.string(),
  hash: z.string(),
  previousHash: z.string(),
  proofBundleId: z.string().optional(),
});

export const ConsentGrantSchema = z.object({
  id: z.string(),
  userId: z.string(),
  grantedTo: z.string(),
  granteeType: z.enum(["advisor", "connector", "household-member", "device"]),
  domain: z.enum(["calendar", "email", "finance", "contacts", "tasks", "files", "workflows", "payments"]),
  scopes: z.array(z.enum(["read", "write", "execute", "delegate", "share"])),
  duration: z.enum(["once", "session", "recurring", "permanent"]),
  conditions: z.array(z.object({
    type: z.enum(["amount-threshold", "time-restriction", "approval-required", "notification-only"]),
    value: z.union([z.string(), z.number()]),
    description: z.string(),
  })),
  grantedAt: z.string(),
  expiresAt: z.string().optional(),
  revokedAt: z.string().optional(),
  active: z.boolean(),
});

// ── Capability schemas ───────────────────────────────────────

export const CapabilityContractSchema = z.object({
  capabilityId: z.string(),
  domain: DomainIdSchema,
  family: z.string(),
  riskTier: RiskTierSchema,
  requiresApproval: z.boolean(),
  requiredConnectors: z.array(z.string()),
  requiredPermissions: z.array(z.string()),
});

export const CapabilityManifestSchema = z.object({
  id: z.string(),
  capabilityId: z.string(),
  inputs: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    description: z.string().optional(),
  })),
  outputs: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
  })),
  sideEffects: z.array(z.string()),
  rollbackStrategy: z.enum(["auto", "manual", "none"]).optional(),
});

// ── Advisor schemas ──────────────────────────────────────────

export const AdvisorRegistryEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  capabilities: z.array(z.string()),
  trustScore: z.number().min(0).max(100),
  status: z.enum(["active", "degraded", "paused", "retired"]),
  registeredAt: z.string(),
});

export const AdvisorSessionSchema = z.object({
  id: z.string(),
  advisorId: z.string(),
  userId: z.string(),
  tenantId: z.string(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  status: z.enum(["active", "completed", "abandoned", "escalated"]),
  threadId: z.string().optional(),
});

export const AdvisorVoteSchema = z.object({
  id: z.string(),
  deliberationId: z.string(),
  advisorId: z.string(),
  position: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.array(z.string()),
  evidence: z.array(z.string()),
  caveats: z.array(z.string()),
  votedAt: z.string(),
});

export const DeliberationStatusSchema = z.enum(["convened", "deliberating", "voting", "concluded", "deadlocked", "escalated"]);

export const CouncilDeliberationSchema = z.object({
  id: z.string(),
  topic: z.string(),
  domain: DomainIdSchema,
  convener: z.string(),
  advisorIds: z.array(z.string()),
  status: DeliberationStatusSchema,
  votes: z.array(z.string()),
  dissents: z.array(z.string()),
  consensus: z.string().optional(),
  confidenceScore: z.number(),
  startedAt: z.string(),
  concludedAt: z.string().optional(),
  escalatedTo: z.string().optional(),
  proofBundleId: z.string().optional(),
});

// ── Memory schemas ───────────────────────────────────────────

export const MemoryGovernanceRuleSchema = z.object({
  domain: DomainIdSchema,
  privacyTier: PrivacyTierSchema,
  retention: z.enum(["permanent", "session", "ttl", "until-superseded", "until-revoked"]),
  accessLevel: z.enum(["owner-only", "household", "advisor", "system", "support-safe"]),
  ttlMs: z.number().optional(),
  allowAdvisorAccess: z.boolean(),
  allowExport: z.boolean(),
  requiresConsent: z.boolean(),
  auditOnRead: z.boolean(),
  auditOnWrite: z.boolean(),
});

export const MemoryObjectSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  domain: DomainIdSchema,
  key: z.string(),
  value: z.unknown(),
  governance: MemoryGovernanceRuleSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  expiresAt: z.string().optional(),
  sourceAdvisor: z.string().optional(),
});

// ── Graph schemas ────────────────────────────────────────────

export const GraphNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  tenantId: z.string(),
  label: z.string(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
});

export const GraphEdgeSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  relationship: z.string(),
  weight: z.number().optional(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
});

export const DeviceAttestationSchema = z.object({
  deviceId: z.string(),
  userId: z.string(),
  tenantId: z.string(),
  attestedAt: z.string(),
  expiresAt: z.string(),
  trustLevel: z.enum(["trusted", "verified", "unknown", "revoked"]),
  platform: z.string(),
  fingerprint: z.string(),
});

// ── Admin schemas ────────────────────────────────────────────

export const AdminCommandSchema = z.object({
  id: z.string(),
  type: z.enum([
    "override-policy", "force-approval", "kill-workflow", "revoke-delegation",
    "reset-trust", "purge-memory", "enable-capability", "disable-capability",
    "escalate-incident", "trigger-diagnostic",
  ]),
  issuedBy: z.string(),
  domain: DomainIdSchema,
  target: z.object({ entityType: z.string(), entityId: z.string() }),
  parameters: z.record(z.unknown()),
  reason: z.string(),
  issuedAt: z.string(),
  executedAt: z.string().optional(),
  status: z.enum(["pending", "executed", "failed", "reverted"]),
  proofId: z.string().optional(),
  auditTrailId: z.string(),
});

// ── Diagnostic schema ────────────────────────────────────────

export const DiagnosticBundleSchema = z.object({
  id: z.string(),
  generatedAt: z.string(),
  systemHealth: z.number(),
  incidents: z.array(z.string()),
  degradedServices: z.array(z.string()),
  stuckWorkflows: z.array(z.string()),
  costAnomalies: z.array(z.string()),
  policyViolations: z.array(z.string()),
  supportSafe: z.boolean(),
});

// ── Trusted Boot schema ──────────────────────────────────────

export const TrustedBootSequenceSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  userId: z.string(),
  tenantId: z.string(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  currentPhase: z.enum([
    "device-discovery", "attestation-check", "identity-bind", "trust-baseline",
    "policy-sync", "capability-load", "memory-hydrate", "ready", "recovery",
  ]),
  phases: z.array(z.object({
    phase: z.enum([
      "device-discovery", "attestation-check", "identity-bind", "trust-baseline",
      "policy-sync", "capability-load", "memory-hydrate", "ready", "recovery",
    ]),
    status: z.enum(["pending", "running", "completed", "failed", "skipped"]),
    startedAt: z.string().optional(),
    completedAt: z.string().optional(),
    durationMs: z.number().optional(),
    error: z.string().optional(),
  })),
  trustBaseline: z.number(),
  accessibilityProfile: z.enum(["standard", "large-text", "high-contrast", "screen-reader", "reduced-motion"]),
  tonePreference: z.enum(["professional", "friendly", "minimal"]),
});

// ── Register all schemas ─────────────────────────────────────

const registrations: Array<{
  name: string;
  family: string;
  layer: "truth" | "runtime" | "read-model" | "specialized" | "admin";
  schema: z.ZodTypeAny;
  description: string;
}> = [
  // Core truth
  { name: "TenantContext", family: "core", layer: "truth", schema: TenantContextSchema, description: "Tenant boundary context" },
  { name: "EventEnvelope", family: "core", layer: "truth", schema: EventEnvelopeSchema, description: "Canonical event wrapper" },
  { name: "IntentEnvelope", family: "core", layer: "truth", schema: IntentEnvelopeSchema, description: "Intent capture before policy/approval" },
  { name: "PolicyDecision", family: "core", layer: "truth", schema: PolicyDecisionSchema, description: "Policy decision result" },
  { name: "PolicySnapshot", family: "core", layer: "truth", schema: PolicySnapshotSchema, description: "Immutable policy state at execution time" },
  { name: "WorkflowState", family: "core", layer: "truth", schema: WorkflowStateSchema, description: "Canonical workflow state" },
  { name: "TrustState", family: "core", layer: "truth", schema: TrustStateSchema, description: "Trust posture/state" },
  { name: "TrustTransition", family: "core", layer: "truth", schema: TrustTransitionSchema, description: "Trust state change record" },
  // Execution
  { name: "ExecutionEnvelope", family: "execution", layer: "truth", schema: ExecutionEnvelopeSchema, description: "Execution transport/control" },
  { name: "ExecutionPlan", family: "execution", layer: "truth", schema: ExecutionPlanSchema, description: "Planned execution steps" },
  { name: "ExecutionReceipt", family: "execution", layer: "truth", schema: ExecutionReceiptSchema, description: "Execution proof/receipt" },
  { name: "ExceptionRecord", family: "execution", layer: "truth", schema: ExceptionRecordSchema, description: "Exception/error record" },
  { name: "RecoveryPlan", family: "execution", layer: "truth", schema: RecoveryPlanSchema, description: "Exception recovery plan" },
  // Proof
  { name: "Receipt", family: "proof", layer: "truth", schema: ReceiptSchema, description: "Canonical receipt" },
  { name: "ProofBundle", family: "proof", layer: "truth", schema: ProofBundleSchema, description: "Proof bundle" },
  { name: "VerificationRecord", family: "proof", layer: "truth", schema: VerificationRecordSchema, description: "Verification result" },
  // Approval
  { name: "ApprovalRequest", family: "approval", layer: "truth", schema: ApprovalRequestSchema, description: "Approval request" },
  { name: "ApprovalReceipt", family: "approval", layer: "truth", schema: ApprovalReceiptSchema, description: "Approval proof/receipt" },
  { name: "ConsentGrant", family: "approval", layer: "truth", schema: ConsentGrantSchema, description: "Consent grant record" },
  // Capability
  { name: "CapabilityContract", family: "capability", layer: "truth", schema: CapabilityContractSchema, description: "Capability definition" },
  { name: "CapabilityManifest", family: "capability", layer: "truth", schema: CapabilityManifestSchema, description: "Capability I/O manifest" },
  // Advisor
  { name: "AdvisorRegistryEntry", family: "advisor", layer: "specialized", schema: AdvisorRegistryEntrySchema, description: "Advisor identity registration" },
  { name: "AdvisorSession", family: "advisor", layer: "specialized", schema: AdvisorSessionSchema, description: "Advisor session lifecycle" },
  { name: "AdvisorVote", family: "advisor", layer: "specialized", schema: AdvisorVoteSchema, description: "Advisor governance vote" },
  { name: "CouncilDeliberation", family: "advisor", layer: "specialized", schema: CouncilDeliberationSchema, description: "Council multi-advisor deliberation" },
  // Memory
  { name: "MemoryGovernanceRule", family: "memory", layer: "truth", schema: MemoryGovernanceRuleSchema, description: "Memory governance rule" },
  { name: "MemoryObject", family: "memory", layer: "truth", schema: MemoryObjectSchema, description: "Persisted memory object" },
  // Graph
  { name: "GraphNode", family: "graph", layer: "truth", schema: GraphNodeSchema, description: "Graph entity node" },
  { name: "GraphEdge", family: "graph", layer: "truth", schema: GraphEdgeSchema, description: "Graph relationship edge" },
  { name: "DeviceAttestation", family: "graph", layer: "truth", schema: DeviceAttestationSchema, description: "Device trust attestation" },
  // Admin
  { name: "AdminCommand", family: "admin", layer: "admin", schema: AdminCommandSchema, description: "Admin command envelope" },
  // Specialized
  { name: "DiagnosticBundle", family: "specialized", layer: "truth", schema: DiagnosticBundleSchema, description: "System diagnostic bundle" },
  // Runtime
  { name: "TrustedBootSequence", family: "runtime", layer: "runtime", schema: TrustedBootSequenceSchema, description: "Trusted device boot sequence" },
];

registrations.forEach(r => SchemaRegistry.register({ ...r, version: "1.0.0" }));