// ═══════════════════════════════════════════════════════════════
// SITA OS — Brain Core: Advisor Selection
// Scores and selects advisors for a given intent
// ═══════════════════════════════════════════════════════════════

import type { ParsedIntent } from "./orchestrate-intent";

export interface AdvisorCandidate {
  id: string;
  domain: string;
  specialties: string[];
  trustScore: number;
  costPerQuery: number;
  avgLatencyMs: number;
  available: boolean;
}

export interface AdvisorSelectionResult {
  selected: AdvisorCandidate[];
  reasoning: string[];
  totalEstimatedCost: number;
  selectionStrategy: "single-best" | "multi-council" | "domain-specialist";
}

const ADVISOR_POOL: AdvisorCandidate[] = [
  { id: "biz-advisor", domain: "business", specialties: ["crm", "leads", "revenue", "collections"], trustScore: 92, costPerQuery: 50, avgLatencyMs: 200, available: true },
  { id: "revenue-advisor", domain: "business", specialties: ["revenue", "leakage", "recovery", "forecast"], trustScore: 88, costPerQuery: 40, avgLatencyMs: 180, available: true },
  { id: "fin-advisor", domain: "finance", specialties: ["reserves", "bills", "safe-to-spend", "subscriptions"], trustScore: 95, costPerQuery: 60, avgLatencyMs: 150, available: true },
  { id: "investment-advisor", domain: "finance", specialties: ["portfolio", "risk", "regime", "thesis"], trustScore: 90, costPerQuery: 80, avgLatencyMs: 300, available: true },
  { id: "concierge-advisor", domain: "concierge", specialties: ["household", "travel", "grocery", "calendar"], trustScore: 87, costPerQuery: 30, avgLatencyMs: 120, available: true },
  { id: "platform-advisor", domain: "platform", specialties: ["policies", "connectors", "diagnostics"], trustScore: 93, costPerQuery: 20, avgLatencyMs: 100, available: true },
];

export function chooseAdvisors(intent: ParsedIntent): AdvisorSelectionResult {
  const domainAdvisors = ADVISOR_POOL.filter(a => a.domain === intent.domain && a.available);
  const reasoning: string[] = [];

  if (domainAdvisors.length === 0) {
    const fallback = ADVISOR_POOL.filter(a => a.domain === "platform" && a.available);
    reasoning.push(`No ${intent.domain} advisors available — falling back to platform advisor`);
    return {
      selected: fallback,
      reasoning,
      totalEstimatedCost: fallback.reduce((s, a) => s + a.costPerQuery, 0),
      selectionStrategy: "single-best",
    };
  }

  // For boardroom/simulation, use multi-council (all domain advisors)
  if (intent.type === "boardroom" || intent.type === "simulation") {
    reasoning.push(`${intent.type} intent — selecting all ${intent.domain} advisors for council`);
    return {
      selected: domainAdvisors,
      reasoning,
      totalEstimatedCost: domainAdvisors.reduce((s, a) => s + a.costPerQuery, 0),
      selectionStrategy: "multi-council",
    };
  }

  // For actions, pick the highest trust score advisor
  const best = domainAdvisors.sort((a, b) => b.trustScore - a.trustScore)[0];
  reasoning.push(`Selected ${best.id} (trust: ${best.trustScore}, latency: ${best.avgLatencyMs}ms)`);

  return {
    selected: [best],
    reasoning,
    totalEstimatedCost: best.costPerQuery,
    selectionStrategy: "single-best",
  };
}

export function scoreAdvisor(advisor: AdvisorCandidate, intent: ParsedIntent): number {
  let score = advisor.trustScore;
  const matchingSpecialties = advisor.specialties.filter(s => intent.rawInput.toLowerCase().includes(s));
  score += matchingSpecialties.length * 5;
  if (advisor.avgLatencyMs < 200) score += 3;
  if (intent.urgency === "critical" && advisor.avgLatencyMs > 300) score -= 10;
  return Math.min(100, Math.max(0, score));
}
