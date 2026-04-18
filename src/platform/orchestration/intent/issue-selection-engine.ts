// ═══════════════════════════════════════════════════════════════
// SITA OS — Issue Selection Engine (Intent Layer)
// Selects which issues/risks to surface from pipeline signals
// ═══════════════════════════════════════════════════════════════

export interface IssueSignal {
  signalId: string;
  domain: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  evidenceCount: number;
  detectedAt: string;
  staleness: number; // 0-1 freshness score (1 = fresh)
}

export interface SelectedIssue {
  signalId: string;
  priorityRank: number;
  selectionReason: string;
  surfaceUrgency: "immediate" | "next_session" | "background";
}

const SEVERITY_SCORES: Record<string, number> = {
  critical: 1.0, high: 0.75, medium: 0.5, low: 0.25,
};

export function selectIssues(
  signals: IssueSignal[],
  maxIssues: number = 5
): SelectedIssue[] {
  const scored = signals
    .filter(s => s.staleness > 0.3) // skip stale signals
    .map(s => ({
      signal: s,
      score: (SEVERITY_SCORES[s.severity] ?? 0.25) * 0.5 +
             s.staleness * 0.3 +
             Math.min(s.evidenceCount / 5, 1) * 0.2,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxIssues);

  return scored.map((s, i) => ({
    signalId: s.signal.signalId,
    priorityRank: i + 1,
    selectionReason: `${s.signal.severity} severity, ${s.signal.evidenceCount} evidence items, freshness ${(s.signal.staleness * 100).toFixed(0)}%`,
    surfaceUrgency: s.signal.severity === "critical" ? "immediate" :
                    s.signal.severity === "high" ? "next_session" : "background",
  }));
}
