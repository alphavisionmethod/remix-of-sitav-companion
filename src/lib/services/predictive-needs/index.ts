// ═══════════════════════════════════════════════════════════════
// SITA OS — Predictive Needs Engine
// Proactive cross-domain need anticipation
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type NeedCategory = 'financial' | 'business' | 'household' | 'health' | 'legal' | 'education';
export type NeedUrgency = 'immediate' | 'this-week' | 'this-month' | 'this-quarter';

export interface PredictedNeed {
  id: string;
  category: NeedCategory;
  title: string;
  description: string;
  confidence: number; // 0-1
  urgency: NeedUrgency;
  recommendedAction: string;
  estimatedImpact: number; // dollars saved/earned or risk avoided
  daysUntil: number;
  source: string; // which pattern detected this
}

export interface TemporalPattern {
  id: string;
  label: string;
  cycle: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'annual';
  nextOccurrence: string;
  confidence: number;
}

export interface PredictionOutcome {
  predictionId: string;
  accurate: boolean;
  actualOutcome: string;
  feedbackAt: string;
}

export class PredictiveNeedsEngine {
  private predictions: Map<string, PredictedNeed> = new Map();
  private patterns: TemporalPattern[] = [];
  private outcomes: PredictionOutcome[] = [];
  private counter = 0;
  private accuracySum = 0;
  private totalFeedback = 0;

  predictNeeds(params: {
    bills: { name: string; amount: number; dueDate: string; recurring: boolean }[];
    budgets: { category: string; spent: number; limit: number }[];
    contracts: { vendor: string; endDate: string; amount: number; engagement?: number }[];
    cashflow: { checking: number; savings: number; monthlyExpenses: number };
    goals: { title: string; deadline: string; funded: boolean }[];
  }, horizonDays = 90): PredictedNeed[] {
    const needs: PredictedNeed[] = [];
    const now = Date.now();

    // Bill predictions
    for (const bill of params.bills) {
      const daysUntil = Math.ceil((new Date(bill.dueDate).getTime() - now) / (1000 * 60 * 60 * 24));
      if (daysUntil > 0 && daysUntil <= horizonDays) {
        if (params.cashflow.checking < bill.amount + params.cashflow.monthlyExpenses) {
          needs.push(this.createNeed('financial',
            `Insufficient funds for ${bill.name}`,
            `${bill.name} ($${bill.amount}) due in ${daysUntil} days. Current checking won't cover it after monthly expenses.`,
            0.85, daysUntil <= 7 ? 'immediate' : 'this-month',
            `Move $${Math.ceil(bill.amount * 1.1)} from savings to checking`,
            bill.amount, daysUntil, 'cashflow-forecast'
          ));
        }
      }
    }

    // Budget overrun predictions
    for (const budget of params.budgets) {
      const pct = budget.spent / budget.limit;
      const daysInMonth = 30;
      const daysPassed = 15; // approximate mid-month
      const projectedSpend = (budget.spent / daysPassed) * daysInMonth;
      if (projectedSpend > budget.limit * 1.1) {
        const overrun = Math.round(projectedSpend - budget.limit);
        needs.push(this.createNeed('financial',
          `${budget.category} budget overrun projected`,
          `At current pace, ${budget.category} will exceed budget by $${overrun}.`,
          0.7 + pct * 0.2, 'this-week',
          `Reduce ${budget.category} spending by $${Math.round(overrun / (daysInMonth - daysPassed))}/day`,
          overrun, daysInMonth - daysPassed, 'budget-projection'
        ));
      }
    }

    // Contract renewal predictions
    for (const contract of params.contracts) {
      const daysUntil = Math.ceil((new Date(contract.endDate).getTime() - now) / (1000 * 60 * 60 * 24));
      if (daysUntil > 0 && daysUntil <= horizonDays) {
        const engagement = contract.engagement ?? 100;
        needs.push(this.createNeed('business',
          `${contract.vendor} contract ending`,
          `Contract ends in ${daysUntil} days. ${engagement < 70 ? `Engagement dropped to ${engagement}%. Retention risk.` : 'Good engagement.'}`,
          0.9, daysUntil <= 14 ? 'immediate' : daysUntil <= 30 ? 'this-week' : 'this-month',
          engagement < 70 ? 'Schedule retention call this week' : 'Prepare renewal proposal',
          contract.amount * 12, daysUntil, 'contract-timeline'
        ));
      }
    }

    // Goal funding predictions
    for (const goal of params.goals) {
      if (!goal.funded) {
        const daysUntil = Math.ceil((new Date(goal.deadline).getTime() - now) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= horizonDays) {
          needs.push(this.createNeed('financial',
            `Goal "${goal.title}" unfunded`,
            `Deadline in ${daysUntil} days but funding not secured.`,
            0.75, daysUntil <= 30 ? 'this-week' : 'this-month',
            'Review goal funding and allocate resources',
            0, daysUntil, 'goal-tracker'
          ));
        }
      }
    }

    // Store and return sorted by urgency + confidence
    for (const n of needs) this.predictions.set(n.id, n);
    return needs.sort((a, b) => {
      const urgOrder: Record<NeedUrgency, number> = { immediate: 0, 'this-week': 1, 'this-month': 2, 'this-quarter': 3 };
      return (urgOrder[a.urgency] - urgOrder[b.urgency]) || (b.confidence - a.confidence);
    });
  }

