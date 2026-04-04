// ═══════════════════════════════════════════════════════════════
// SITA OS — Delegation Engine
// Proof-backed recurring delegation with graduation ladder,
// promotion/demotion rules, and safety controls.
// ═══════════════════════════════════════════════════════════════

import type {
  RecurringDelegationRecord, DelegationTier, DelegationProofRequirement,
  GovernanceBoardroomSection,
} from "../types/meta-governance.types";
import type { EntityScope, OSDomain } from "../types/os-unified.types";
import type { ReadinessScore } from "../types/meta-governance.types";

const TIER_ORDER: DelegationTier[] = [
  "observe", "suggest", "draft", "approval_every",
  "approval_exceptions", "bounded_recurring", "expanded_recurring",
];

const DEFAULT_PROOF_REQUIREMENTS: Record<DelegationTier, DelegationProofRequirement> = {
  observe: { minimumProofCount: 0, minimumReplayCount: 0, maxFailureRate: 1, minPolicyMaturityTier: "observe", requiredVerificationMethods: [], minConsecutiveSuccesses: 0 },
  suggest: { minimumProofCount: 1, minimumReplayCount: 0, maxFailureRate: 0.5, minPolicyMaturityTier: "suggest", requiredVerificationMethods: [], minConsecutiveSuccesses: 1 },
  draft: { minimumProofCount: 3, minimumReplayCount: 1, maxFailureRate: 0.3, minPolicyMaturityTier: "draft", requiredVerificationMethods: ["basic"], minConsecutiveSuccesses: 3 },
  approval_every: { minimumProofCount: 5, minimumReplayCount: 2, maxFailureRate: 0.2, minPolicyMaturityTier: "approval_every", requiredVerificationMethods: ["basic", "proof_chain"], minConsecutiveSuccesses: 5 },
  approval_exceptions: { minimumProofCount: 10, minimumReplayCount: 5, maxFailureRate: 0.1, minPolicyMaturityTier: "approval_exceptions", requiredVerificationMethods: ["basic", "proof_chain", "policy_check"], minConsecutiveSuccesses: 10 },
  bounded_recurring: { minimumProofCount: 20, minimumReplayCount: 10, maxFailureRate: 0.05, minPolicyMaturityTier: "bounded_recurring", requiredVerificationMethods: ["basic", "proof_chain", "policy_check", "rollback_test"], minConsecutiveSuccesses: 15 },
  expanded_recurring: { minimumProofCount: 50, minimumReplayCount: 25, maxFailureRate: 0.02, minPolicyMaturityTier: "expanded_recurring", requiredVerificationMethods: ["basic", "proof_chain", "policy_check", "rollback_test", "load_test"], minConsecutiveSuccesses: 30 },
};

export class DelegationEngine {
  private registry: Map<string, RecurringDelegationRecord> = new Map();

