// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared Platform Contracts
// Cross-boundary types used by all services
// ═══════════════════════════════════════════════════════════════

// ── Tenant & Scope ───────────────────────────────────────────

export interface TenantContext {
  tenantId: string;
  userId: string;
  householdId?: string;
  orgId?: string;
  role: UserRole;
  permissions: string[];
}

export type UserRole = "owner" | "admin" | "member" | "viewer" | "guest";

export interface EntityScope {
  entityType: string;
  entityId: string;
  domain: DomainId;
}

export type DomainId = "business" | "finance" | "concierge" | "platform" | "cross-domain";

// ── Capability ───────────────────────────────────────────────

export interface CapabilityContract {
  capabilityId: string;
  domain: DomainId;
  family: string;
  riskTier: RiskTier;
  requiresApproval: boolean;
  requiredConnectors: string[];
  requiredPermissions: string[];
}

export type RiskTier = "standard" | "elevated" | "critical";

// ── Policy Decision ──────────────────────────────────────────

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
  requiredApprovals: number;
  approvalType: ApprovalType;
  constraints: PolicyConstraint[];
  trustScore: number;
}

export type ApprovalType = "none" | "single" | "dual" | "owner-only";

export interface PolicyConstraint {
  type: string;
  description: string;
  limit?: number | string;
}

// ── Approval ─────────────────────────────────────────────────

export interface ApprovalRequest {
  id: string;
  actionId: string;
  actionType: string;
  requestedBy: string;
  requestedAt: string;
  expiresAt: string;
  context: Record<string, unknown>;
  requiredApprovers: number;
  currentApprovals: ApprovalDecision[];
  status: ApprovalStatus;
}

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "escalated" | "delegated";

export interface ApprovalDecision {
  approverId: string;
  decision: "approve" | "reject";
  reason?: string;
  decidedAt: string;
}

// ── Execution ────────────────────────────────────────────────

export interface ExecutionEnvelope {
  id: string;
  idempotencyKey: string;
  capabilityId: string;
  mode: ExecutionMode;
  input: Record<string, unknown>;
  policyDecision: PolicyDecision;
  approvalId?: string;
  status: ExecutionStatus;
  result?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export type ExecutionMode = "live" | "dry-run" | "simulation" | "replay";
export type ExecutionStatus = "pending" | "executing" | "completed" | "failed" | "rolled-back";

// ── Receipt / Proof ──────────────────────────────────────────

export interface Receipt {
  id: string;
  type: ReceiptType;
  actionId: string;
  tenantId: string;
  timestamp: string;
  data: Record<string, unknown>;
  hash: string;
  previousHash: string;
}

export type ReceiptType = "action" | "approval" | "verification" | "rollback" | "communication" | "payment" | "decision" | "system";

export interface ProofBundle {
  id: string;
  intentId: string;
  receipts: Receipt[];
  chainHash: string;
  timestamp: string;
}

// ── Refusal ──────────────────────────────────────────────────

export interface RefusalReceipt {
  refused: true;
  reason: string;
  missingInputs: string[];
  staleInputs: string[];
  nextSteps: string[];
  fallbackOutput?: string;
}

// ── Event ────────────────────────────────────────────────────

export interface EventEnvelope {
  id: string;
  type: string;
  tenantId: string;
  correlationId: string;
  timestamp: string;
  domain: DomainId;
  payload: Record<string, unknown>;
  metadata: {
    source: string;
    version: string;
    causedBy?: string;
  };
}

// ── Workflow ─────────────────────────────────────────────────

export interface WorkflowState {
  id: string;
  workflowType: string;
  status: WorkflowStatus;
  currentStep: string;
  steps: WorkflowStep[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  retryCount: number;
}

export type WorkflowStatus = "pending" | "running" | "waiting-approval" | "completed" | "failed" | "stuck" | "rolled-back";

export interface WorkflowStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  output?: Record<string, unknown>;
}

// ── Trust ────────────────────────────────────────────────────

export interface TrustState {
  entityId: string;
  entityType: string;
  score: number; // 0-100
  flags: TrustFlag[];
  lastVerified: string;
  history: TrustChange[];
}

export type TrustFlag = "anomaly" | "breach" | "escalation" | "policy-violation" | "cost-overrun";

export interface TrustChange {
  timestamp: string;
  previousScore: number;
  newScore: number;
  reason: string;
  changedBy: string;
}

// ── Boardroom ────────────────────────────────────────────────

export interface BoardroomPacket {
  id: string;
  templateId: string;
  domain: DomainId;
  generatedAt: string;
  sections: BoardroomSection[];
  advisorTracks: AdvisorTrack[];
  disagreements: Disagreement[];
  carryoverItems: CarryoverItem[];
  decisionMemory: DecisionRecord[];
  confidenceScore: number;
}

export interface BoardroomSection {
  id: string;
  title: string;
  content: string;
  priority: number;
  confidence: number;
  dataFreshness: string;
}

export interface AdvisorTrack {
  advisorId: string;
  domain: DomainId;
  position: string;
  confidence: number;
  reasoning: string[];
  recommendations: string[];
}

export interface Disagreement {
  topic: string;
  advisorA: { id: string; position: string; confidence: number };
  advisorB: { id: string; position: string; confidence: number };
  severity: "material" | "minor";
}

export interface CarryoverItem {
  id: string;
  topic: string;
  fromSessionId: string;
  ageCount: number;
  status: "open" | "resolved" | "escalated";
}

export interface DecisionRecord {
  id: string;
  sessionId: string;
  topic: string;
  decision: string;
  advisorInputs: string[];
  outcome?: string;
  timestamp: string;
}

// ── Opportunity ──────────────────────────────────────────────

export interface Opportunity {
  id: string;
  title: string;
  domain: DomainId;
  type: "revenue" | "savings" | "efficiency" | "risk-mitigation";
  value?: number;
  confidence: number;
  description: string;
  advisorId: string;
  linkedWorkflows: string[];
  status: "identified" | "evaluating" | "approved" | "in-progress" | "realized" | "dismissed";
}

// ── Memory ───────────────────────────────────────────────────

export interface MemoryObject {
  id: string;
  key: string;
  value: unknown;
  privacyTier: PrivacyTier;
  domain: DomainId;
  source: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  supersededBy?: string;
}

export type PrivacyTier = "public" | "internal" | "confidential" | "restricted";

// ── Graph ────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  domain: DomainId;
  properties: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  properties: Record<string, unknown>;
}

// ── Verification ─────────────────────────────────────────────

export interface VerificationRecord {
  id: string;
  actionId: string;
  expected: Record<string, unknown>;
  actual: Record<string, unknown>;
  match: boolean;
  discrepancies: string[];
  recommendation: "accept" | "review" | "rollback";
  timestamp: string;
}

// ── Diagnostic ───────────────────────────────────────────────

export interface DiagnosticBundle {
  id: string;
  generatedAt: string;
  systemHealth: number;
  incidents: string[];
  degradedServices: string[];
  stuckWorkflows: string[];
  costAnomalies: string[];
  policyViolations: string[];
  supportSafe: boolean; // true = PII redacted
}

// ── Sub-module re-exports ────────────────────────────────────
export * from "./exception-contracts";
export * from "./consent-contracts";
export * from "./organization-contracts";
export * from "./verticalization-contracts";
