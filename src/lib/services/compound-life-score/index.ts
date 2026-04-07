// ═══════════════════════════════════════════════════════════════
// SITA OS — Compound Life Score (0-1000)
// One number capturing how your entire life is trending
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface LifeScoreDimension {
  name: string;
  weight: number;
  score: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  topDriver: string;
  topDrag: string;
}

export interface LifeScoreInput {
  financial: { netWorthTrajectory: number; debtRatio: number; savingsRate: number; reserveAdequacy: number };
  business: { revenueGrowth: number; customerHealth: number; pipelineStrength: number };
  relationships: { networkHealth: number; familyEngagement: number; reciprocityBalance: number };
  timeEfficiency: { roiOnHours: number; delegationRate: number; timeDebtLevel: number };
  health: { activityConsistency: number; sleepQuality: number; stressLevel: number };
  skills: { learningVelocity: number; skillMonetization: number; certificationProgress: number };
  goals: { progressVelocity: number; milestoneHitRate: number };
  resilience: { emergencyFundPct: number; insuranceCoverage: number; shockSurvival: number };
}

export interface CompoundLifeScoreResult {
  score: number; // 0-1000
  dimensions: LifeScoreDimension[];
  topLifters: string[];
  topDraggers: string[];
  projectedScore: { months3: number; months6: number; months12: number };
  sparkline: number[]; // last 12 data points
}

export class CompoundLifeScoreEngine {
  private history: number[] = [];

  private readonly WEIGHTS = {
    financial: 0.20, business: 0.15, relationships: 0.10, timeEfficiency: 0.10,
    health: 0.15, skills: 0.10, goals: 0.10, resilience: 0.10,
  };

  computeScore(input: LifeScoreInput): CompoundLifeScoreResult {
    const dimensions: LifeScoreDimension[] = [
      this.scoreDimension('Financial Health', this.WEIGHTS.financial, input.financial, ['netWorthTrajectory', 'savingsRate'], ['debtRatio']),
      this.scoreDimension('Business Vitality', this.WEIGHTS.business, input.business, ['revenueGrowth', 'pipelineStrength'], ['customerHealth']),
      this.scoreDimension('Relationship Wealth', this.WEIGHTS.relationships, input.relationships, ['networkHealth', 'familyEngagement'], ['reciprocityBalance']),
      this.scoreDimension('Time Efficiency', this.WEIGHTS.timeEfficiency, input.timeEfficiency, ['roiOnHours', 'delegationRate'], ['timeDebtLevel']),
      this.scoreDimension('Health & Energy', this.WEIGHTS.health, input.health, ['activityConsistency', 'sleepQuality'], ['stressLevel']),
      this.scoreDimension('Skills & Growth', this.WEIGHTS.skills, input.skills, ['learningVelocity', 'skillMonetization'], ['certificationProgress']),
      this.scoreDimension('Goal Momentum', this.WEIGHTS.goals, input.goals, ['progressVelocity', 'milestoneHitRate'], []),
      this.scoreDimension('Resilience', this.WEIGHTS.resilience, input.resilience, ['emergencyFundPct', 'insuranceCoverage'], ['shockSurvival']),
    ];

    const rawScore = dimensions.reduce((s, d) => s + d.score * d.weight, 0);
    const score = Math.round(rawScore * 10); // scale to 0-1000

    this.history.push(score);
    if (this.history.length > 12) this.history.shift();

    const sorted = [...dimensions].sort((a, b) => b.score - a.score);
    const topLifters = sorted.slice(0, 3).map(d => `${d.name}: ${d.topDriver}`);
    const topDraggers = sorted.slice(-3).map(d => `${d.name}: ${d.topDrag}`);

    // Simple linear projection
    const trend = this.history.length >= 2 ? (this.history[this.history.length - 1] - this.history[this.history.length - 2]) : 0;

    return {
      score: Math.max(0, Math.min(1000, score)),
      dimensions,
      topLifters,
      topDraggers,
      projectedScore: {
        months3: Math.max(0, Math.min(1000, score + trend * 3)),
        months6: Math.max(0, Math.min(1000, score + trend * 6)),
        months12: Math.max(0, Math.min(1000, score + trend * 12)),
      },
      sparkline: [...this.history],
    };
  }

  private scoreDimension(
    name: string, weight: number,
    metrics: Record<string, number>,
    positiveKeys: string[], negativeKeys: string[]
  ): LifeScoreDimension {
    const values = Object.values(metrics);
    const avg = values.length > 0 ? values.reduce((s, v) => s + Math.min(100, Math.max(0, v)), 0) / values.length : 50;

    const entries = Object.entries(metrics);
    const sorted = [...entries].sort((a, b) => b[1] - a[1]);
    const topDriver = sorted[0]?.[0] ?? 'N/A';
    const topDrag = sorted[sorted.length - 1]?.[0] ?? 'N/A';

    const prevScore = this.history.length > 0 ? this.history[this.history.length - 1] / 10 : avg;
    const trend = avg > prevScore + 2 ? 'up' : avg < prevScore - 2 ? 'down' : 'stable';

    return { name, weight, score: Math.round(avg), trend, topDriver, topDrag };
  }

  getScoreDrivers(result: CompoundLifeScoreResult): { lifters: string[]; draggers: string[] } {
    return { lifters: result.topLifters, draggers: result.topDraggers };
  }

  projectScore(currentScore: number, monthlyTrend: number, months: number): number {
    return Math.max(0, Math.min(1000, Math.round(currentScore + monthlyTrend * months)));
  }

  getHistory(): number[] { return [...this.history]; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("compound-life-score", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      history: this.history,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.history) this.history = state.history as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("compound-life-score");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createCompoundLifeScore = () => new CompoundLifeScoreEngine();