  /** Register a recurring workflow for delegation tracking */
  register(input: {
    workflowFamily: string;
    domain: OSDomain;
    entityScope: EntityScope;
    initialTier?: DelegationTier;
    customProofRequirements?: Partial<DelegationProofRequirement>;
    safetyControls?: string[];
  }): RecurringDelegationRecord {
    const id = `del_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const tier = input.initialTier ?? "observe";
    const now = new Date().toISOString();
    const record: RecurringDelegationRecord = {
      id,
      workflowFamily: input.workflowFamily,
      domain: input.domain,
      currentTier: tier,
      entityScope: input.entityScope,
      proofRequirements: { ...DEFAULT_PROOF_REQUIREMENTS[tier], ...input.customProofRequirements },
      scoreHistory: [{ timestamp: now, score: 0, tier }],
      promotionHistory: [],
      demotionHistory: [],
      consecutiveSuccesses: 0,
      totalExecutions: 0,
      totalFailures: 0,
      lastEvaluation: now,
      registeredAt: now,
      safetyControls: input.safetyControls ?? ["rollback_enabled", "proof_required", "replay_enabled"],
      demotionTriggers: ["trust_debt_increase", "failure_spike", "policy_violation", "incident_linked"],
    };
    this.registry.set(id, record);
    return record;
  }

  /** Record an execution outcome */
  recordExecution(id: string, success: boolean, proofId?: string): boolean {
    const record = this.registry.get(id);
    if (!record) return false;
    record.totalExecutions++;
    if (success) {
      record.consecutiveSuccesses++;
    } else {
      record.totalFailures++;
      record.consecutiveSuccesses = 0;
    }
    return true;
  }

  /** Evaluate for promotion using readiness score */
  evaluateForPromotion(id: string, readinessScore: ReadinessScore): {
    eligible: boolean;
    currentTier: DelegationTier;
    nextTier?: DelegationTier;
    reason: string;
    meetsProofRequirements: boolean;
  } {
    const record = this.registry.get(id);
    if (!record) return { eligible: false, currentTier: "observe", reason: "Record not found", meetsProofRequirements: false };

    const currentIdx = TIER_ORDER.indexOf(record.currentTier);
    const nextTier = TIER_ORDER[currentIdx + 1];
    if (!nextTier) return { eligible: false, currentTier: record.currentTier, reason: "Already at maximum tier", meetsProofRequirements: true };

    const reqs = DEFAULT_PROOF_REQUIREMENTS[nextTier];
    const failureRate = record.totalExecutions > 0 ? record.totalFailures / record.totalExecutions : 1;
    const meetsProof = record.totalExecutions >= reqs.minimumProofCount;
    const meetsFailureRate = failureRate <= reqs.maxFailureRate;
    const meetsConsecutive = record.consecutiveSuccesses >= reqs.minConsecutiveSuccesses;
    const meetsReadiness = readinessScore.compositeScore >= ({ observe: 0, suggest: 0.2, draft: 0.35, approval_every: 0.5, approval_exceptions: 0.65, bounded_recurring: 0.8, expanded_recurring: 0.92 }[nextTier]);

    const meetsProofRequirements = meetsProof && meetsFailureRate && meetsConsecutive;
    const eligible = meetsProofRequirements && meetsReadiness;

    const reasons: string[] = [];
    if (!meetsProof) reasons.push(`Need ${reqs.minimumProofCount} executions (have ${record.totalExecutions})`);
    if (!meetsFailureRate) reasons.push(`Failure rate ${(failureRate * 100).toFixed(1)}% exceeds ${(reqs.maxFailureRate * 100)}%`);
    if (!meetsConsecutive) reasons.push(`Need ${reqs.minConsecutiveSuccesses} consecutive successes (have ${record.consecutiveSuccesses})`);
    if (!meetsReadiness) reasons.push(`Readiness score ${(readinessScore.compositeScore * 100).toFixed(0)}% below threshold`);

    record.lastEvaluation = new Date().toISOString();

    return {
      eligible,
      currentTier: record.currentTier,
      nextTier,
      reason: eligible ? `Meets all requirements for ${nextTier}` : reasons.join("; "),
      meetsProofRequirements,
    };
  }

  /** Promote to next tier */
  promote(id: string, reason: string, proofIds: string[]): boolean {
    const record = this.registry.get(id);
    if (!record) return false;
    const currentIdx = TIER_ORDER.indexOf(record.currentTier);
    const nextTier = TIER_ORDER[currentIdx + 1];
    if (!nextTier) return false;

    const now = new Date().toISOString();
    record.promotionHistory.push({ timestamp: now, from: record.currentTier, to: nextTier, reason, proofIds });
    record.currentTier = nextTier;
    record.proofRequirements = DEFAULT_PROOF_REQUIREMENTS[nextTier];
    record.scoreHistory.push({ timestamp: now, score: 0, tier: nextTier });
    return true;
  }

  /** Demote to a lower tier */
  demote(id: string, toTier: DelegationTier, reason: string, triggerId: string): boolean {
    const record = this.registry.get(id);
    if (!record) return false;
    if (TIER_ORDER.indexOf(toTier) >= TIER_ORDER.indexOf(record.currentTier)) return false;

    const now = new Date().toISOString();
    record.demotionHistory.push({ timestamp: now, from: record.currentTier, to: toTier, reason, triggerId });
    record.currentTier = toTier;
    record.proofRequirements = DEFAULT_PROOF_REQUIREMENTS[toTier];
    record.consecutiveSuccesses = 0;
    record.scoreHistory.push({ timestamp: now, score: 0, tier: toTier });
    return true;
  }

  /** Get all registered delegations */
  getRegistry(): RecurringDelegationRecord[] {
    return Array.from(this.registry.values());
  }

  /** Get by workflow family */
  getByWorkflowFamily(family: string): RecurringDelegationRecord | undefined {
    return Array.from(this.registry.values()).find(r => r.workflowFamily === family);
  }

  /** Get by tier */
  getByTier(tier: DelegationTier): RecurringDelegationRecord[] {
    return Array.from(this.registry.values()).filter(r => r.currentTier === tier);
  }

  /** Boardroom section */
  getBoardroomSection(): GovernanceBoardroomSection {
    const all = this.getRegistry();
    const tierCounts = new Map<DelegationTier, number>();
    for (const r of all) tierCounts.set(r.currentTier, (tierCounts.get(r.currentTier) ?? 0) + 1);

    const highAutonomy = all.filter(r => TIER_ORDER.indexOf(r.currentTier) >= TIER_ORDER.indexOf("bounded_recurring"));
    const recentDemotions = all.filter(r => r.demotionHistory.length > 0 &&
      Date.now() - new Date(r.demotionHistory[r.demotionHistory.length - 1].timestamp).getTime() < 7 * 86400000);

    return {
      systemId: "recurring-delegation",
      title: "Proof-Backed Delegation",
      severity: recentDemotions.length > 0 ? "warning" : "info",
      summary: `${all.length} tracked workflows. ${highAutonomy.length} at bounded+ autonomy. ${recentDemotions.length} recent demotions.`,
      metrics: [
        { label: "Total Tracked", value: all.length },
        { label: "High Autonomy", value: highAutonomy.length },
        { label: "Recent Demotions", value: recentDemotions.length },
        ...Array.from(tierCounts.entries()).slice(0, 3).map(([tier, count]) => ({ label: tier.replace(/_/g, " "), value: count })),
      ],
      actionItems: recentDemotions.map(r => ({
        description: `${r.workflowFamily} demoted: ${r.demotionHistory[r.demotionHistory.length - 1].reason}`,
        priority: "high" as const,
        route: "/governance/delegation",
      })).slice(0, 3),
      drilldownRoute: "/governance/delegation",
    };
  }
}
