// ═══════════════════════════════════════════════════════════════
// SITA OS — Meta-Governance Layer Contracts
// Single source of truth for Trust Debt, Execution Debt,
// Operational Drag, Readiness-to-Delegate, Invisible Labor,
// Founder Bottleneck, Principal/Operator Workspace,
// and Proof-Backed Recurring Delegation.
// ALL meta-governance modules MUST use these — no variants.
// ═══════════════════════════════════════════════════════════════

import type {
  ActionState, OSDomain, EntityScope, TrustPosture,
  ProofRecord, TimelineEntryType,
} from "./os-unified";

// ── Shared Foundations ──────────────────────────────────────────

export type TrendDirection = "improving" | "stable" | "degrading";

export interface TrendWindow {
  period: "hour" | "day" | "week" | "month" | "quarter";
  dataPoints: { timestamp: string; value: number }[];
  direction: TrendDirection;
  changePercent: number;
}

export type AgingTier = "fresh" | "aging" | "stale" | "critical";

export interface AgingModel {
  detectedAt: string;
  ageMs: number;
  tier: AgingTier;
  escalatedAt?: string;
}

export type RemediationStatus =
  | "open"
  | "acknowledged"
  | "in_progress"
  | "mitigated"
  | "resolved"
  | "accepted_risk"
  | "wont_fix";

export interface DebtSource {
  type: "module" | "advisor" | "connector" | "workflow" | "policy" | "system";
  id: string;
  name: string;
}

export interface DebtEvidence {
  sourceEventId: string;
  timestamp: string;
  metric: string;
  value: number;
  description: string;
}

export interface GovernanceBoardroomSection {
  systemId: string;
  title: string;
  severity: "info" | "warning" | "critical";
  summary: string;
  metrics: { label: string; value: string | number; trend?: TrendDirection }[];
  actionItems: { description: string; priority: "low" | "medium" | "high"; route?: string }[];
  drilldownRoute: string;
}

// ── Trust Debt Ledger ───────────────────────────────────────────

export type TrustDebtCategory =
  | "weak_proof"
  | "thin_explanation"
  | "policy_bypass"
  | "weak_replayability"
  | "weak_rollback"
  | "unresolved_incident"
  | "overbroad_permissions"
  | "silent_autonomy_expansion"
  | "unexplained_recommendation"
  | "missing_verification"
  | "poor_confidence_disclosure"
  | "weak_trust_tier_routing"
  | "attestation_gap"
  | "degraded_supportability";

export type TrustDimension =
  | "policyCompliance"
  | "proofCompleteness"
  | "verificationHealth"
  | "rollbackReadiness"
  | "memoryIntegrity"
  | "connectorHealth"
  | "advisorGovernance";

export interface TrustDebtRecord {
  id: string;
  category: TrustDebtCategory;
  severity: "low" | "medium" | "high" | "critical";
  source: DebtSource;
  entityScope: EntityScope;
  domain: OSDomain;
  trustDimension: TrustDimension;
  aging: AgingModel;
  remediationStatus: RemediationStatus;
  remediationOwner: string;
  trend: TrendDirection;
  evidence: DebtEvidence[];
  proofGaps: string[];
  policyGaps: string[];
  replayGaps: string[];
  sourceIncidentId?: string;
  confidenceAtDetection: number;
  attestationGaps: string[];
  description: string;
  impact: string;
  recommendation: string;
  workflowFamily?: string;
  correlationId?: string;
}

// ── Execution Debt Ledger ───────────────────────────────────────

export type ExecutionDebtCategory =
  | "stuck_workflow"
  | "manual_fallback"
  | "operator_override"
  | "partial_completion"
  | "connector_retry"
  | "repeated_replay"
  | "repeated_recovery"
  | "manual_degradation"
  | "approval_ping_pong"
  | "dependency_blocking"
  | "broken_automation"
  | "unresolved_failure"
  | "high_time_in_state"
  | "aging_queue"
  | "incident_linked_failure";

export interface ExecutionDebtRecord {
  id: string;
  category: ExecutionDebtCategory;
  severity: "low" | "medium" | "high" | "critical";
  source: DebtSource;
  entityScope: EntityScope;
  domain: OSDomain;
  workflowFamily: string;
  actionStateBottleneck: ActionState;
  aging: AgingModel;
  remediationStatus: RemediationStatus;
  remediationOwner: string;
  trend: TrendDirection;
  evidence: DebtEvidence[];
  sourceActionIds: string[];
  patternCount: number;
  downstreamImpact: string[];
  affectedEntities: string[];
  recommendation: string;
  remediationType: "replay" | "rollback" | "connector_hardening" | "policy_tuning" | "support_intervention" | "manual_fix";
  correlationId?: string;
}

