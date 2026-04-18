// ═══════════════════════════════════════════════════════════════
// SITA OS — Full 16-Stage Canonical Execution Pipeline
// Every meaningful action flows through ALL applicable stages.
// No stage may be silently skipped.
// ═══════════════════════════════════════════════════════════════

// ── STAGE 1: Intent Object ──────────────────────────────────

export interface CanonicalIntent {
  intentId: string;
  tenantId: string;
  actorId: string;
  surface: "web" | "mobile" | "admin" | "device" | "api" | "scheduled" | "workflow";
  deviceId: string;
  sessionId: string;
  rawInput: string;
  normalizedIntent: string;
  requestedOutcome: string;
  confidence: number;               // 0-1
  timeContext: {
    receivedAt: string;
    timezone: string;
    urgency: "none" | "low" | "medium" | "high" | "critical";
  };
  riskHint: "unknown" | "low" | "medium" | "high" | "critical";
  proposedDomain: "finance-os" | "business-os" | "concierge-os" | "cross-domain" | "unknown";
  secondaryDomains: ("finance-os" | "business-os" | "concierge-os")[];
  requiresIdentityResolution: boolean;
  requiresPolicyCheck: boolean;
  ambiguityLevel: "clear" | "moderate" | "high" | "unresolvable";
  inferredTaskIntent?: string;
  markedProvisional: boolean;        // always true — model output is never truth
}

// ── STAGE 3: Identity Resolution ────────────────────────────

export type PrincipalType =
  | "person" | "household" | "organization" | "team"
  | "assistant" | "service-account" | "device"
  | "advisor-actor" | "executor-actor";

export interface ResolvedIdentity {
  resolutionId: string;
  actorId: string;
  actorType: PrincipalType;
  tenantId: string;
  onBehalfOf?: string;              // acting for another principal
  roleIds: string[];
  activeRole: string;
  deviceId: string;
  deviceTrust: "untrusted" | "recognized" | "trusted" | "hardware-attested";
  sessionAssurance: "basic" | "elevated" | "strong";
  delegatedAuthority?: {
    delegatorId: string;
    scope: string[];
    maxAmountCents?: number;
    expiresAt: string;
  };
  approvalRights: string[];
  householdId?: string;
  orgId?: string;
  resolvedAt: string;
  ambiguous: boolean;
  ambiguityReason?: string;
}

// ── STAGE 5: Policy Decision ────────────────────────────────

export interface PolicyDecision {
  decisionId: string;
  intentId: string;
  tenantId: string;
  allowed: boolean;
  refused: boolean;
  approvalRequired: boolean;
  requiredApprovers: string[];
  requiredEvidenceGrade: "claimed" | "inferred" | "observed" | "attested" | "verified";
  budgetConstraints: {
    maxCostCents: number;
    budgetRemaining: number;
    hardLimit: boolean;
  };
  executionConstraints: string[];
  dataAccessConstraints: string[];
  proofRequirements: string[];
  policyBundleVersion: number;
  policyHash: string;
  constitutionalChecks: Array<{ rule: string; passed: boolean; reason?: string }>;
  riskTier: "standard" | "elevated" | "critical";
  evaluatedAt: string;
}

// ── STAGE 7: Proposal Package ───────────────────────────────

export interface ProposalPackage {
  proposalId: string;
  intentId: string;
  identityResolutionId: string;
  policyDecisionId: string;
  summary: string;
  assumptions: string[];
  uncertainties: string[];
  options: ProposalOption[];
  recommendedOptionIndex: number;
  capabilitySequence: string[];     // ordered capability IDs
  estimatedCostCents: number;
  riskRating: "low" | "medium" | "high" | "critical";
  approvalRequirements: string[];
  evidencePack: string[];           // proof IDs supporting this proposal
  simulationAvailable: boolean;
  predictedPostconditions: string[];
  fallbackOptions: string[];
  refusalPath?: string;             // what to do if blocked
  advisorContributions: Array<{
    advisorId: string;
    recommendation: string;
    confidence: number;
    dissent: boolean;
    dissentReason?: string;
  }>;
  createdAt: string;
}

export interface ProposalOption {
  optionId: string;
  label: string;
  capabilityIds: string[];
  estimatedCostCents: number;
  riskLevel: "low" | "medium" | "high";
  tradeoffs: string[];
}

// ── STAGE 8: Mode ───────────────────────────────────────────

export type ExecutionMode = "observe" | "draft" | "simulate" | "approval-ready" | "execute";

export interface ModeDecision {
  modeId: string;
  proposalId: string;
  mode: ExecutionMode;
  reason: string;
  policyChecked: boolean;           // mode upgrade requires policy check
  allPrerequisitesMet: boolean;     // execute mode requires ALL
  decidedAt: string;
}

// ── STAGE 10: Full Execution Envelope ───────────────────────

