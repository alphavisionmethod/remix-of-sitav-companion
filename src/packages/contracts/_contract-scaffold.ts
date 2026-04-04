// ═══════════════════════════════════════════════════════════════
// SITA OS — Contract Scaffold
// Foundational primitives shared across all contract families
// ═══════════════════════════════════════════════════════════════

/** Every contract entity has an id and creation timestamp */
export interface BaseContract {
  id: string;
  createdAt: string;
}

/** Adds update tracking */
export interface Timestamped extends BaseContract {
  updatedAt: string;
}

/** Scoped to a tenant boundary */
export interface TenantScoped {
  tenantId: string;
  userId?: string;
  householdId?: string;
  orgId?: string;
}

/** Scoped to a domain */
export interface DomainScoped {
  domain: DomainId;
}

/** Canonical domain identifier */
export type DomainId = "business" | "finance" | "concierge" | "platform" | "cross-domain";

/** Canonical user role */
export type UserRole = "owner" | "admin" | "member" | "viewer" | "guest";

/** Canonical privacy tier */
export type PrivacyTier = "public" | "internal" | "confidential" | "restricted";

/** Canonical risk tier for capabilities */
export type RiskTier = "standard" | "elevated" | "critical";

/** Canonical approval type */
export type ApprovalType = "none" | "single" | "dual" | "owner-only";

/** Canonical execution mode */
export type ExecutionMode = "live" | "dry-run" | "simulation" | "replay";

/** Canonical execution status */
export type ExecutionStatus = "pending" | "executing" | "completed" | "failed" | "rolled-back";

/** Canonical workflow status */
export type WorkflowStatus = "pending" | "running" | "waiting-approval" | "completed" | "failed" | "stuck" | "rolled-back";

/** Canonical approval status */
export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "escalated" | "delegated";

/** Canonical trust flags */
export type TrustFlag = "anomaly" | "breach" | "escalation" | "policy-violation" | "cost-overrun";

/** Canonical receipt types */
export type ReceiptType = "action" | "approval" | "verification" | "rollback" | "communication" | "payment" | "decision" | "system";

/** Correlation context for cross-service tracing */
export interface CorrelationContext {
  correlationId: string;
  causationId?: string;
  traceId?: string;
  spanId?: string;
  sessionId?: string;
  requestId?: string;
}

/** Confidence envelope used across truth-sensitive outputs */
export interface ConfidenceMetadata {
  score: number; // 0–1
  reasons: string[];
  missingInputs: string[];
  staleInputs: string[];
}