// ── Operational Drag Index ──────────────────────────────────────

export type DragDimension =
  | "tool_switching"
  | "queue_size"
  | "follow_up_debt"
  | "notification_fatigue"
  | "context_switching"
  | "duplicate_work"
  | "stale_opportunity"
  | "blocked_approval"
  | "manual_work"
  | "calendar_overload"
  | "coordination_imbalance"
  | "trust_friction"
  | "role_ambiguity"
  | "founder_dependency";

export interface DragEvidence {
  sourceEventId: string;
  timestamp: string;
  metric: string;
  value: number;
  description: string;
}

export interface DragEvent {
  id: string;
  dimension: DragDimension;
  score: number;
  evidence: DragEvidence[];
  entityScope: EntityScope;
  module: string;
  domain: OSDomain;
  timestamp: string;
  correlationId?: string;
}

export interface DragDimensionScore {
  dimension: DragDimension;
  score: number;
  weight: number;
  evidence: DragEvidence[];
  trend: TrendDirection;
  recommendation?: string;
}

export interface DragIndex {
  compositeScore: number;
  dimensions: DragDimensionScore[];
  trend: TrendWindow;
  recommendations: DragRecommendation[];
  entityScope: EntityScope;
  computedAt: string;
}

export interface DragRecommendation {
  id: string;
  dimension: DragDimension;
  title: string;
  description: string;
  estimatedReduction: number;
  effort: "trivial" | "low" | "medium" | "high";
  priority: "low" | "medium" | "high" | "critical";
  actionRoute?: string;
  convertibleToOpportunity: boolean;
}

// ── Readiness-to-Delegate Score ─────────────────────────────────

export type DelegationTier =
  | "observe"
  | "suggest"
  | "draft"
  | "approval_every"
  | "approval_exceptions"
  | "bounded_recurring"
  | "expanded_recurring";

export interface ReadinessSubscore {
  value: number;
  weight: number;
  evidence: string[];
  trend: TrendDirection;
}

export interface ReadinessScore {
  compositeScore: number;
  recommendedTier: DelegationTier;
  subscores: {
    proofCompleteness: ReadinessSubscore;
    replaySafety: ReadinessSubscore;
    rollbackReadiness: ReadinessSubscore;
    policyMaturity: ReadinessSubscore;
    errorRate: ReadinessSubscore;
    trustDebt: ReadinessSubscore;
    executionDebt: ReadinessSubscore;
    approvalBehavior: ReadinessSubscore;
    connectorStability: ReadinessSubscore;
    observabilityQuality: ReadinessSubscore;
    supportBurden: ReadinessSubscore;
    confidenceQuality: ReadinessSubscore;
  };
  explanation: string;
  entityScope: EntityScope;
  computedAt: string;
  history: { timestamp: string; score: number; tier: DelegationTier }[];
}

export const DELEGATION_TIER_THRESHOLDS: Record<DelegationTier, number> = {
  observe: 0,
  suggest: 0.2,
  draft: 0.35,
  approval_every: 0.5,
  approval_exceptions: 0.65,
  bounded_recurring: 0.8,
  expanded_recurring: 0.92,
};

// ── Proof-Backed Recurring Delegation ───────────────────────────

export interface DelegationProofRequirement {
  minimumProofCount: number;
  minimumReplayCount: number;
  maxFailureRate: number;
  minPolicyMaturityTier: DelegationTier;
  requiredVerificationMethods: string[];
  minConsecutiveSuccesses: number;
}

export interface RecurringDelegationRecord {
  id: string;
  workflowFamily: string;
  domain: OSDomain;
  currentTier: DelegationTier;
  entityScope: EntityScope;
  proofRequirements: DelegationProofRequirement;
  scoreHistory: { timestamp: string; score: number; tier: DelegationTier }[];
  promotionHistory: { timestamp: string; from: DelegationTier; to: DelegationTier; reason: string; proofIds: string[] }[];
  demotionHistory: { timestamp: string; from: DelegationTier; to: DelegationTier; reason: string; triggerId: string }[];
  consecutiveSuccesses: number;
  totalExecutions: number;
  totalFailures: number;
  lastEvaluation: string;
  registeredAt: string;
  safetyControls: string[];
  demotionTriggers: string[];
}

// ── Invisible Labor Equalization ────────────────────────────────

