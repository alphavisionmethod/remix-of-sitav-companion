// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Orchestration Engine
// Multi-advisor council: registry, escalation, handoff, collab
// ═══════════════════════════════════════════════════════════════

import type {
  AdvisorId, AdvisorDefinition, AdvisorCapability, EscalationRule,
  HandoffProtocol, CollaborationFrame, AdvisorContribution,
  AdvisorConsensus, AdvisorDisagreement, AdvisorPerformance,
} from "../types/advisor-orchestration.types";

const CORE_ADVISORS: AdvisorDefinition[] = [
  { id: "business-advisor", name: "Business Advisor", tier: "core", domains: ["business", "crm", "revenue"], capabilities: [], trustThreshold: 0.7, memoryScopes: ["business", "crm"], toolAccess: ["crm", "email", "calendar"], toolForbidden: ["payment", "bank"], explanationStyle: "plain_english", escalationTargets: ["money-advisor", "risk-advisor"], receivesEscalationsFrom: ["growth-advisor", "execution-advisor"], maxAutonomy: "draft", simulationRequired: ["bulk_email", "pricing_change"], performanceKpis: ["leads_converted", "revenue_recovered", "pipeline_growth"], active: true },
  { id: "money-advisor", name: "Money Advisor", tier: "core", domains: ["finance", "billing", "treasury"], capabilities: [], trustThreshold: 0.9, memoryScopes: ["finance", "billing"], toolAccess: ["accounting", "invoice", "budget"], toolForbidden: ["direct_transfer"], explanationStyle: "detailed", escalationTargets: ["trust-advisor", "risk-advisor"], receivesEscalationsFrom: ["business-advisor", "collections-advisor"], maxAutonomy: "recommend", simulationRequired: ["payment", "budget_change", "investment"], performanceKpis: ["savings_found", "fees_avoided", "cash_timing_optimized"], active: true },
  { id: "concierge-advisor", name: "Concierge Advisor", tier: "core", domains: ["concierge", "calendar", "travel", "household"], capabilities: [], trustThreshold: 0.6, memoryScopes: ["concierge", "calendar"], toolAccess: ["calendar", "tasks", "shopping"], toolForbidden: ["financial", "crm"], explanationStyle: "concise", escalationTargets: ["family-advisor"], receivesEscalationsFrom: ["travel-advisor", "school-advisor"], maxAutonomy: "execute", simulationRequired: ["vendor_contract", "large_purchase"], performanceKpis: ["tasks_completed", "time_saved", "schedule_optimized"], active: true },
  { id: "family-advisor", name: "Family Advisor", tier: "core", domains: ["household", "family", "school"], capabilities: [], trustThreshold: 0.8, memoryScopes: ["household", "family"], toolAccess: ["calendar", "tasks"], toolForbidden: ["financial", "crm"], explanationStyle: "plain_english", escalationTargets: ["trust-advisor"], receivesEscalationsFrom: ["concierge-advisor"], maxAutonomy: "recommend", simulationRequired: ["permission_change", "shared_calendar"], performanceKpis: ["household_satisfaction", "logistics_optimized"], active: true },
  { id: "growth-advisor", name: "Growth Advisor", tier: "core", domains: ["marketing", "growth", "ads"], capabilities: [], trustThreshold: 0.7, memoryScopes: ["business", "marketing"], toolAccess: ["ads", "analytics", "email"], toolForbidden: ["payment"], explanationStyle: "concise", escalationTargets: ["business-advisor"], receivesEscalationsFrom: [], maxAutonomy: "draft", simulationRequired: ["campaign_launch", "budget_allocation"], performanceKpis: ["cac_reduction", "lead_quality", "campaign_roi"], active: true },
  { id: "boardroom-advisor", name: "Boardroom Advisor", tier: "core", domains: ["boardroom", "strategy", "planning"], capabilities: [], trustThreshold: 0.8, memoryScopes: ["*"], toolAccess: ["analytics", "projections"], toolForbidden: ["execution"], explanationStyle: "detailed", escalationTargets: ["trust-advisor"], receivesEscalationsFrom: ["business-advisor", "money-advisor"], maxAutonomy: "recommend", simulationRequired: ["strategic_decision"], performanceKpis: ["decision_quality", "forecast_accuracy"], active: true },
  { id: "risk-advisor", name: "Risk Advisor", tier: "core", domains: ["risk", "compliance", "incidents"], capabilities: [], trustThreshold: 0.95, memoryScopes: ["*"], toolAccess: ["audit", "diagnostics"], toolForbidden: ["execution"], explanationStyle: "technical", escalationTargets: ["trust-advisor"], receivesEscalationsFrom: ["money-advisor", "business-advisor"], maxAutonomy: "recommend", simulationRequired: [], performanceKpis: ["incidents_prevented", "risk_score_improvement"], active: true },
  { id: "trust-advisor", name: "Trust Advisor", tier: "core", domains: ["trust", "policy", "security"], capabilities: [], trustThreshold: 1, memoryScopes: ["*"], toolAccess: ["policy", "audit"], toolForbidden: ["execution"], explanationStyle: "detailed", escalationTargets: [], receivesEscalationsFrom: ["risk-advisor", "money-advisor", "family-advisor", "boardroom-advisor"], maxAutonomy: "recommend", simulationRequired: [], performanceKpis: ["trust_score", "policy_compliance", "proof_completeness"], active: true },
  { id: "execution-advisor", name: "Execution Advisor", tier: "core", domains: ["workflow", "automation", "tasks"], capabilities: [], trustThreshold: 0.7, memoryScopes: ["workflow"], toolAccess: ["workflow", "tasks", "automation"], toolForbidden: ["financial"], explanationStyle: "concise", escalationTargets: ["business-advisor", "risk-advisor"], receivesEscalationsFrom: [], maxAutonomy: "execute", simulationRequired: ["bulk_operation"], performanceKpis: ["completion_rate", "automation_rate", "stuck_resolution"], active: true },
];

