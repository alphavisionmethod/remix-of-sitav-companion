// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Projection Service
// Advisor status + recent recommendations
// ═══════════════════════════════════════════════════════════════

import { ADVISOR_CONFIGS, type AdvisorId } from "@/packages/advisor-config";

export interface AdvisorProjection {
  timestamp: string;
  advisors: AdvisorStatus[];
  recentRecommendations: RecommendationSummary[];
  activeDisagreements: number;
}

export interface AdvisorStatus {
  id: AdvisorId;
  name: string;
  status: "active" | "idle" | "blocked" | "degraded";
  lastActivity: string;
  pendingRecommendations: number;
  confidenceAvg: number;
}

export interface RecommendationSummary {
  id: string;
  advisorId: AdvisorId;
  summary: string;
  confidence: number;
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: string;
}

export function generateAdvisorProjection(): AdvisorProjection {
  const advisors: AdvisorStatus[] = ADVISOR_CONFIGS.map((cfg) => ({
    id: cfg.id,
    name: cfg.name,
    status: "active" as const,
    lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    pendingRecommendations: Math.floor(Math.random() * 3),
    confidenceAvg: cfg.confidenceThreshold + Math.random() * 0.2,
  }));

  const recommendations: RecommendationSummary[] = [
    { id: "rec-1", advisorId: "business-advisor", summary: "Follow up with Acme Corp — contract renewal due in 14 days", confidence: 0.88, status: "pending", createdAt: new Date(Date.now() - 1800000).toISOString() },
    { id: "rec-2", advisorId: "money-advisor", summary: "Move $5K from checking to sinking fund — target underfunded by 15%", confidence: 0.92, status: "pending", createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "rec-3", advisorId: "concierge-advisor", summary: "Book restaurant for Saturday — last 2 preferred spots filling up", confidence: 0.78, status: "accepted", createdAt: new Date(Date.now() - 7200000).toISOString() },
  ];

  return { timestamp: new Date().toISOString(), advisors, recentRecommendations: recommendations, activeDisagreements: 1 };
}
