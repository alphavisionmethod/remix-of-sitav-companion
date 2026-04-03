// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Orchestration Types
// Multi-advisor council with escalation, handoff, collaboration
// ═══════════════════════════════════════════════════════════════

export type AdvisorId =
  | "business-advisor" | "money-advisor" | "concierge-advisor"
  | "family-advisor" | "growth-advisor" | "execution-advisor"
  | "boardroom-advisor" | "risk-advisor" | "trust-advisor"
  // Later specialists
  | "treasury-advisor" | "investment-advisor" | "collections-advisor"
  | "pricing-advisor" | "staffing-advisor" | "travel-advisor"
  | "school-advisor" | "vendor-advisor" | "relationship-advisor";

export type AdvisorTier = "core" | "specialist" | "future";

export interface AdvisorDefinition {
  id: AdvisorId;
  name: string;
  tier: AdvisorTier;
  domains: string[];
  capabilities: AdvisorCapability[];
  trustThreshold: number;
  memoryScopes: string[];
  toolAccess: string[];
  toolForbidden: string[];
  explanationStyle: "detailed" | "concise" | "plain_english" | "technical";
  escalationTargets: AdvisorId[];
  receivesEscalationsFrom: AdvisorId[];
  maxAutonomy: "observe" | "recommend" | "draft" | "execute";
  simulationRequired: string[];
  performanceKpis: string[];
  active: boolean;
}

export interface AdvisorCapability {
  id: string;
  name: string;
  domain: string;
  riskTier: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  requiresSimulation: boolean;
  maxAmount?: number;
  cooldownMs?: number;
}

export interface EscalationRule {
  id: string;
  fromAdvisor: AdvisorId;
  toAdvisor: AdvisorId;
  trigger: EscalationTrigger;
  priority: "low" | "medium" | "high" | "critical";
  autoEscalate: boolean;
  timeoutMs: number;
  metadata?: Record<string, unknown>;
}

export type EscalationTrigger =
  | "confidence_below_threshold"
  | "amount_exceeds_limit"
  | "cross_domain_action"
  | "policy_conflict"
  | "user_request"
  | "trust_violation"
  | "advisor_disagreement"
  | "timeout"
  | "dependency_blocked";

export interface HandoffProtocol {
  id: string;
  fromAdvisor: AdvisorId;
  toAdvisor: AdvisorId;
  reason: string;
  context: Record<string, unknown>;
  memoryTransfer: string[];
  actionState: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface CollaborationFrame {
  id: string;
  initiator: AdvisorId;
  participants: AdvisorId[];
  topic: string;
  domain: string;
  contributions: AdvisorContribution[];
  consensus?: AdvisorConsensus;
  startedAt: string;
  completedAt?: string;
}

export interface AdvisorContribution {
  advisorId: AdvisorId;
  recommendation: string;
  confidence: number;
  reasoning: string;
  risks: string[];
  timestamp: string;
}

export interface AdvisorConsensus {
  decision: string;
  confidence: number;
  supportingAdvisors: AdvisorId[];
  dissentingAdvisors: AdvisorId[];
  dissents: { advisorId: AdvisorId; reason: string }[];
  resolvedBy: "majority" | "priority" | "user" | "trust_advisor";
}

export interface AdvisorDisagreement {
  id: string;
  advisorA: AdvisorId;
  advisorB: AdvisorId;
  topic: string;
  positionA: string;
  positionB: string;
  resolution: "a_wins" | "b_wins" | "compromise" | "user_decides" | "escalated" | "unresolved";
  resolvedBy?: string;
  timestamp: string;
}

export interface AdvisorPerformance {
  advisorId: AdvisorId;
  period: string;
  actionsProposed: number;
  actionsApproved: number;
  actionsExecuted: number;
  actionsRolledBack: number;
  averageConfidence: number;
  escalationRate: number;
  userSatisfaction: number;
  valueDelivered: number;
  costIncurred: number;
  roi: number;
}

export interface AdvisorSimulationResult {
  advisorId: AdvisorId;
  scenario: string;
  recommendation: string;
  confidence: number;
  risks: string[];
  affectedDomains: string[];
  estimatedImpact: { revenue?: number; cost?: number; time?: number; trust?: number };
  wouldTriggerEscalation: boolean;
  wouldRequireApproval: boolean;
}
