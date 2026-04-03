export interface RenewalRisk {
  subscriptionId: string;
  name: string;
  renewalDate: string;
  daysUntilRenewal: number;
  annualCostCents: number;
  usageScore: number; // 0-100
  alternativesAvailable: boolean;
  riskLevel: "auto-renew-waste" | "price-increase" | "underutilized" | "redundant";
  recommendedAction: "cancel" | "downgrade" | "negotiate" | "keep" | "review";
  potentialSavingsCents: number;
  detectedAt: string;
}