export interface FullExecutionEnvelope {
  envelopeId: string;
  intentId: string;
  proposalId: string;
  tenantId: string;
  actorId: string;
  authorizedBy: string;             // who approved/authorized
  capabilityContract: string;       // capability ID
  approvedMode: ExecutionMode;
  policyDecisionId: string;
  policyHash: string;
  approvalProofRefs: string[];
  budgetGuardrails: {
    maxCostCents: number;
    tokenCeiling: number;
    hardStop: boolean;
  };
  evidenceGrade: "claimed" | "inferred" | "observed" | "attested" | "verified";
  connectorBinding?: {
    connectorId: string;
    actionClass: string;
    permissions: string[];
  };
  idempotencyKey: string;
  signature: string;                // tamper-evident signature
  expiry: string;
  postconditionExpectations: string[];
  receiptRequirements: string[];
  createdAt: string;
}

// ── STAGE 12: Full Receipt Types ────────────────────────────

export type ReceiptCategory =
  | "execution"
  | "refusal"
  | "partial-completion"
  | "rollback"
  | "simulation"
  | "approval";

export interface FullReceipt {
  receiptId: string;
  category: ReceiptCategory;
  envelopeId: string;
  intentId: string;
  tenantId: string;
  actorId: string;
  authorityUsed: string;
  policyBundleVersion: number;
  policyHash: string;
  approvalsUsed: string[];
  capabilityExercised: string;
  connectorUsed?: string;
  outcome: "success" | "failure" | "partial" | "refused" | "rolled-back" | "simulated";
  evidenceRefs: string[];
  failureReason?: string;
  failureCategory?: string;
  timestamps: {
    requested: string;
    started?: string;
    completed: string;
  };
  idempotencyRef: string;
  resultClassification: string;
  immutableEventId: string;
  outputHash: string;
  rollbackRef?: string;
  compensationRef?: string;
}

// ── STAGE 15: Postcondition Verification ────────────────────

export interface PostconditionResult {
  verificationId: string;
  envelopeId: string;
  receiptId: string;
  checks: PostconditionCheck[];
  allPassed: boolean;
  verifiedAt: string;
}

export interface PostconditionCheck {
  checkId: string;
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
  category: "side-effect" | "budget" | "connector-response" | "policy" | "workflow-state" | "receipt-emitted" | "follow-up-spawned";
}

// ── STAGE 16: Governance System Updates ─────────────────────

export interface GovernanceUpdate {
  updateId: string;
  receiptId: string;
  tenantId: string;
  trustUpdates: Array<{ metric: string; delta: number; reason: string }>;
  memoryWrites: Array<{ type: string; content: string; evidenceGrade: string }>;
  boardroomUpdates: Array<{ type: string; summary: string }>;
  opportunityUpdates: Array<{ type: string; description: string; priority: string }>;
  appliedAt: string;
}

// ── Pipeline Orchestrator ───────────────────────────────────

export const PIPELINE_STAGES = [
  "detect-intent",
  "classify-domain",
  "resolve-identity",
  "retrieve-memory",
  "retrieve-policy",
  "route-advisors",
  "assemble-proposal",
  "mark-mode",
  "request-approval",
  "issue-envelope",
  "execute",
  "emit-receipt",
  "publish-event",
  "materialize-projections",
  "verify-postconditions",
  "update-governance",
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number];

export interface PipelineExecution {
  pipelineId: string;
  intentId: string;
  tenantId: string;
  currentStage: PipelineStage;
  stageResults: Partial<Record<PipelineStage, {
    status: "pending" | "running" | "completed" | "failed" | "skipped-with-reason";
    startedAt?: string;
    completedAt?: string;
    skipReason?: string;
    outputRef?: string;
  }>>;
  startedAt: string;
  completedAt?: string;
}

export function createPipelineExecution(intentId: string, tenantId: string): PipelineExecution {
  return {
    pipelineId: crypto.randomUUID(),
    intentId,
    tenantId,
    currentStage: "detect-intent",
    stageResults: {},
    startedAt: new Date().toISOString(),
  };
}

export function advancePipeline(
  pipeline: PipelineExecution,
  completedStage: PipelineStage,
  outputRef: string,
): PipelineExecution {
  const idx = PIPELINE_STAGES.indexOf(completedStage);
  const nextStage = idx < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[idx + 1] : completedStage;

  return {
    ...pipeline,
    currentStage: nextStage,
    stageResults: {
      ...pipeline.stageResults,
      [completedStage]: {
        status: "completed",
        startedAt: pipeline.stageResults[completedStage]?.startedAt ?? new Date().toISOString(),
        completedAt: new Date().toISOString(),
        outputRef,
      },
    },
    ...(idx === PIPELINE_STAGES.length - 1 ? { completedAt: new Date().toISOString() } : {}),
  };
}
