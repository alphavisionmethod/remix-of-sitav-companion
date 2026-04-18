// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Reflection & Learning Engine
// Tracks owner actions to improve advisor accuracy over time
// ═══════════════════════════════════════════════════════════════

export type OwnerAction = "approved" | "rejected" | "ignored" | "modified" | "deferred";

export interface ReflectionEntry {
  id: string;
  advisorId: string;
  recommendationTitle: string;
  ownerAction: OwnerAction;
  confidenceAtTime: number;
  outcomeObserved: boolean;
  outcomePositive: boolean | null;
  notes: string;
  createdAt: string;
}

export interface AdvisorAccuracy {
  advisorId: string;
  totalRecommendations: number;
  approved: number;
  rejected: number;
  ignored: number;
  modified: number;
  deferred: number;
  approvalRate: number;
  outcomeSuccessRate: number;
  avgConfidence: number;
  trend: "improving" | "stable" | "declining";
}

export interface ReflectionSummary {
  totalEntries: number;
  periodStart: string;
  periodEnd: string;
  wins: string[];
  misses: string[];
  patternsDetected: string[];
  advisorAccuracy: AdvisorAccuracy[];
  topPerformingAdvisor: string | null;
  leastUsefulAdvisor: string | null;
}

export class AdvisorReflectionEngine {
  private entries: ReflectionEntry[] = [];

  recordAction(params: {
    advisorId: string;
    recommendationTitle: string;
    ownerAction: OwnerAction;
    confidenceAtTime: number;
    notes?: string;
  }): ReflectionEntry {
    const entry: ReflectionEntry = {
      id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...params,
      notes: params.notes ?? "",
      outcomeObserved: false,
      outcomePositive: null,
      createdAt: new Date().toISOString(),
    };
    this.entries.push(entry);
    return entry;
  }

  recordOutcome(entryId: string, positive: boolean): boolean {
    const entry = this.entries.find(e => e.id === entryId);
    if (!entry) return false;
    entry.outcomeObserved = true;
    entry.outcomePositive = positive;
    return true;
  }

  getAdvisorAccuracy(advisorId: string): AdvisorAccuracy {
    const relevant = this.entries.filter(e => e.advisorId === advisorId);
    const withOutcome = relevant.filter(e => e.outcomeObserved);
    const positiveOutcomes = withOutcome.filter(e => e.outcomePositive);

    const approved = relevant.filter(e => e.ownerAction === "approved").length;
    const total = relevant.length;

    // Determine trend from last 10 vs previous 10
    const sorted = [...relevant].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recent = sorted.slice(0, 10);
    const previous = sorted.slice(10, 20);
    const recentApprovalRate = recent.length > 0 ? recent.filter(e => e.ownerAction === "approved").length / recent.length : 0;
    const previousApprovalRate = previous.length > 0 ? previous.filter(e => e.ownerAction === "approved").length / previous.length : 0;
    const trend: AdvisorAccuracy["trend"] = recentApprovalRate > previousApprovalRate + 0.1 ? "improving" : recentApprovalRate < previousApprovalRate - 0.1 ? "declining" : "stable";

    return {
      advisorId,
      totalRecommendations: total,
      approved,
      rejected: relevant.filter(e => e.ownerAction === "rejected").length,
      ignored: relevant.filter(e => e.ownerAction === "ignored").length,
      modified: relevant.filter(e => e.ownerAction === "modified").length,
      deferred: relevant.filter(e => e.ownerAction === "deferred").length,
      approvalRate: total > 0 ? approved / total : 0,
      outcomeSuccessRate: withOutcome.length > 0 ? positiveOutcomes.length / withOutcome.length : 0,
      avgConfidence: total > 0 ? relevant.reduce((s, e) => s + e.confidenceAtTime, 0) / total : 0,
      trend,
    };
  }

  generateWeeklySummary(advisorIds: string[]): ReflectionSummary {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const weekEntries = this.entries.filter(e => e.createdAt >= weekAgo);
    const accuracy = advisorIds.map(id => this.getAdvisorAccuracy(id));

    const approvedEntries = weekEntries.filter(e => e.ownerAction === "approved" && e.outcomePositive);
    const rejectedEntries = weekEntries.filter(e => e.ownerAction === "rejected");
    const ignoredCount = weekEntries.filter(e => e.ownerAction === "ignored").length;

    // Detect patterns
    const patterns: string[] = [];
    if (ignoredCount > weekEntries.length * 0.5 && weekEntries.length > 3) {
      patterns.push("Over half of recommendations were ignored — consider adjusting advisor intensity");
    }
    const financialRejections = rejectedEntries.filter(e => e.notes.toLowerCase().includes("finance") || e.notes.toLowerCase().includes("cost"));
    if (financialRejections.length > 2) {
      patterns.push("Multiple financial recommendations rejected — owner may prefer conservative approach");
    }

    const sorted = accuracy.filter(a => a.totalRecommendations > 0).sort((a, b) => b.approvalRate - a.approvalRate);

    return {
      totalEntries: weekEntries.length,
      periodStart: weekAgo,
      periodEnd: new Date().toISOString(),
      wins: approvedEntries.slice(0, 3).map(e => `${e.recommendationTitle} — approved and worked`),
      misses: rejectedEntries.slice(0, 3).map(e => `${e.recommendationTitle} — rejected: ${e.notes || "no reason given"}`),
      patternsDetected: patterns,
      advisorAccuracy: accuracy,
      topPerformingAdvisor: sorted[0]?.advisorId ?? null,
      leastUsefulAdvisor: sorted[sorted.length - 1]?.advisorId ?? null,
    };
  }

  getEntries(): ReflectionEntry[] {
    return [...this.entries];
  }
}

let _instance: AdvisorReflectionEngine | null = null;
export function getAdvisorReflectionEngine(): AdvisorReflectionEngine {
  if (!_instance) _instance = new AdvisorReflectionEngine();
  return _instance;
}
