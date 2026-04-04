// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Customer Health Score View
// ═══════════════════════════════════════════════════════════════

export interface CustomerHealthScoreView {
  customerId: string;
  overallScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  engagementScore: number;
  adoptionScore: number;
  satisfactionScore: number;
  paymentHealthScore: number;
  trend: "improving" | "stable" | "declining";
  computedAt: string;
}
