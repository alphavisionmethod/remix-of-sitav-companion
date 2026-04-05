// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: No-Show Risk Prediction
// ═══════════════════════════════════════════════════════════════

export interface NoShowRisk {
  bookingId: string;
  customerId: string;
  probability: number;
  riskLevel: "low" | "medium" | "high" | "very-high";
  factors: NoShowRiskFactor[];
  suggestedPrevention: string;
  estimatedRevenueLostCents: number;
  assessedAt: string;
}

export interface NoShowRiskFactor {
  name: string;
  weight: number;
  value: number;
  direction: "increases-risk" | "decreases-risk";
  description: string;
}

export interface NoShowRecoveryPlan {
  id: string;
  bookingId: string;
  customerId: string;
  strategy: "immediate-reschedule" | "follow-up-call" | "email-sequence" | "fee-enforcement" | "waive";
  steps: Array<{ order: number; action: string; channel: string; delayHours: number; template?: string }>;
  estimatedRecoveryCents: number;
  status: "pending" | "executing" | "recovered" | "lost";
  createdAt: string;
}

export interface NoShowAnalytics {
  period: string;
  totalBookings: number;
  noShowCount: number;
  noShowRate: number;
  revenueLostCents: number;
  revenueRecoveredCents: number;
  recoveryRate: number;
  topNoShowCustomers: Array<{ customerId: string; name: string; noShows: number }>;
  byDayOfWeek: Record<string, number>;
  byTimeSlot: Record<string, number>;
  trendDirection: "improving" | "stable" | "worsening";
}
