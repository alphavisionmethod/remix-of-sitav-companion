// ═══════════════════════════════════════════════════════════════
// SITA OS — Decision Intelligence
// Values-weighted formal decision framework
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface DecisionOption {
  name: string;
  pros: string[];
  cons: string[];
  financialImpact: number;
  timeImpactHours: number;
  relationshipImpact: number; // -100 to 100
  reversibility: number; // 0-1 (1 = fully reversible)
  valueAlignments: Record<string, number>; // category → -1 to 1
}

export interface DecisionEvaluation {
  optionName: string;
  compositeScore: number;
  financialScore: number;
  timeScore: number;
  relationshipScore: number;
  reversibilityScore: number;
  valuesScore: number;
  regretMinimization: number;
  reasoning: string;
}

export interface SecondOrderEffect {
  option: string;
  horizon: '6mo' | '12mo' | '24mo';
  effects: { domain: string; description: string; magnitude: number }[];
}

export interface DecisionJournalEntry {
  id: string;
  decision: string;
  chosenOption: string;
  reasoning: string;
  expectedOutcome: string;
  actualOutcome?: string;
  satisfaction?: number; // 1-10
  decidedAt: string;
  reviewedAt?: string;
  lessonsLearned?: string;
}

export interface CollectiveDecisionResult {
  option: string;
  totalScore: number;
  memberScores: { memberId: string; score: number; weight: number }[];
  fairnessScore: number; // 0-1: how equally weighted
  consensus: boolean;
}

export class DecisionIntelligenceEngine {
  private journal: Map<string, DecisionJournalEntry> = new Map();
  private counter = 0;

