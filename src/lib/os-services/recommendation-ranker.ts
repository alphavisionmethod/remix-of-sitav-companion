// ═══════════════════════════════════════════════════════════════
// SITA OS — Recommendation Ranker
// Confidence scoring, suppression, cooldowns, relevance
// ═══════════════════════════════════════════════════════════════

export interface Recommendation {
  id: string;
  title: string;
  body: string;
  source: string;
  confidence: number; // 0-1
  category: string;
  relevanceWindowMs?: number;
  createdAt: number;
  dismissed: boolean;
  dismissedAt?: number;
  cooldownMs?: number;
  actionId?: string;
  reasoning?: string;
}

class RecommendationRanker {
  private recommendations: Recommendation[] = [];
  private dismissalHistory = new Map<string, number>(); // source -> lastDismissed
  private cooldowns = new Map<string, number>(); // source -> cooldown end

  /** Add a recommendation with ranking */
  add(rec: Omit<Recommendation, 'id' | 'createdAt' | 'dismissed'>): Recommendation | null {
    // Cooldown check
    const cooldownEnd = this.cooldowns.get(rec.source);
    if (cooldownEnd && Date.now() < cooldownEnd) return null;

    // Relevance window check
    if (rec.relevanceWindowMs) {
      const existing = this.recommendations.find(r => r.source === rec.source && !r.dismissed && (Date.now() - r.createdAt) < rec.relevanceWindowMs!);
      if (existing) return null; // Suppress duplicate within window
    }

    const recommendation: Recommendation = {
      ...rec, id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(), dismissed: false,
    };

    this.recommendations.push(recommendation);
    return recommendation;
  }

  /** Dismiss a recommendation and apply cooldown */
  dismiss(id: string): void {
    const rec = this.recommendations.find(r => r.id === id);
    if (!rec) return;
    rec.dismissed = true;
    rec.dismissedAt = Date.now();
    this.dismissalHistory.set(rec.source, Date.now());
    if (rec.cooldownMs) {
      this.cooldowns.set(rec.source, Date.now() + rec.cooldownMs);
    }
  }

  /** Get active recommendations sorted by confidence */
  getActive(limit = 10): Recommendation[] {
    return this.recommendations
      .filter(r => !r.dismissed && (!r.relevanceWindowMs || (Date.now() - r.createdAt) < r.relevanceWindowMs))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /** Explain why a recommendation is shown */
  explain(id: string): string {
    const rec = this.recommendations.find(r => r.id === id);
    if (!rec) return 'Recommendation not found.';
    return `"${rec.title}" — Source: ${rec.source}, Confidence: ${Math.round(rec.confidence * 100)}%. ${rec.reasoning ?? 'Based on your usage patterns and system state.'}`;
  }

  /** Get suppressed count */
  suppressedCount(): number {
    return this.recommendations.filter(r => r.dismissed).length;
  }

  stats() {
    return {
      total: this.recommendations.length,
      active: this.getActive().length,
      dismissed: this.suppressedCount(),
      avgConfidence: this.recommendations.length > 0
        ? Math.round(this.recommendations.reduce((s, r) => s + r.confidence, 0) / this.recommendations.length * 100)
        : 0,
    };
  }
}

export const recommendationRanker = new RecommendationRanker();
