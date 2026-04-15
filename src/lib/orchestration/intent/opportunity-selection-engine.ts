// ═══════════════════════════════════════════════════════════════
// SITA OS — Opportunity Selection Engine (Intent Layer)
// Selects opportunities from advisor outputs
// ═══════════════════════════════════════════════════════════════

export interface OpportunitySignal {
  signalId: string;
  domain: string;
  title: string;
  estimatedImpact: number; // 0-1
  confidence: number;
  advisorId: string;
  timelineDays: number;
  evidenceRefs: string[];
}

export interface SelectedOpportunity {
  signalId: string;
  priorityRank: number;
  impactScore: number;
  selectionReason: string;
}

export function selectOpportunities(
  signals: OpportunitySignal[],
  maxOpportunities: number = 3
): SelectedOpportunity[] {
  const scored = signals
    .filter(s => s.confidence > 0.4)
    .map(s => ({
      signal: s,
      score: s.estimatedImpact * 0.5 +
             s.confidence * 0.3 +
             (s.evidenceRefs.length > 0 ? 0.1 : 0) +
             (s.timelineDays < 14 ? 0.1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxOpportunities);

  return scored.map((s, i) => ({
    signalId: s.signal.signalId,
    priorityRank: i + 1,
    impactScore: s.score,
    selectionReason: `${(s.signal.estimatedImpact * 100).toFixed(0)}% impact, ${(s.signal.confidence * 100).toFixed(0)}% confidence, ${s.signal.evidenceRefs.length} evidence items`,
  }));
}
