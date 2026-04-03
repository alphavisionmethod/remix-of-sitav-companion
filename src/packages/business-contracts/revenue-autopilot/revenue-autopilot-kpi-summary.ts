export interface RevenueAutopilotKpiSummary {
  period: string;
  totalLeaksDetectedCents: number;
  totalRecoveredCents: number;
  recoveryRate: number; // 0-100
  activeRecoveryPlans: number;
  completedRecoveryPlans: number;
  noShowCount: number;
  noShowRecoveryRate: number;
  collectionsEscalations: number;
  avgRecoveryTimeDays: number;
  topLeakCategories: { category: string; amountCents: number; count: number }[];
  generatedAt: string;
}
