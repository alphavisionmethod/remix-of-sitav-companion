// ═══════════════════════════════════════════════════════════════
// SITA OS — Continuous Profit Engine
// Perpetual detect → recover → prioritize → track → learn loop
// ═══════════════════════════════════════════════════════════════

export type ProfitLever =
  | "missed-leads" | "slow-response" | "unclosed-loops" | "quote-delays"
  | "no-shows" | "underused-calendar" | "overdue-invoices" | "pricing-weakness"
  | "client-neglect" | "hidden-costs" | "inefficient-scheduling"
  | "over-servicing" | "subscription-waste" | "team-imbalance";

export type RecoveryCategory =
  | "recover-revenue" | "prevent-loss" | "improve-margin"
  | "improve-efficiency" | "improve-retention" | "improve-capacity";

export interface ProfitSignal {
  id: string;
  lever: ProfitLever;
  category: RecoveryCategory;
  title: string;
  description: string;
  estimatedValue: number;
  difficulty: "easy" | "moderate" | "hard";
  urgency: "low" | "medium" | "high" | "critical";
  actionRequired: string;
  detectedAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  outcomeValue: number | null; // actual value recovered
}

export interface ProfitLoopSummary {
  totalSignals: number;
  unresolvedSignals: number;
  totalAtRisk: number;
  totalRecovered: number;
  topLevers: { lever: ProfitLever; count: number; value: number }[];
  byCategory: { category: RecoveryCategory; count: number; value: number }[];
  easyWins: ProfitSignal[];
  criticalSignals: ProfitSignal[];
  learnings: ProfitLearning[];
}

export interface ProfitLearning {
  lever: ProfitLever;
  successRate: number;
  avgRecovery: number;
  insight: string;
}

export class ContinuousProfitEngine {
  private signals: ProfitSignal[] = [];

  constructor() {
    this.seedSignals();
  }

  getSignals(): ProfitSignal[] {
    return [...this.signals];
  }

  getUnresolved(): ProfitSignal[] {
    return this.signals.filter(s => !s.resolved);
  }

  addSignal(params: Omit<ProfitSignal, "id" | "detectedAt" | "resolved" | "resolvedAt" | "outcomeValue">): ProfitSignal {
    const signal: ProfitSignal = {
      ...params,
      id: `ps-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      detectedAt: new Date().toISOString(),
      resolved: false,
      resolvedAt: null,
      outcomeValue: null,
    };
    this.signals.push(signal);
    return signal;
  }

  resolveSignal(id: string, outcomeValue: number): boolean {
    const signal = this.signals.find(s => s.id === id);
    if (!signal) return false;
    signal.resolved = true;
    signal.resolvedAt = new Date().toISOString();
    signal.outcomeValue = outcomeValue;
    return true;
  }

  getSummary(): ProfitLoopSummary {
    const unresolved = this.getUnresolved();
    const resolved = this.signals.filter(s => s.resolved);

    // Aggregate by lever
    const leverMap = new Map<ProfitLever, { count: number; value: number }>();
    for (const s of unresolved) {
      const entry = leverMap.get(s.lever) ?? { count: 0, value: 0 };
      entry.count++;
      entry.value += s.estimatedValue;
      leverMap.set(s.lever, entry);
    }

    // Aggregate by category
    const catMap = new Map<RecoveryCategory, { count: number; value: number }>();
    for (const s of unresolved) {
      const entry = catMap.get(s.category) ?? { count: 0, value: 0 };
      entry.count++;
      entry.value += s.estimatedValue;
      catMap.set(s.category, entry);
    }

    // Learnings from resolved signals
    const learningMap = new Map<ProfitLever, { total: number; recovered: number; count: number }>();
    for (const s of resolved) {
      const entry = learningMap.get(s.lever) ?? { total: 0, recovered: 0, count: 0 };
      entry.total += s.estimatedValue;
      entry.recovered += s.outcomeValue ?? 0;
      entry.count++;
      learningMap.set(s.lever, entry);
    }

    const learnings: ProfitLearning[] = Array.from(learningMap.entries()).map(([lever, data]) => ({
      lever,
      successRate: data.count > 0 ? data.recovered / Math.max(data.total, 1) : 0,
      avgRecovery: data.count > 0 ? data.recovered / data.count : 0,
      insight: data.recovered > data.total * 0.5
        ? `${lever} actions are effective — continue prioritizing`
        : `${lever} recovery rate is low — consider different approach`,
    }));

    return {
      totalSignals: this.signals.length,
      unresolvedSignals: unresolved.length,
      totalAtRisk: unresolved.reduce((s, r) => s + r.estimatedValue, 0),
      totalRecovered: resolved.reduce((s, r) => s + (r.outcomeValue ?? 0), 0),
      topLevers: Array.from(leverMap.entries())
        .map(([lever, data]) => ({ lever, ...data }))
        .sort((a, b) => b.value - a.value),
      byCategory: Array.from(catMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.value - a.value),
      easyWins: unresolved.filter(s => s.difficulty === "easy").sort((a, b) => b.estimatedValue - a.estimatedValue).slice(0, 5),
      criticalSignals: unresolved.filter(s => s.urgency === "critical" || s.urgency === "high").sort((a, b) => b.estimatedValue - a.estimatedValue),
      learnings,
    };
  }

  private seedSignals() {
    this.addSignal({ lever: "overdue-invoices", category: "recover-revenue", title: "Atlas Corp invoice 15 days overdue", description: "$12,500 invoice from Atlas Corp has been overdue for 15 days with no response to reminders.", estimatedValue: 12500, difficulty: "easy", urgency: "high", actionRequired: "Send escalation notice and schedule call" });
    this.addSignal({ lever: "slow-response", category: "recover-revenue", title: "Rachel Adams lead going cold", description: "High-value lead ($28k) with no follow-up in 18 days.", estimatedValue: 28000, difficulty: "easy", urgency: "critical", actionRequired: "Call immediately and reschedule meeting" });
    this.addSignal({ lever: "unclosed-loops", category: "prevent-loss", title: "Open quote aging beyond 12 days", description: "$24,000 quote sent but no follow-up scheduled.", estimatedValue: 24000, difficulty: "moderate", urgency: "high", actionRequired: "Follow up with value-add message" });
    this.addSignal({ lever: "client-neglect", category: "improve-retention", title: "Meridian LLC at churn risk", description: "28 days since last contact, unresolved support ticket.", estimatedValue: 36000, difficulty: "moderate", urgency: "high", actionRequired: "Priority outreach with resolution plan" });
    this.addSignal({ lever: "pricing-weakness", category: "improve-margin", title: "Implementation margin below target", description: "Implementation work averaging 40% margin vs 65% target.", estimatedValue: 8000, difficulty: "hard", urgency: "medium", actionRequired: "Review pricing for implementation services" });
    this.addSignal({ lever: "underused-calendar", category: "improve-capacity", title: "15 hours of open slots this week", description: "Calendar has significant gaps that could be used for revenue-generating activities.", estimatedValue: 3750, difficulty: "easy", urgency: "low", actionRequired: "Fill with prospecting calls or project work" });
    this.addSignal({ lever: "subscription-waste", category: "improve-margin", title: "3 underused software subscriptions detected", description: "Tools with less than 10% utilization in the past 30 days.", estimatedValue: 720, difficulty: "easy", urgency: "low", actionRequired: "Review and cancel unused subscriptions" });
  }
}

let _instance: ContinuousProfitEngine | null = null;
export function getContinuousProfitEngine(): ContinuousProfitEngine {
  if (!_instance) _instance = new ContinuousProfitEngine();
  return _instance;
}
