// ═══════════════════════════════════════════════════════════════
// SITA OS — Cross-Advisor Coordinator
// De-duplicates, merges, ranks recommendations across advisors
// ═══════════════════════════════════════════════════════════════

import type { AIRecommendation } from "@/modules/business/hooks/useBusinessAdvisorBoard";
import { resolveConflict, type ConflictRule } from "@/lib/advisors/advisor-conflict-resolution-policy";
import { resolveDebate, DEFAULT_DEBATE_POLICY, type DebateOutcome } from "@/lib/advisors/advisor-debate-orchestrator";

export interface CoordinatedRecommendation {
  id: string;
  primaryAdvisorId: string;
  contributingAdvisors: { advisorId: string; role: string; contribution: string }[];
  title: string;
  mergedSummary: string;
  urgency: "low" | "medium" | "high" | "critical";
  confidence: number;
  consensusScore: number; // 0-1 how many advisors agree
  suggestedActions: string[];
  riskFlags: string[];
  deduplicatedFrom: string[];
  category: "revenue" | "operations" | "client" | "finance" | "strategy" | "team" | "general";
}

export interface EscalationBundle {
  id: string;
  title: string;
  advisorConsensus: number;
  recommendations: CoordinatedRecommendation[];
  totalEstimatedImpact: string;
  urgency: "high" | "critical";
  createdAt: string;
}

// ── Similarity detection ───────────────────────────────────────
function computeSimilarity(a: AIRecommendation, b: AIRecommendation): number {
  const titleWords = (s: string) => new Set(s.toLowerCase().split(/\s+/));
  const aWords = titleWords(a.title + " " + a.summary);
  const bWords = titleWords(b.title + " " + b.summary);
  const intersection = new Set([...aWords].filter(w => bWords.has(w)));
  const union = new Set([...aWords, ...bWords]);
  return intersection.size / Math.max(union.size, 1);
}

function categorize(rec: AIRecommendation): CoordinatedRecommendation["category"] {
  const text = (rec.title + " " + rec.summary).toLowerCase();
  if (text.match(/revenue|sales|lead|deal|pipeline|close|quote/)) return "revenue";
  if (text.match(/client|customer|retention|churn|relationship/)) return "client";
  if (text.match(/cash|invoice|bill|expense|margin|profit|payment/)) return "finance";
  if (text.match(/workflow|task|block|schedule|operation|process/)) return "operations";
  if (text.match(/team|hire|delegate|workload|handoff/)) return "team";
  if (text.match(/strateg|growth|expand|market|innovation/)) return "strategy";
  return "general";
}

export class CrossAdvisorCoordinator {
  private similarityThreshold = 0.35;

  /** Use canonical conflict resolution policy */
  resolveConflictBetween(context: {
    sameDomain: boolean;
    financialImpact: boolean;
    safetyRelated: boolean;
    irreversible: boolean;
    maxConfidence: number;
  }): ConflictRule {
    return resolveConflict(context);
  }

  /** Use canonical debate resolution */
  resolveDebateOutcome(positions: Array<{ advisorId: string; stance: "support" | "oppose" | "neutral"; confidence: number; rationale: string }>): DebateOutcome {
    return resolveDebate(positions, DEFAULT_DEBATE_POLICY);
  }

  coordinate(recommendations: AIRecommendation[]): CoordinatedRecommendation[] {
    if (recommendations.length === 0) return [];

    // Group similar recommendations
    const groups: AIRecommendation[][] = [];
    const assigned = new Set<number>();

    for (let i = 0; i < recommendations.length; i++) {
      if (assigned.has(i)) continue;
      const group = [recommendations[i]];
      assigned.add(i);
      for (let j = i + 1; j < recommendations.length; j++) {
        if (assigned.has(j)) continue;
        if (computeSimilarity(recommendations[i], recommendations[j]) > this.similarityThreshold) {
          group.push(recommendations[j]);
          assigned.add(j);
        }
      }
      groups.push(group);
    }

    // Merge each group into a coordinated recommendation
    return groups.map((group, idx) => {
      const primary = group.reduce((best, r) => r.confidence > best.confidence ? r : best, group[0]);
      const others = group.filter(r => r !== primary);

      const urgencyOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      const highestUrgency = group.reduce((u, r) =>
        urgencyOrder[r.urgency] > urgencyOrder[u] ? r.urgency : u, "low" as string
      ) as CoordinatedRecommendation["urgency"];

      return {
        id: `coord-${Date.now()}-${idx}`,
        primaryAdvisorId: primary.advisorId,
        contributingAdvisors: group.map(r => ({
          advisorId: r.advisorId,
          role: r === primary ? "primary" : "supporting",
          contribution: r === primary ? r.summary : `Also flagged: ${r.title}`,
        })),
        title: primary.title,
        mergedSummary: group.length > 1
          ? `${primary.summary} (${others.length} other advisor${others.length > 1 ? "s" : ""} also flagged this)`
          : primary.summary,
        urgency: highestUrgency,
        confidence: Math.max(...group.map(r => r.confidence)),
        consensusScore: group.length / Math.max(1, new Set(group.map(r => r.advisorId)).size),
        suggestedActions: [...new Set(group.flatMap(r => r.suggestedActions))],
        riskFlags: [...new Set(group.flatMap(r => r.riskFlags))],
        deduplicatedFrom: group.map(r => r.advisorId),
        category: categorize(primary),
      };
    }).sort((a, b) => {
      const urgencyOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      const uDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      if (uDiff !== 0) return uDiff;
      return b.confidence - a.confidence;
    });
  }

  buildEscalationBundle(coordinated: CoordinatedRecommendation[]): EscalationBundle | null {
    const urgent = coordinated.filter(r => r.urgency === "high" || r.urgency === "critical");
    if (urgent.length === 0) return null;

    return {
      id: `esc-${Date.now()}`,
      title: `${urgent.length} urgent items requiring attention`,
      advisorConsensus: urgent.reduce((s, r) => s + r.consensusScore, 0) / urgent.length,
      recommendations: urgent,
      totalEstimatedImpact: `${urgent.length} items with multi-advisor consensus`,
      urgency: urgent.some(r => r.urgency === "critical") ? "critical" : "high",
      createdAt: new Date().toISOString(),
    };
  }
}

let _instance: CrossAdvisorCoordinator | null = null;
export function getCrossAdvisorCoordinator(): CrossAdvisorCoordinator {
  if (!_instance) _instance = new CrossAdvisorCoordinator();
  return _instance;
}
