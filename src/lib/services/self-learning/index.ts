// SITA OS — Self Learning Service
export interface LearningSignal { id: string; domain: string; pattern: string; outcome: 'positive' | 'negative' | 'neutral'; confidence: number; learnedAt: string; applied: boolean; }
export class SelfLearningService {
  private signals: LearningSignal[] = [];
  private counter = 0;
  learn(domain: string, pattern: string, outcome: LearningSignal['outcome'], confidence: number): LearningSignal { const s: LearningSignal = { id: `learn-${++this.counter}`, domain, pattern, outcome, confidence, learnedAt: new Date().toISOString(), applied: false }; this.signals.push(s); return s; }
  apply(id: string): void { const s = this.signals.find(x => x.id === id); if (s) s.applied = true; }
  getPatterns(domain: string): LearningSignal[] { return this.signals.filter(s => s.domain === domain); }
  getPositivePatterns(): LearningSignal[] { return this.signals.filter(s => s.outcome === 'positive' && s.confidence >= 0.7); }
  getUnapplied(): LearningSignal[] { return this.signals.filter(s => !s.applied && s.outcome === 'positive'); }
  getStats(): { total: number; positive: number; negative: number; applied: number } { return { total: this.signals.length, positive: this.signals.filter(s => s.outcome === 'positive').length, negative: this.signals.filter(s => s.outcome === 'negative').length, applied: this.signals.filter(s => s.applied).length }; }
}
export const createSelfLearning = () => new SelfLearningService();
