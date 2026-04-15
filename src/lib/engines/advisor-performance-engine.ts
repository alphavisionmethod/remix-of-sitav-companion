// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Performance Analytics Engine
// Tracks accuracy, value delivered, response quality over time
// ═══════════════════════════════════════════════════════════════

export interface AdvisorPerformanceRecord {
  advisorId: string;
  displayName: string;
  totalRecommendations: number;
  acceptedRecommendations: number;
  rejectedRecommendations: number;
  executedActions: number;
  successfulOutcomes: number;
  accuracyRate: number; // 0-1
  acceptanceRate: number; // 0-1
  avgConfidence: number; // 0-1
  avgResponseTime: number; // seconds
  valueDelivered: number; // dollars
  specialtyScore: Record<string, number>; // domain -> performance 0-100
  trend: "improving" | "stable" | "declining";
  weeklyHistory: { week: string; accuracy: number; value: number; volume: number }[];
  topStrengths: string[];
  topWeaknesses: string[];
  trustLevel: number; // 0-100
}

export interface PerformanceSnapshot {
  overallAccuracy: number;
  totalValueDelivered: number;
  totalRecommendations: number;
  avgResponseTime: number;
  bestPerformer: AdvisorPerformanceRecord | null;
  mostImproved: AdvisorPerformanceRecord | null;
  advisors: AdvisorPerformanceRecord[];
  weeklyTrend: { week: string; accuracy: number; value: number }[];
}

function generatePerformanceData(): AdvisorPerformanceRecord[] {
  return [
    {
      advisorId: "cfo-advisor", displayName: "CFO Advisor",
      totalRecommendations: 47, acceptedRecommendations: 38, rejectedRecommendations: 9,
      executedActions: 34, successfulOutcomes: 31,
      accuracyRate: 0.91, acceptanceRate: 0.81, avgConfidence: 0.87,
      avgResponseTime: 2.4, valueDelivered: 84500,
      specialtyScore: { "cash-flow": 95, "cost-reduction": 88, "tax": 72, "pricing": 82 },
      trend: "improving",
      weeklyHistory: [
        { week: "W11", accuracy: 0.85, value: 12000, volume: 8 },
        { week: "W12", accuracy: 0.88, value: 15200, volume: 10 },
        { week: "W13", accuracy: 0.90, value: 18500, volume: 12 },
        { week: "W14", accuracy: 0.92, value: 21000, volume: 9 },
        { week: "W15", accuracy: 0.94, value: 17800, volume: 8 },
      ],
      topStrengths: ["Cash flow forecasting", "Cost optimization", "Revenue recovery"],
      topWeaknesses: ["Tax compliance edge cases"],
      trustLevel: 92,
    },
    {
      advisorId: "growth-strategist", displayName: "Growth Strategist",
      totalRecommendations: 35, acceptedRecommendations: 28, rejectedRecommendations: 7,
      executedActions: 24, successfulOutcomes: 20,
      accuracyRate: 0.83, acceptanceRate: 0.80, avgConfidence: 0.79,
      avgResponseTime: 3.1, valueDelivered: 62000,
      specialtyScore: { "lead-gen": 90, "conversion": 85, "retention": 78, "pricing": 70 },
      trend: "improving",
      weeklyHistory: [
        { week: "W11", accuracy: 0.78, value: 8000, volume: 6 },
        { week: "W12", accuracy: 0.80, value: 11000, volume: 7 },
        { week: "W13", accuracy: 0.82, value: 14000, volume: 8 },
        { week: "W14", accuracy: 0.85, value: 16000, volume: 7 },
        { week: "W15", accuracy: 0.88, value: 13000, volume: 7 },
      ],
      topStrengths: ["Lead generation strategy", "Market positioning", "Conversion optimization"],
      topWeaknesses: ["Long-term retention modeling"],
      trustLevel: 85,
    },
    {
      advisorId: "operations-advisor", displayName: "Operations Advisor",
      totalRecommendations: 42, acceptedRecommendations: 35, rejectedRecommendations: 7,
      executedActions: 30, successfulOutcomes: 27,
      accuracyRate: 0.90, acceptanceRate: 0.83, avgConfidence: 0.85,
      avgResponseTime: 1.8, valueDelivered: 45200,
      specialtyScore: { "workflow": 92, "automation": 88, "team": 80, "vendor": 75 },
      trend: "stable",
      weeklyHistory: [
        { week: "W11", accuracy: 0.89, value: 7500, volume: 9 },
        { week: "W12", accuracy: 0.90, value: 8800, volume: 8 },
        { week: "W13", accuracy: 0.91, value: 9500, volume: 9 },
        { week: "W14", accuracy: 0.89, value: 10200, volume: 8 },
        { week: "W15", accuracy: 0.90, value: 9200, volume: 8 },
      ],
      topStrengths: ["Process automation", "Workflow optimization", "Resource allocation"],
      topWeaknesses: ["Vendor negotiation timing"],
      trustLevel: 88,
    },
    {
      advisorId: "client-advisor", displayName: "Client Success Advisor",
      totalRecommendations: 29, acceptedRecommendations: 22, rejectedRecommendations: 7,
      executedActions: 18, successfulOutcomes: 15,
      accuracyRate: 0.83, acceptanceRate: 0.76, avgConfidence: 0.81,
      avgResponseTime: 2.8, valueDelivered: 38700,
      specialtyScore: { "retention": 88, "upsell": 82, "satisfaction": 90, "onboarding": 78 },
      trend: "improving",
      weeklyHistory: [
        { week: "W11", accuracy: 0.77, value: 5500, volume: 5 },
        { week: "W12", accuracy: 0.80, value: 7200, volume: 6 },
        { week: "W13", accuracy: 0.82, value: 8000, volume: 6 },
        { week: "W14", accuracy: 0.85, value: 9500, volume: 6 },
        { week: "W15", accuracy: 0.88, value: 8500, volume: 6 },
      ],
      topStrengths: ["Churn prediction accuracy", "Client satisfaction insights", "Upsell timing"],
      topWeaknesses: ["New client onboarding recommendations"],
      trustLevel: 82,
    },
    {
      advisorId: "risk-advisor", displayName: "Risk & Compliance Advisor",
      totalRecommendations: 22, acceptedRecommendations: 20, rejectedRecommendations: 2,
      executedActions: 18, successfulOutcomes: 17,
      accuracyRate: 0.94, acceptanceRate: 0.91, avgConfidence: 0.90,
      avgResponseTime: 4.2, valueDelivered: 28000,
      specialtyScore: { "compliance": 95, "risk-assessment": 92, "contract": 85, "insurance": 78 },
      trend: "stable",
      weeklyHistory: [
        { week: "W11", accuracy: 0.93, value: 4500, volume: 4 },
        { week: "W12", accuracy: 0.94, value: 5200, volume: 4 },
        { week: "W13", accuracy: 0.95, value: 6000, volume: 5 },
        { week: "W14", accuracy: 0.93, value: 5800, volume: 5 },
        { week: "W15", accuracy: 0.94, value: 6500, volume: 4 },
      ],
      topStrengths: ["Regulatory compliance", "Risk assessment precision", "Contract review"],
      topWeaknesses: ["Speed of analysis"],
      trustLevel: 94,
    },
  ];
}

