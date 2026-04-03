// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue & Opportunity Engine
// Leakage detection, recovery, ranking, recovered value ledger
// ═══════════════════════════════════════════════════════════════

import type {
  LeakageSignal, LeakageType, RecoveredValue, RecoveredValueLedger,
  OpportunityRanking, CapacitySlot, NegotiationOpportunity,
  RevenueAutopilotConfig, OutcomeRecord,
} from "../types/revenue-engine.types";

const DEFAULT_CONFIG: RevenueAutopilotConfig = {
  enabled: true,
  aggressiveness: "balanced",
  autoRecoverBelow: 500,
  autoFollowUpEnabled: true,
  followUpMaxAttempts: 3,
  followUpCooldownHours: 24,
  excludedCustomers: [],
  excludedCategories: [],
  dailyActionLimit: 20,
  requireApprovalAbove: 1000,
};

export class RevenueOpportunityEngine {
  private signals: Map<string, LeakageSignal> = new Map();
  private recoveries: RecoveredValue[] = [];
  private outcomes: OutcomeRecord[] = [];
  private config: RevenueAutopilotConfig;

  constructor(config: Partial<RevenueAutopilotConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Leakage Detection ───────────────────────────────────────
  detectLeakage(signal: Omit<LeakageSignal, "id" | "detectedAt" | "status">): LeakageSignal {
    if (this.config.excludedCategories.includes(signal.type)) {
      throw new Error(`Category ${signal.type} is excluded from detection`);
    }

    const leakage: LeakageSignal = {
      ...signal,
      id: `leak_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      detectedAt: new Date().toISOString(),
      status: "detected",
    };

    this.signals.set(leakage.id, leakage);
    return leakage;
  }

  // ── Signal Ranking ──────────────────────────────────────────
  rankOpportunities(): OpportunityRanking[] {
    const active = Array.from(this.signals.values()).filter(s =>
      s.status !== "recovered" && s.status !== "expired" && s.status !== "dismissed"
    );

    return active.map(signal => {
      const urgencyScore = signal.expiresAt
        ? Math.max(0, 1 - (new Date(signal.expiresAt).getTime() - Date.now()) / (7 * 86400000))
        : 0.5;

      const effortMap = { trivial: 1, low: 0.8, medium: 0.5, high: 0.2 };
      const effortScore = effortMap["low"]; // Default

      const factors = {
        value: Math.min(signal.estimatedValue / 10000, 1),
        urgency: urgencyScore,
        effort: effortScore,
        trustRequirement: signal.confidence,
        downstreamImpact: Math.min(signal.relatedRecords.length / 5, 1),
        probability: signal.confidence,
      };

      const score = (
        factors.value * 0.3 +
        factors.urgency * 0.25 +
        factors.effort * 0.15 +
        factors.probability * 0.15 +
        factors.downstreamImpact * 0.1 +
        (1 - factors.trustRequirement) * 0.05
      );

      return { opportunityId: signal.id, rank: 0, score, factors };
    }).sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }));
  }

  // ── Recovery ────────────────────────────────────────────────
  markRecovered(leakageId: string, recovery: Omit<RecoveredValue, "id" | "leakageId" | "recoveredAt">): RecoveredValue {
    const signal = this.signals.get(leakageId);
    if (!signal) throw new Error(`Leakage ${leakageId} not found`);

    signal.status = "recovered";
    const record: RecoveredValue = {
      ...recovery,
      id: `recovery_${Date.now()}`,
      leakageId,
      recoveredAt: new Date().toISOString(),
    };

    this.recoveries.push(record);
    return record;
  }

  // ── Recovered Value Ledger ──────────────────────────────────
  getLedger(period: string = "all_time"): RecoveredValueLedger {
    const byType: Record<string, number> = {};
    const byDomain: Record<string, number> = {};
    const byAdvisor: Record<string, number> = {};
    const byMonth: Map<string, number> = new Map();
    let autoCount = 0;

    for (const r of this.recoveries) {
      byType[r.type] = (byType[r.type] || 0) + r.recoveredAmount;
      byDomain[r.domain] = (byDomain[r.domain] || 0) + r.recoveredAmount;
      byAdvisor[r.advisorId] = (byAdvisor[r.advisorId] || 0) + r.recoveredAmount;

      const month = r.recoveredAt.slice(0, 7);
      byMonth.set(month, (byMonth.get(month) || 0) + r.recoveredAmount);

      if (r.automationLevel === "fully_automatic") autoCount++;
    }

    const total = this.recoveries.reduce((s, r) => s + r.recoveredAmount, 0);

    return {
      totalRecovered: total,
      currency: "USD",
      period,
      byType: byType as Record<LeakageType, number>,
      byDomain,
      byAdvisor,
      byMonth: Array.from(byMonth.entries()).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month)),
      automatedPercent: this.recoveries.length > 0 ? (autoCount / this.recoveries.length) * 100 : 0,
      topRecoveries: [...this.recoveries].sort((a, b) => b.recoveredAmount - a.recoveredAmount).slice(0, 10),
    };
  }

  // ── Outcome Tracking ────────────────────────────────────────
  recordOutcome(outcome: Omit<OutcomeRecord, "id" | "timestamp">): OutcomeRecord {
    const record: OutcomeRecord = {
      ...outcome,
      id: `outcome_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.outcomes.push(record);
    return record;
  }

  getOutcomeSummary(): { totalValue: number; byType: Record<string, number>; count: number } {
    const byType: Record<string, number> = {};
    let total = 0;
    for (const o of this.outcomes) {
      byType[o.type] = (byType[o.type] || 0) + o.value;
      total += o.value;
    }
    return { totalValue: total, byType, count: this.outcomes.length };
  }

  // ── Auto-Action Decision ────────────────────────────────────
  shouldAutoRecover(signal: LeakageSignal): { auto: boolean; reason: string } {
    if (!this.config.enabled) return { auto: false, reason: "Autopilot disabled" };
    if (signal.estimatedValue > this.config.requireApprovalAbove) return { auto: false, reason: `Amount $${signal.estimatedValue} exceeds approval threshold $${this.config.requireApprovalAbove}` };
    if (signal.confidence < 0.7) return { auto: false, reason: `Confidence ${signal.confidence} too low for auto-recovery` };
    if (this.config.excludedCustomers.some(c => signal.entityId === c)) return { auto: false, reason: "Customer excluded" };
    return { auto: true, reason: "Meets all auto-recovery criteria" };
  }

  // ── Stats ───────────────────────────────────────────────────
  getStats() {
    const active = Array.from(this.signals.values());
    return {
      detected: active.filter(s => s.status === "detected").length,
      inRecovery: active.filter(s => s.status === "in_recovery").length,
      recovered: active.filter(s => s.status === "recovered").length,
      expired: active.filter(s => s.status === "expired").length,
      totalPotentialValue: active.filter(s => s.status !== "recovered" && s.status !== "expired").reduce((s, sig) => s + sig.estimatedValue, 0),
      totalRecoveredValue: this.recoveries.reduce((s, r) => s + r.recoveredAmount, 0),
    };
  }
}