  evaluateDecision(
    options: DecisionOption[],
    weights: { financial: number; time: number; relationship: number; reversibility: number; values: number } = { financial: 0.25, time: 0.15, relationship: 0.20, reversibility: 0.10, values: 0.30 }
  ): DecisionEvaluation[] {
    // Normalize financials
    const maxFinancial = Math.max(1, ...options.map(o => Math.abs(o.financialImpact)));
    const maxTime = Math.max(1, ...options.map(o => o.timeImpactHours));

    return options.map(option => {
      const financialScore = (option.financialImpact / maxFinancial + 1) / 2 * 100; // 0-100
      const timeScore = (1 - option.timeImpactHours / maxTime) * 100;
      const relationshipScore = (option.relationshipImpact + 100) / 2;
      const reversibilityScore = option.reversibility * 100;

      const valuesEntries = Object.values(option.valueAlignments);
      const valuesScore = valuesEntries.length > 0
        ? ((valuesEntries.reduce((s, v) => s + v, 0) / valuesEntries.length + 1) / 2) * 100
        : 50;

      // Regret minimization: reversible decisions with good values alignment score lowest regret
      const regretMinimization = (option.reversibility * 40) + (valuesScore * 0.4) + (relationshipScore * 0.2);

      const compositeScore = Math.round(
        financialScore * weights.financial +
        timeScore * weights.time +
        relationshipScore * weights.relationship +
        reversibilityScore * weights.reversibility +
        valuesScore * weights.values
      );

      return {
        optionName: option.name,
        compositeScore,
        financialScore: Math.round(financialScore),
        timeScore: Math.round(timeScore),
        relationshipScore: Math.round(relationshipScore),
        reversibilityScore: Math.round(reversibilityScore),
        valuesScore: Math.round(valuesScore),
        regretMinimization: Math.round(regretMinimization),
        reasoning: compositeScore > 70
          ? `Strong choice — well-aligned across most dimensions`
          : compositeScore > 45
          ? `Moderate — review trade-offs in ${financialScore < 40 ? 'financial impact' : timeScore < 40 ? 'time commitment' : 'values alignment'}`
          : `Weak — significant concerns in multiple dimensions`,
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);
  }

  projectSecondOrderEffects(option: DecisionOption): SecondOrderEffect[] {
    const horizons: ('6mo' | '12mo' | '24mo')[] = ['6mo', '12mo', '24mo'];
    return horizons.map(horizon => {
      const multiplier = horizon === '6mo' ? 1 : horizon === '12mo' ? 1.8 : 2.5;
      return {
        option: option.name, horizon,
        effects: [
          { domain: 'financial', description: `${option.financialImpact > 0 ? 'Positive' : 'Negative'} compounding at ${horizon}`, magnitude: Math.round(option.financialImpact * multiplier) },
          { domain: 'relationships', description: `Relationship impact ${option.relationshipImpact > 0 ? 'strengthens' : 'erodes'} over time`, magnitude: Math.round(option.relationshipImpact * (multiplier * 0.8)) },
          { domain: 'time', description: `Time investment ${option.timeImpactHours > 40 ? 'creates ongoing commitment' : 'is contained'}`, magnitude: Math.round(option.timeImpactHours * (horizon === '6mo' ? 6 : horizon === '12mo' ? 12 : 24) / 4) },
        ],
      };
    });
  }

  logDecision(decision: string, chosenOption: string, reasoning: string, expectedOutcome: string): DecisionJournalEntry {
    const id = `dec-${++this.counter}`;
    const entry: DecisionJournalEntry = { id, decision, chosenOption, reasoning, expectedOutcome, decidedAt: new Date().toISOString() };
    this.journal.set(id, entry);
    return entry;
  }

  reviewDecision(id: string, actualOutcome: string, satisfaction: number, lessonsLearned: string): DecisionJournalEntry | undefined {
    const entry = this.journal.get(id);
    if (!entry) return undefined;
    entry.actualOutcome = actualOutcome;
    entry.satisfaction = satisfaction;
    entry.lessonsLearned = lessonsLearned;
    entry.reviewedAt = new Date().toISOString();
    return entry;
  }

  collectiveDecision(
    familyMembers: { id: string; weight: number }[],
    options: { name: string }[],
    preferences: Record<string, Record<string, number>> // memberId → optionName → score (0-100)
  ): CollectiveDecisionResult[] {
    const totalWeight = familyMembers.reduce((s, m) => s + m.weight, 0);

    return options.map(option => {
      const memberScores = familyMembers.map(m => ({
        memberId: m.id, score: preferences[m.id]?.[option.name] ?? 50, weight: m.weight,
      }));
      const totalScore = memberScores.reduce((s, ms) => s + ms.score * (ms.weight / totalWeight), 0);

      // Fairness: how close are individual scores to each other (low variance = high fairness)
      const mean = totalScore;
      const variance = memberScores.reduce((s, ms) => s + Math.pow(ms.score - mean, 2), 0) / memberScores.length;
      const fairness = Math.max(0, 1 - Math.sqrt(variance) / 50);

      return {
        option: option.name,
        totalScore: Math.round(totalScore),
        memberScores,
        fairnessScore: Math.round(fairness * 100) / 100,
        consensus: fairness > 0.7 && totalScore > 60,
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }

  getJournal(): DecisionJournalEntry[] { return [...this.journal.values()]; }

  getDecisionPatterns(): { avgSatisfaction: number; totalDecisions: number; reviewedPct: number } {
    const entries = [...this.journal.values()];
    const reviewed = entries.filter(e => e.satisfaction !== undefined);
    return {
      totalDecisions: entries.length,
      avgSatisfaction: reviewed.length > 0 ? reviewed.reduce((s, e) => s + (e.satisfaction ?? 0), 0) / reviewed.length : 0,
      reviewedPct: entries.length > 0 ? Math.round((reviewed.length / entries.length) * 100) : 0,
    };
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("decision-intelligence", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      journal: Array.from(this.journal.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.journal) this.journal = new Map(state.journal as Iterable<[string, never]>) as typeof this.journal;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("decision-intelligence");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createDecisionIntelligence = () => new DecisionIntelligenceEngine();
