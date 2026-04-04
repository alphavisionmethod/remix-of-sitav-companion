// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Operating System Contracts
// Single source of truth for action-state, proof, trust,
// timeline, and cross-surface runtime types.
// ALL domains (business, money, concierge, boardroom, admin,
// device, ambient) MUST use these — no domain-specific variants.
// ═══════════════════════════════════════════════════════════════

// ── Canonical Action States ─────────────────────────────────────
export type ActionState =
  | "detected"
  | "proposed"
  | "drafted"
  | "simulated"
  | "approval_requested"
  | "approved"
  | "rejected"
  | "queued"
  | "executing"
  | "partially_completed"
  | "completed"
  | "verified"
  | "failed"
  | "rolled_back"
  | "escalated"
  | "archived";

export interface ActionStateTransition {
  from: ActionState;
  to: ActionState;
  triggeredBy: string;
  timestamp: string;
  reason: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface ActionRecord {
  id: string;
  workflowId: string;
  domain: OSDomain;
  currentState: ActionState;
  stateHistory: ActionStateTransition[];
  createdAt: string;
  updatedAt: string;
  stuckSince?: string;
  rollbackEligible: boolean;
  replayable: boolean;
  blockingReasons: string[];
  dependsOn: string[];
  confidenceScore: number;
  assignedAdvisor: string;
  proofIds: string[];
  entityScope: EntityScope;
}

// ── OS Domains ──────────────────────────────────────────────────
export type OSDomain =
  | "business"
  | "finance"
  | "concierge"
  | "boardroom"
  | "admin"
  | "system"
  | "connector"
  | "identity"
  | "device"
  | "ambient";

// ── Entity Scope ────────────────────────────────────────────────
export interface EntityScope {
  ownerId: string;
  visibility: "private" | "household" | "org" | "public";
  householdId?: string;
  orgId?: string;
  delegatedTo?: string[];
  deviceId?: string;
}

// ── Unified Proof Record ────────────────────────────────────────
export type ProofType =
  | "execution"
  | "approval"
  | "verification"
  | "rollback"
  | "policy_change"
  | "delegation"
  | "memory_correction"
  | "calculation"
  | "boardroom_decision"
  | "financial"
  | "connector_action";

export interface ProofRecord {
  id: string;
  type: ProofType;
  domain: OSDomain;
  action: string;
  actor: string;
  actorType: "user" | "advisor" | "system" | "device";
  timestamp: string;
  chainPosition: number;
  previousProofId?: string;
  verified: boolean;
  verificationMethod: string;
  confidenceScore: number;
  entityScope: EntityScope;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  policySnapshot?: string;
  leaseId?: string;
  correlationId: string;
  immutable: boolean;
}

export interface ProofChain {
  id: string;
  workflowId: string;
  records: ProofRecord[];
  integrity: "intact" | "broken" | "degraded";
  verifiedCount: number;
  totalCount: number;
}

// ── Unified Trust Chain ─────────────────────────────────────────
export type TrustPosture = "verified" | "review" | "degraded" | "compromised";

export interface TrustState {
  entityId: string;
  posture: TrustPosture;
  score: number;
  dimensions: {
    policyCompliance: number;
    proofCompleteness: number;
    verificationHealth: number;
    rollbackReadiness: number;
    memoryIntegrity: number;
    connectorHealth: number;
    advisorGovernance: number;
  };
  incidents: TrustIncident[];
  lastEvaluated: string;
}

export interface TrustIncident {
  id: string;
  type: "policy_violation" | "proof_gap" | "verification_failure" | "unauthorized_access" | "anomaly" | "drift";
  severity: "info" | "warning" | "critical";
  description: string;
  domain: OSDomain;
  timestamp: string;
  resolved: boolean;
  resolution?: string;
}

// ── Unified Timeline Entry ──────────────────────────────────────
export type TimelineEntryType =
  | "action"
  | "approval"
  | "proof"
  | "incident"
  | "advisor_call"
  | "policy_change"
  | "memory_update"
  | "connector_event"
  | "boardroom_session"
  | "revenue_event"
  | "system_event";

export interface TimelineEntry {
  id: string;
  type: TimelineEntryType;
  domain: OSDomain;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  actorType: "user" | "advisor" | "system" | "device";
  severity: "info" | "success" | "warning" | "error";
  entityScope: EntityScope;
  relatedIds: { type: string; id: string }[];
  proofId?: string;
  actionable: boolean;
  actionRoute?: string;
}

// ── Unified Opportunity Node ────────────────────────────────────
export type OpportunityType =
  | "revenue_recovery"
  | "cost_saving"
  | "capacity_fill"
  | "relationship_revival"
  | "process_optimization"
  | "risk_mitigation"
  | "time_saving";

export interface OpportunityNode {
  id: string;
  type: OpportunityType;
  domain: OSDomain;
  title: string;
  description: string;
  estimatedValue: number;
  currency: string;
  urgency: "immediate" | "this_week" | "this_month" | "this_quarter";
  effort: "trivial" | "low" | "medium" | "high";
  probability: number;
  trustRequirement: "none" | "low" | "medium" | "high";
  downstreamImpact: string[];
  detectedAt: string;
  expiresAt?: string;
  assignedAdvisor: string;
  actionState: ActionState;
  proofIds: string[];
  entityScope: EntityScope;
}

// ── Cross-Surface Runtime Contract ──────────────────────────────
export interface OSRuntimeContext {
  userId: string;
  sessionId: string;
  activeEntity: EntityScope;
  trustState: TrustState;
  activePolicies: string[];
  activeLeases: string[];
  displayMode: "calm" | "focus" | "operator" | "boardroom" | "family";
  deviceTrust: "trusted" | "verified" | "unknown";
}

// ── Anti-Duplication Rules ──────────────────────────────────────
// These types are the ONLY valid action-state, proof, trust,
// timeline, and opportunity types in the entire codebase.
// Domain modules MUST import from this file.
// Domain modules MUST NOT define their own variants.
// Violation = architectural regression.
