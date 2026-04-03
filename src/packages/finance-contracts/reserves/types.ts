export interface SinkingFund {
  id: string;
  name: string;
  targetCents: number;
  currentCents: number;
  targetDate: string;
  monthlyContributionCents: number;
  purpose: string;
  category: "property-tax" | "insurance" | "vehicle" | "education" | "vacation" | "major-purchase" | "custom";
  onTrack: boolean;
  projectedShortfallCents: number;
  createdAt: string;
}

export interface ReserveHealth {
  totalReservesCents: number;
  totalTargetCents: number;
  percentFunded: number;
  monthsOfExpensesCovered: number;
  riskLevel: "healthy" | "adequate" | "low" | "critical";
  recommendations: string[];
  sinkingFunds: SinkingFund[];
  lastAssessedAt: string;
}
