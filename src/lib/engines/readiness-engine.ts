// ═══════════════════════════════════════════════════════════════
// SITA OS — Readiness-to-Delegate Engine
// Pure computation for delegation readiness scoring.
// Consumes trust debt, execution debt, proof, and policy data.
// ═══════════════════════════════════════════════════════════════

import type {
  ReadinessScore, ReadinessSubscore, DelegationTier,
  GovernanceBoardroomSection, TrendDirection,
} from "../types/meta-governance.types";
import type { EntityScope } from "../types/os-unified.types";
import { TrustDebtEngine } from "./trust-debt-engine";
import { ExecutionDebtEngine } from "./execution-debt-engine";

const TIER_THRESHOLDS: Record<DelegationTier, number> = {
  observe: 0,
  suggest: 0.2,
  draft: 0.35,
  approval_every: 0.5,
  approval_exceptions: 0.65,
  bounded_recurring: 0.8,
  expanded_recurring: 0.92,
};

const TIER_ORDER: DelegationTier[] = [
  "observe", "suggest", "draft", "approval_every",
  "approval_exceptions", "bounded_recurring", "expanded_recurring",
];

function determineTier(score: number): DelegationTier {
  let tier: DelegationTier = "observe";
  for (const t of TIER_ORDER) {
    if (score >= TIER_THRESHOLDS[t]) tier = t;
  }
  return tier;
}

export interface ReadinessInput {
  proofCompleteness: { rate: number; evidence: string[] };
  replaySafety: { rate: number; evidence: string[] };
  rollbackReadiness: { rate: number; evidence: string[] };
  policyMaturity: { score: number; evidence: string[] };
  errorRate: { rate: number; evidence: string[] };
  approvalBehavior: { autoApprovalRate: number; evidence: string[] };
  connectorStability: { uptimeRate: number; evidence: string[] };
  observabilityQuality: { coverage: number; evidence: string[] };
  supportBurden: { ticketRate: number; evidence: string[] };
  confidenceQuality: { avgConfidence: number; evidence: string[] };
}

const SUBSCORE_WEIGHTS: Record<keyof ReadinessInput, number> = {
  proofCompleteness: 0.15,
  replaySafety: 0.10,
  rollbackReadiness: 0.10,
  policyMaturity: 0.10,
  errorRate: 0.12,
  approvalBehavior: 0.08,
  connectorStability: 0.10,
  observabilityQuality: 0.08,
  supportBurden: 0.07,
  confidenceQuality: 0.10,
};

export class ReadinessEngine {
  private history: Map<string, { timestamp: string; score: number; tier: DelegationTier }[]> = new Map();

  /** Compute readiness score from all inputs + debt engines */
  compute(
    input: ReadinessInput,
    trustDebt: TrustDebtEngine,
    executionDebt: ExecutionDebtEngine,
    entityScope: EntityScope,
  ): ReadinessScore {
    const trustDebtScore = 1 - trustDebt.computeDebtScore();
    const execDebtScore = 1 - executionDebt.computeDebtScore();

    const subscores: ReadinessScore["subscores"] = {
      proofCompleteness: this.buildSubscore(input.proofCompleteness.rate, SUBSCORE_WEIGHTS.proofCompleteness, input.proofCompleteness.evidence),
      replaySafety: this.buildSubscore(input.replaySafety.rate, SUBSCORE_WEIGHTS.replaySafety, input.replaySafety.evidence),
      rollbackReadiness: this.buildSubscore(input.rollbackReadiness.rate, SUBSCORE_WEIGHTS.rollbackReadiness, input.rollbackReadiness.evidence),
      policyMaturity: this.buildSubscore(input.policyMaturity.score, SUBSCORE_WEIGHTS.policyMaturity, input.policyMaturity.evidence),
      errorRate: this.buildSubscore(1 - input.errorRate.rate, SUBSCORE_WEIGHTS.errorRate, input.errorRate.evidence),
      trustDebt: this.buildSubscore(trustDebtScore, 0.10, [`Trust debt score: ${trustDebtScore.toFixed(2)}`]),
      executionDebt: this.buildSubscore(execDebtScore, 0.10, [`Execution debt score: ${execDebtScore.toFixed(2)}`]),
      approvalBehavior: this.buildSubscore(input.approvalBehavior.autoApprovalRate, SUBSCORE_WEIGHTS.approvalBehavior, input.approvalBehavior.evidence),
      connectorStability: this.buildSubscore(input.connectorStability.uptimeRate, SUBSCORE_WEIGHTS.connectorStability, input.connectorStability.evidence),
      observabilityQuality: this.buildSubscore(input.observabilityQuality.coverage, SUBSCORE_WEIGHTS.observabilityQuality, input.observabilityQuality.evidence),
      supportBurden: this.buildSubscore(1 - input.supportBurden.ticketRate, SUBSCORE_WEIGHTS.supportBurden, input.supportBurden.evidence),
      confidenceQuality: this.buildSubscore(input.confidenceQuality.avgConfidence, SUBSCORE_WEIGHTS.confidenceQuality, input.confidenceQuality.evidence),
    };

    const totalWeight = Object.values(subscores).reduce((s, sub) => s + sub.weight, 0);
    const compositeScore = Object.values(subscores).reduce((s, sub) => s + sub.value * sub.weight, 0) / totalWeight;
    const recommendedTier = determineTier(compositeScore);

    const key = entityScope.ownerId;
    const hist = this.history.get(key) ?? [];
    const entry = { timestamp: new Date().toISOString(), score: compositeScore, tier: recommendedTier };
    hist.push(entry);
    if (hist.length > 100) hist.splice(0, hist.length - 100);
    this.history.set(key, hist);

    return {
      compositeScore,
      recommendedTier,
      subscores,
      explanation: this.generateExplanation(compositeScore, recommendedTier, subscores),
      entityScope,
      computedAt: entry.timestamp,
      history: hist,
    };
  }

