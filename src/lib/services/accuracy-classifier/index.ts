// ═══════════════════════════════════════════════════════════════
// SITA OS — Accuracy Classifier Service
// Merge target: trust-state-service
// Classifies AI response accuracy and grounds trust scoring
// ═══════════════════════════════════════════════════════════════

export type AccuracyTier = 'verified' | 'high-confidence' | 'moderate' | 'low' | 'unverified' | 'contradicted';

export interface AccuracyClassification {
  responseId: string;
  tier: AccuracyTier;
  score: number; // 0-1
  groundingSources: GroundingSource[];
  contradictions: Contradiction[];
  staleness: StalenessAssessment;
  classifiedAt: string;
  model: string;
  domain: string;
}

export interface GroundingSource {
  type: 'database' | 'document' | 'api' | 'user-memory' | 'calculation';
  reference: string;
  confidence: number;
  freshness: 'live' | 'cached' | 'stale';
  lastVerifiedAt: string;
}

export interface Contradiction {
  field: string;
  claimedValue: unknown;
  actualValue: unknown;
  source: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface StalenessAssessment {
  isStale: boolean;
  dataAge: number; // ms
  threshold: number;
  recommendation: 'use' | 'refresh' | 'reject';
}

export interface AccuracyClassifierConfig {
  thresholds: Record<AccuracyTier, number>;
  staleness: { warningMs: number; rejectMs: number };
  contradictionPolicy: 'flag' | 'reject' | 'override';
  groundingRequired: boolean;
}

export class AccuracyClassifierService {
  private config: AccuracyClassifierConfig;
  private history: AccuracyClassification[] = [];

  constructor(config?: Partial<AccuracyClassifierConfig>) {
    this.config = {
      thresholds: { verified: 0.95, 'high-confidence': 0.85, moderate: 0.65, low: 0.4, unverified: 0.2, contradicted: 0 },
      staleness: { warningMs: 3600000, rejectMs: 86400000 },
      contradictionPolicy: 'flag',
      groundingRequired: true,
      ...config,
    };
  }

  classify(responseId: string, sources: GroundingSource[], contradictions: Contradiction[], dataAgeMs: number, model: string, domain: string): AccuracyClassification {
    const groundingScore = sources.length > 0 ? sources.reduce((s, g) => s + g.confidence, 0) / sources.length : 0;
    const contradictionPenalty = contradictions.reduce((p, c) => p + (c.severity === 'critical' ? 0.4 : c.severity === 'major' ? 0.2 : 0.05), 0);
    const stalenessPenalty = dataAgeMs > this.config.staleness.rejectMs ? 0.5 : dataAgeMs > this.config.staleness.warningMs ? 0.15 : 0;
    const raw = Math.max(0, Math.min(1, groundingScore - contradictionPenalty - stalenessPenalty));
    const tier = this.scoreTier(raw, contradictions.length > 0);
    const classification: AccuracyClassification = {
      responseId, tier, score: raw,
      groundingSources: sources, contradictions,
      staleness: { isStale: dataAgeMs > this.config.staleness.warningMs, dataAge: dataAgeMs, threshold: this.config.staleness.warningMs, recommendation: dataAgeMs > this.config.staleness.rejectMs ? 'reject' : dataAgeMs > this.config.staleness.warningMs ? 'refresh' : 'use' },
      classifiedAt: new Date().toISOString(), model, domain,
    };
    this.history.push(classification);
    return classification;
  }

  private scoreTier(score: number, hasContradictions: boolean): AccuracyTier {
    if (hasContradictions && score < 0.5) return 'contradicted';
    const t = this.config.thresholds;
    if (score >= t.verified) return 'verified';
    if (score >= t['high-confidence']) return 'high-confidence';
    if (score >= t.moderate) return 'moderate';
    if (score >= t.low) return 'low';
    return 'unverified';
  }

  getHistory(): AccuracyClassification[] { return [...this.history]; }
  getStats() {
    const total = this.history.length;
    const byTier = this.history.reduce((a, c) => { a[c.tier] = (a[c.tier] || 0) + 1; return a; }, {} as Record<string, number>);
    const avgScore = total > 0 ? this.history.reduce((s, c) => s + c.score, 0) / total : 0;
    return { total, byTier, avgScore };
  }
}

export const createAccuracyClassifier = (config?: Partial<AccuracyClassifierConfig>) => new AccuracyClassifierService(config);