export class AdvisorOrchestrationEngine {
  private advisors: Map<AdvisorId, AdvisorDefinition> = new Map();
  private escalationRules: EscalationRule[] = [];
  private activeHandoffs: HandoffProtocol[] = [];
  private activeCollaborations: CollaborationFrame[] = [];
  private disagreements: AdvisorDisagreement[] = [];

  constructor() {
    for (const advisor of CORE_ADVISORS) {
      this.advisors.set(advisor.id, advisor);
    }
    this.buildDefaultEscalationRules();
  }

  // ── Registry ────────────────────────────────────────────────
  getAdvisor(id: AdvisorId): AdvisorDefinition | undefined {
    return this.advisors.get(id);
  }

  getAllAdvisors(): AdvisorDefinition[] {
    return Array.from(this.advisors.values());
  }

  getActiveAdvisors(): AdvisorDefinition[] {
    return this.getAllAdvisors().filter(a => a.active);
  }

  getAdvisorsForDomain(domain: string): AdvisorDefinition[] {
    return this.getActiveAdvisors().filter(a => a.domains.includes(domain) || a.domains.includes("*"));
  }

  // ── Capability Resolution ───────────────────────────────────
  findBestAdvisor(domain: string, action: string, riskTier: string): AdvisorDefinition | undefined {
    const candidates = this.getAdvisorsForDomain(domain);
    // Prefer the one with highest trust threshold for risky actions
    if (riskTier === "critical" || riskTier === "high") {
      return candidates.sort((a, b) => b.trustThreshold - a.trustThreshold)[0];
    }
    // Prefer the one with most autonomy for low-risk
    const autonomyOrder = { execute: 4, draft: 3, recommend: 2, observe: 1 };
    return candidates.sort((a, b) =>
      (autonomyOrder[b.maxAutonomy] || 0) - (autonomyOrder[a.maxAutonomy] || 0)
    )[0];
  }

  // ── Escalation ──────────────────────────────────────────────
  shouldEscalate(advisorId: AdvisorId, confidence: number, amount?: number): { escalate: boolean; target?: AdvisorId; reason?: string } {
    const advisor = this.advisors.get(advisorId);
    if (!advisor) return { escalate: false };

    if (confidence < advisor.trustThreshold) {
      const target = advisor.escalationTargets[0];
      return { escalate: true, target, reason: `Confidence ${confidence} below threshold ${advisor.trustThreshold}` };
    }

    return { escalate: false };
  }