class AdvisorPerformanceEngine {
  private records: AdvisorPerformanceRecord[];

  constructor() {
    this.records = generatePerformanceData();
  }

  getSnapshot(): PerformanceSnapshot {
    const totalValue = this.records.reduce((s, r) => s + r.valueDelivered, 0);
    const totalRecs = this.records.reduce((s, r) => s + r.totalRecommendations, 0);
    const avgAccuracy = +(this.records.reduce((s, r) => s + r.accuracyRate, 0) / this.records.length).toFixed(2);
    const avgTime = +(this.records.reduce((s, r) => s + r.avgResponseTime, 0) / this.records.length).toFixed(1);
    const best = [...this.records].sort((a, b) => b.accuracyRate - a.accuracyRate)[0] ?? null;
    const improved = [...this.records].filter(r => r.trend === "improving").sort((a, b) => b.valueDelivered - a.valueDelivered)[0] ?? null;

    const weeklyTrend = ["W11", "W12", "W13", "W14", "W15"].map(w => {
      const weekData = this.records.map(r => r.weeklyHistory.find(h => h.week === w)).filter(Boolean) as { accuracy: number; value: number }[];
      return {
        week: w,
        accuracy: +(weekData.reduce((s, d) => s + d.accuracy, 0) / weekData.length).toFixed(2),
        value: weekData.reduce((s, d) => s + d.value, 0),
      };
    });

    return { overallAccuracy: avgAccuracy, totalValueDelivered: totalValue, totalRecommendations: totalRecs, avgResponseTime: avgTime, bestPerformer: best, mostImproved: improved, advisors: this.records, weeklyTrend };
  }

  getAdvisor(id: string): AdvisorPerformanceRecord | undefined { return this.records.find(r => r.advisorId === id); }
}

let instance: AdvisorPerformanceEngine | null = null;
export function getAdvisorPerformanceEngine(): AdvisorPerformanceEngine {
  if (!instance) instance = new AdvisorPerformanceEngine();
  return instance;
}
