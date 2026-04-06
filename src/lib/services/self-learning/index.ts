// ═══════════════════════════════════════════════════════════════
// SITA OS — Enhanced Self-Learning Engine
// Per-advisor learning with pattern tracking, confidence
// calibration, outcome tracking, and learning decay
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export interface LearningSignal {
  id: string;
  domain: string;
  advisorId: string;
  pattern: string;
  outcome: "positive" | "negative" | "neutral";
  confidence: number;
  learnedAt: string;
  applied: boolean;
  reinforcementCount: number;
  decayFactor: number;
}

export interface LearningProfile {
  advisorId: string;
  totalSignals: number;
  positiveRate: number;
  avgConfidence: number;
  calibrationOffset: number;
  topPatterns: { pattern: string; score: number }[];
}

export class SelfLearningService {
  private signals: Map<string, LearningSignal[]> = new Map();
  private counter = 0;
  private readonly DECAY_RATE = 0.02; // 2% per day
  private readonly REINFORCEMENT_BONUS = 0.1;

  learn(
    advisorId: string,
    domain: string,
    pattern: string,
    outcome: LearningSignal["outcome"],
    confidence: number
  ): LearningSignal {
    const existing = this.findSimilar(advisorId, pattern);
    if (existing) {
      existing.reinforcementCount++;
      existing.confidence = Math.min(1, existing.confidence + this.REINFORCEMENT_BONUS);
      existing.outcome = outcome;
      existing.decayFactor = 1;
      return existing;
    }

    const signal: LearningSignal = {
      id: `learn-${++this.counter}`,
      domain,
      advisorId,
      pattern,
      outcome,
      confidence,
      learnedAt: new Date().toISOString(),
      applied: false,
      reinforcementCount: 1,
      decayFactor: 1,
    };

    const list = this.signals.get(advisorId) ?? [];
    list.push(signal);
    this.signals.set(advisorId, list);

    this.persistSignal(signal);
    return signal;
  }

  apply(advisorId: string, signalId: string): void {
    const list = this.signals.get(advisorId) ?? [];
    const s = list.find(x => x.id === signalId);
    if (s) s.applied = true;
  }

  getAdvisorPatterns(advisorId: string): LearningSignal[] {
    this.applyDecay(advisorId);
    return (this.signals.get(advisorId) ?? []).filter(s => s.confidence * s.decayFactor >= 0.3);
  }

  getPositivePatterns(advisorId: string): LearningSignal[] {
    return this.getAdvisorPatterns(advisorId).filter(
      s => s.outcome === "positive" && s.confidence * s.decayFactor >= 0.7
    );
  }

  getUnapplied(advisorId: string): LearningSignal[] {
    return this.getAdvisorPatterns(advisorId).filter(
      s => !s.applied && s.outcome === "positive"
    );
  }

  getProfile(advisorId: string): LearningProfile {
    const signals = this.getAdvisorPatterns(advisorId);
    const positive = signals.filter(s => s.outcome === "positive").length;
    const avgConf = signals.length > 0
      ? signals.reduce((a, s) => a + s.confidence, 0) / signals.length
      : 0;

    // Calibration: if predictions are often wrong, offset confidence down
    const negative = signals.filter(s => s.outcome === "negative").length;
    const calibrationOffset = signals.length >= 10
      ? (positive - negative) / signals.length * 0.1
      : 0;

    const patternScores = new Map<string, number>();
    for (const s of signals) {
      const key = s.pattern.slice(0, 50);
      const current = patternScores.get(key) ?? 0;
      const value = s.outcome === "positive" ? s.confidence : -s.confidence;
      patternScores.set(key, current + value * s.reinforcementCount);
    }

    const topPatterns = [...patternScores.entries()]
      .map(([pattern, score]) => ({ pattern, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return {
      advisorId,
      totalSignals: signals.length,
      positiveRate: signals.length > 0 ? positive / signals.length : 0,
      avgConfidence: Math.round(avgConf * 100) / 100,
      calibrationOffset: Math.round(calibrationOffset * 100) / 100,
      topPatterns,
    };
  }

  /**
   * Check if similar corrections have accumulated enough to generate a knowledge article
   */
  shouldGenerateKnowledge(advisorId: string, category: string): boolean {
    const signals = (this.signals.get(advisorId) ?? []).filter(
      s => s.domain === category && s.outcome === "negative"
    );
    return signals.length >= 3;
  }

  getStats(): { totalAdvisors: number; totalSignals: number; avgConfidence: number } {
    let totalSignals = 0;
    let totalConf = 0;
    for (const [, signals] of this.signals) {
      totalSignals += signals.length;
      totalConf += signals.reduce((a, s) => a + s.confidence, 0);
    }
    return {
      totalAdvisors: this.signals.size,
      totalSignals,
      avgConfidence: totalSignals > 0 ? Math.round((totalConf / totalSignals) * 100) / 100 : 0,
    };
  }

  // ── Private helpers ──────────────────────────────────────────

  private findSimilar(advisorId: string, pattern: string): LearningSignal | undefined {
    const list = this.signals.get(advisorId) ?? [];
    const normalized = pattern.toLowerCase().trim();
    return list.find(s => s.pattern.toLowerCase().trim() === normalized);
  }

  private applyDecay(advisorId: string): void {
    const list = this.signals.get(advisorId) ?? [];
    const now = Date.now();
    for (const s of list) {
      const daysSince = (now - new Date(s.learnedAt).getTime()) / (1000 * 60 * 60 * 24);
      s.decayFactor = Math.max(0.1, 1 - this.DECAY_RATE * daysSince / s.reinforcementCount);
    }
  }

  private async persistSignal(signal: LearningSignal): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("events").insert({
        user_id: user.id,
        type: "learning_signal",
        source: "self-learning",
        payload: {
          advisorId: signal.advisorId,
          domain: signal.domain,
          pattern: signal.pattern,
          outcome: signal.outcome,
          confidence: signal.confidence,
        },
      });
    } catch {
      // Silent fail — learning persistence is best-effort
    }
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("self-learning/self-learning", this._serializeState());

  private _serializeState(): Record<string, unknown> {
    return {
      signals: Array.from(this.signals.entries()),
    };
  }

  hydrateState(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.signals) this.signals = new Map(state.signals as any);
    // patternScores are computed, not persisted
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("self-learning/self-learning");
    if (state) this.hydrateState(state as Record<string, unknown>);
  }
}

export const selfLearningService = new SelfLearningService();
export const createSelfLearning = () => new SelfLearningService();
