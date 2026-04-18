// ═══════════════════════════════════════════════════════════════
// SITA OS — Recommendation Prioritizer (Intent Layer)
// Ranks recommendations by urgency, trust, evidence grade
// ═══════════════════════════════════════════════════════════════

export interface RankedRecommendation {
  id: string;
  title: string;
  domain: string;
  urgencyScore: number;
  trustScore: number;
  evidenceGrade: string;
  compositeScore: number;
}

const URGENCY_WEIGHT = 0.4;
const TRUST_WEIGHT = 0.3;
const EVIDENCE_WEIGHT = 0.3;

const EVIDENCE_GRADES: Record<string, number> = {
  A: 1.0, B: 0.8, C: 0.6, D: 0.4, F: 0.2,
};

export function prioritizeRecommendations(
  recommendations: Array<{
    id: string;
    title: string;
    domain: string;
    urgencyScore: number;
    trustScore: number;
    evidenceGrade: string;
  }>
): RankedRecommendation[] {
  return recommendations
    .map(r => ({
      ...r,
      compositeScore:
        r.urgencyScore * URGENCY_WEIGHT +
        r.trustScore * TRUST_WEIGHT +
        (EVIDENCE_GRADES[r.evidenceGrade] ?? 0.3) * EVIDENCE_WEIGHT,
    }))
    .sort((a, b) => b.compositeScore - a.compositeScore);
}