  // ── Handoff ─────────────────────────────────────────────────
  initiateHandoff(from: AdvisorId, to: AdvisorId, reason: string, context: Record<string, unknown>): HandoffProtocol {
    const handoff: HandoffProtocol = {
      id: `handoff_${Date.now()}`,
      fromAdvisor: from,
      toAdvisor: to,
      reason,
      context,
      memoryTransfer: [],
      actionState: "proposed",
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    this.activeHandoffs.push(handoff);
    return handoff;
  }

  // ── Collaboration ───────────────────────────────────────────
  startCollaboration(initiator: AdvisorId, participants: AdvisorId[], topic: string, domain: string): CollaborationFrame {
    const frame: CollaborationFrame = {
      id: `collab_${Date.now()}`,
      initiator,
      participants,
      topic,
      domain,
      contributions: [],
      startedAt: new Date().toISOString(),
    };
    this.activeCollaborations.push(frame);
    return frame;
  }

  addContribution(collaborationId: string, contribution: AdvisorContribution): void {
    const collab = this.activeCollaborations.find(c => c.id === collaborationId);
    if (collab) collab.contributions.push(contribution);
  }

  resolveCollaboration(collaborationId: string): AdvisorConsensus | undefined {
    const collab = this.activeCollaborations.find(c => c.id === collaborationId);
    if (!collab || collab.contributions.length === 0) return undefined;

    // Find highest confidence contribution
    const sorted = [...collab.contributions].sort((a, b) => b.confidence - a.confidence);
    const winner = sorted[0];
    const supporters = sorted.filter(c => c.recommendation === winner.recommendation).map(c => c.advisorId);
    const dissenters = sorted.filter(c => c.recommendation !== winner.recommendation);

    const consensus: AdvisorConsensus = {
      decision: winner.recommendation,
      confidence: winner.confidence,
      supportingAdvisors: supporters,
      dissentingAdvisors: dissenters.map(d => d.advisorId),
      dissents: dissenters.map(d => ({ advisorId: d.advisorId, reason: d.reasoning })),
      resolvedBy: dissenters.length === 0 ? "majority" : "priority",
    };

    collab.consensus = consensus;
    collab.completedAt = new Date().toISOString();
    return consensus;
  }

  // ── Disagreement Resolution ─────────────────────────────────
  recordDisagreement(advisorA: AdvisorId, advisorB: AdvisorId, topic: string, posA: string, posB: string): AdvisorDisagreement {
    const d: AdvisorDisagreement = {
      id: `disagree_${Date.now()}`,
      advisorA, advisorB, topic,
      positionA: posA, positionB: posB,
      resolution: "unresolved",
      timestamp: new Date().toISOString(),
    };
    this.disagreements.push(d);
    return d;
  }

  resolveDisagreement(id: string, resolution: AdvisorDisagreement["resolution"], resolvedBy: string): void {
    const d = this.disagreements.find(d => d.id === id);
    if (d) {
      d.resolution = resolution;
      d.resolvedBy = resolvedBy;
    }
  }

  // ── Priority Resolution ─────────────────────────────────────
  // When Business Advisor overrides Concierge, Money blocks action, etc.
  resolvePriority(advisorA: AdvisorId, advisorB: AdvisorId): AdvisorId {
    const a = this.advisors.get(advisorA);
    const b = this.advisors.get(advisorB);
    if (!a || !b) return advisorA;

    // Trust advisor always wins
    if (a.id === "trust-advisor") return advisorA;
    if (b.id === "trust-advisor") return advisorB;

    // Risk advisor overrides non-trust
    if (a.id === "risk-advisor") return advisorA;
    if (b.id === "risk-advisor") return advisorB;

    // Money blocks execution
    if (a.id === "money-advisor") return advisorA;
    if (b.id === "money-advisor") return advisorB;

    // Higher trust threshold = higher priority
    return a.trustThreshold >= b.trustThreshold ? advisorA : advisorB;
  }

  private buildDefaultEscalationRules(): void {
    for (const advisor of CORE_ADVISORS) {
      for (const target of advisor.escalationTargets) {
        this.escalationRules.push({
          id: `esc_${advisor.id}_${target}`,
          fromAdvisor: advisor.id,
          toAdvisor: target,
          trigger: "confidence_below_threshold",
          priority: "medium",
          autoEscalate: true,
          timeoutMs: 300000,
        });
      }
    }
  }

  serialize(): Record<string, unknown> {
    return {
      advisors: Array.from(this.advisors.entries()),
      escalationRules: this.escalationRules,
      activeHandoffs: this.activeHandoffs,
      activeCollaborations: this.activeCollaborations,
      disagreements: this.disagreements,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (state.advisors) this.advisors = new Map(state.advisors as Iterable<[string, never]>) as typeof this.advisors;
    if (state.escalationRules) this.escalationRules = state.escalationRules as typeof this.escalationRules;
    if (state.activeHandoffs) this.activeHandoffs = state.activeHandoffs as typeof this.activeHandoffs;
    if (state.activeCollaborations) this.activeCollaborations = state.activeCollaborations as typeof this.activeCollaborations;
    if (state.disagreements) this.disagreements = state.disagreements as typeof this.disagreements;
  }
}
