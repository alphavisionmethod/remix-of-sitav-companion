// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance Contracts: Financial Health Score
// ═══════════════════════════════════════════════════════════════

export interface FinancialHealthScore {
  overallScore: number; // 0-100
  grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
  dimensions: HealthDimension[];
  trend: "improving" | "stable" | "declining";
  trendDelta: number;
  generatedAt: string;
  actionItems: HealthActionItem[];
  founderBoundary?: FounderBoundaryAlert;
}

export interface HealthDimension {
  key: string;
  label: string;
  score: number; // 0-100
  weight: number;
  status: "excellent" | "good" | "fair" | "poor" | "critical";
  insight: string;
}

export interface HealthActionItem {
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  potentialImpact: number; // score points
}

export interface FounderBoundaryAlert {
  comingled: boolean;
  personalInBusiness: number;
  businessInPersonal: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  violations: string[];
}