  /** Get score history for an entity */
  getHistory(entityOwnerId: string): { timestamp: string; score: number; tier: DelegationTier }[] {
    return this.history.get(entityOwnerId) ?? [];
  }

  /** Check if promotion is safe */
  canPromote(currentTier: DelegationTier, score: ReadinessScore): { allowed: boolean; reason: string } {
    const currentIdx = TIER_ORDER.indexOf(currentTier);
    const nextTier = TIER_ORDER[currentIdx + 1];
    if (!nextTier) return { allowed: false, reason: "Already at maximum autonomy tier" };

    if (score.compositeScore < TIER_THRESHOLDS[nextTier]) {
      return { allowed: false, reason: `Score ${score.compositeScore.toFixed(2)} below threshold ${TIER_THRESHOLDS[nextTier]} for ${nextTier}` };
    }

    // Block promotion if any critical subscore is too low
    const criticalSubscores = [score.subscores.proofCompleteness, score.subscores.trustDebt, score.subscores.errorRate];
    const blockingLow = criticalSubscores.find(s => s.value < 0.4);
    if (blockingLow) {
      return { allowed: false, reason: `Critical subscore too low (${blockingLow.value.toFixed(2)}) — proof, trust debt, or error rate needs improvement` };
    }

    return { allowed: true, reason: `Score ${score.compositeScore.toFixed(2)} meets threshold for ${nextTier}` };
  }

  /** Check if demotion is needed */
  shouldDemote(currentTier: DelegationTier, score: ReadinessScore): { demote: boolean; toTier: DelegationTier; reason: string } {
    if (currentTier === "observe") return { demote: false, toTier: "observe", reason: "Already at minimum tier" };

    const currentThreshold = TIER_THRESHOLDS[currentTier];
    if (score.compositeScore < currentThreshold * 0.85) {
      const newTier = determineTier(score.compositeScore);
      return { demote: true, toTier: newTier, reason: `Score ${score.compositeScore.toFixed(2)} dropped below ${(currentThreshold * 0.85).toFixed(2)} threshold for ${currentTier}` };
    }

    // Force demotion if trust debt is critical
    if (score.subscores.trustDebt.value < 0.2) {
      const currentIdx = TIER_ORDER.indexOf(currentTier);
      const demoteTo = TIER_ORDER[Math.max(0, currentIdx - 2)];
      return { demote: true, toTier: demoteTo, reason: "Trust debt critically high — forcing demotion for safety" };
    }

    return { demote: false, toTier: currentTier, reason: "Score within acceptable range" };
  }

  /** Boardroom section */
  getBoardroomSection(scores: ReadinessScore[]): GovernanceBoardroomSection {
    const avgScore = scores.length > 0 ? scores.reduce((s, r) => s + r.compositeScore, 0) / scores.length : 0;
    const tierCounts = new Map<DelegationTier, number>();
    for (const s of scores) tierCounts.set(s.recommendedTier, (tierCounts.get(s.recommendedTier) ?? 0) + 1);

    return {
      systemId: "readiness-to-delegate",
      title: "Readiness to Delegate",
      severity: avgScore < 0.3 ? "warning" : "info",
      summary: `Average readiness: ${(avgScore * 100).toFixed(0)}% across ${scores.length} evaluated workflows`,
      metrics: [
        { label: "Average Readiness", value: `${(avgScore * 100).toFixed(0)}%` },
        { label: "Workflows Evaluated", value: scores.length },
        ...Array.from(tierCounts.entries()).map(([tier, count]) => ({ label: tier.replace(/_/g, " "), value: count })),
      ],
      actionItems: scores
        .filter(s => s.compositeScore < 0.5)
        .slice(0, 3)
        .map(s => ({
          description: `Improve readiness for ${s.entityScope.ownerId}: ${s.explanation.slice(0, 100)}`,
          priority: s.compositeScore < 0.3 ? "high" as const : "medium" as const,
          route: "/governance/delegation",
        })),
      drilldownRoute: "/governance/delegation",
    };
  }

  private buildSubscore(value: number, weight: number, evidence: string[]): ReadinessSubscore {
    const prevHistory = Array.from(this.history.values()).flat();
    const trend: TrendDirection = prevHistory.length < 2 ? "stable"
      : prevHistory[prevHistory.length - 1].score > prevHistory[prevHistory.length - 2].score ? "improving" : "stable";
    return { value: Math.max(0, Math.min(1, value)), weight, evidence, trend };
  }

  private generateExplanation(score: number, tier: DelegationTier, subscores: ReadinessScore["subscores"]): string {
    const weak = Object.entries(subscores)
      .filter(([, s]) => s.value < 0.5)
      .sort(([, a], [, b]) => a.value - b.value)
      .map(([k]) => k.replace(/([A-Z])/g, " $1").toLowerCase().trim());

    if (weak.length === 0) return `Strong readiness (${(score * 100).toFixed(0)}%). Recommended: ${tier.replace(/_/g, " ")}. All dimensions healthy.`;
    return `Readiness ${(score * 100).toFixed(0)}%. Recommended: ${tier.replace(/_/g, " ")}. Weak areas: ${weak.join(", ")}. Address these before promoting autonomy.`;
  }
}