  learnFromOutcome(predictionId: string, accurate: boolean, actualOutcome: string): void {
    this.outcomes.push({ predictionId, accurate, actualOutcome, feedbackAt: new Date().toISOString() });
    this.accuracySum += accurate ? 1 : 0;
    this.totalFeedback++;
  }

  getAccuracy(): number {
    return this.totalFeedback > 0 ? this.accuracySum / this.totalFeedback : 0;
  }

  detectPatterns(events: { type: string; date: string }[]): TemporalPattern[] {
    const byType: Record<string, string[]> = {};
    for (const e of events) {
      (byType[e.type] ||= []).push(e.date);
    }

    this.patterns = [];
    for (const [type, dates] of Object.entries(byType)) {
      if (dates.length < 2) continue;
      const sorted = dates.map(d => new Date(d).getTime()).sort((a, b) => a - b);
      const gaps = sorted.slice(1).map((d, i) => d - sorted[i]);
      const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
      const dayGap = avgGap / (1000 * 60 * 60 * 24);

      const cycle: TemporalPattern['cycle'] = dayGap < 2 ? 'daily' : dayGap < 10 ? 'weekly' : dayGap < 45 ? 'monthly' : dayGap < 120 ? 'seasonal' : 'annual';
      const next = new Date(sorted[sorted.length - 1] + avgGap);

      this.patterns.push({
        id: `pat-${type}`, label: type, cycle, nextOccurrence: next.toISOString(),
        confidence: Math.min(0.95, 0.5 + dates.length * 0.1),
      });
    }
    return this.patterns;
  }

  private createNeed(category: NeedCategory, title: string, description: string, confidence: number, urgency: NeedUrgency, action: string, impact: number, daysUntil: number, source: string): PredictedNeed {
    return {
      id: `need-${++this.counter}`, category, title, description,
      confidence: Math.round(confidence * 100) / 100, urgency,
      recommendedAction: action, estimatedImpact: impact, daysUntil, source,
    };
  }

  listPredictions(): PredictedNeed[] { return [...this.predictions.values()]; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("predictive-needs", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      predictions: Array.from(this.predictions.entries()),
      patterns: this.patterns,
      outcomes: this.outcomes,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.predictions) this.predictions = new Map(state.predictions as any);
    if (state.patterns) this.patterns = state.patterns as any;
    if (state.outcomes) this.outcomes = state.outcomes as any;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("predictive-needs");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createPredictiveNeeds = () => new PredictiveNeedsEngine();