export type InvisibleLaborType =
  | "reminder_origination"
  | "follow_up"
  | "scheduling"
  | "planning"
  | "coordination"
  | "tracking"
  | "preparation"
  | "anticipation";

export interface InvisibleLaborEvent {
  id: string;
  laborType: InvisibleLaborType;
  originatorId: string;
  targetEntityId?: string;
  concentrationScore: number;
  householdId?: string;
  orgId?: string;
  domain: OSDomain;
  timestamp: string;
  evidence: DebtEvidence[];
  correlationId?: string;
}

export interface LaborBurdenScore {
  entityId: string;
  entityName: string;
  totalBurden: number;
  byType: Record<InvisibleLaborType, number>;
  trend: TrendDirection;
  percentOfTotal: number;
}

export interface LaborEqualizationSuggestion {
  id: string;
  description: string;
  fromEntityId: string;
  toEntityId?: string;
  laborType: InvisibleLaborType;
  estimatedReduction: number;
  effort: "trivial" | "low" | "medium" | "high";
  respectfulExplanation: string;
  actionRoute?: string;
}

export interface LaborTrackingConsent {
  id: string;
  householdId: string;
  enabledBy: string;
  enabledAt: string;
  scope: InvisibleLaborType[];
  sensitivityLevel: "basic" | "detailed" | "comprehensive";
  revoked: boolean;
  revokedAt?: string;
  revokedBy?: string;
  auditTrail: { timestamp: string; action: string; by: string }[];
}

// ── Founder Bottleneck Detector ─────────────────────────────────

export type FounderBottleneckType =
  | "approval_stall"
  | "pricing_decision"
  | "release_block"
  | "delegation_stall"
  | "decision_queue"
  | "escalation_sink"
  | "roadmap_block"
  | "hiring_block"
  | "cash_timing"
  | "connector_decision"
  | "follow_up_dependency"
  | "boardroom_carryover";

export interface FounderBottleneckEvent {
  id: string;
  bottleneckType: FounderBottleneckType;
  founderId: string;
  blockedWorkflows: string[];
  domain: OSDomain;
  costEstimate: CostModel;
  delegationCandidates: DelegationCandidate[];
  handoffRecommendation: string;
  severity: "low" | "medium" | "high" | "critical";
  detectedAt: string;
  resolvedAt?: string;
  aging: AgingModel;
  evidence: DebtEvidence[];
  entityScope: EntityScope;
  correlationId?: string;
}

export interface CostModel {
  estimationMethod: "time_value" | "opportunity_cost" | "delay_impact" | "resource_waste";
  estimatedCost: number;
  currency: string;
  confidence: number;
  inputs: Record<string, number>;
  explanation: string;
}

export interface DelegationCandidate {
  entityId: string;
  entityName: string;
  readinessScore: number;
  recommendedTier: DelegationTier;
  proofHistory: string[];
  riskAssessment: string;
}

// ── Principal / Operator Workspace ──────────────────────────────

export type WorkspaceViewMode = "principal" | "operator";

export interface ViewModelFilter {
  viewMode: WorkspaceViewMode;
  visibleDomains: OSDomain[];
  redactedFields: string[];
  explanationDepth: "executive" | "operational";
  maxDetailLevel: "summary" | "detailed" | "full";
  authorityActions: string[];
  visibleSeverities: ("info" | "warning" | "critical")[];
}

export interface WorkspaceHandoff {
  id: string;
  fromRole: WorkspaceViewMode;
  toRole: WorkspaceViewMode;
  subject: string;
  context: string;
  urgency: "low" | "medium" | "high" | "critical";
  evidencePacketIds: string[];
  createdAt: string;
  acknowledgedAt?: string;
  completedAt?: string;
}

export interface EscalationRecord {
  id: string;
  fromRole: WorkspaceViewMode;
  toRole: WorkspaceViewMode;
  reason: string;
  workflowId: string;
  severity: "warning" | "critical";
  timestamp: string;
  resolved: boolean;
  resolution?: string;
}

// ── Collector Event Model ───────────────────────────────────────

export type MetaGovernanceEventType =
  | "trust_debt.recorded"
  | "trust_debt.remediated"
  | "execution_debt.recorded"
  | "execution_debt.remediated"
  | "drag.recorded"
  | "drag.index_computed"
  | "readiness.computed"
  | "readiness.tier_changed"
  | "delegation.registered"
  | "delegation.promoted"
  | "delegation.demoted"
  | "labor.detected"
  | "labor.equalization_suggested"
  | "bottleneck.detected"
  | "bottleneck.resolved"
  | "workspace.handoff"
  | "workspace.escalation";
