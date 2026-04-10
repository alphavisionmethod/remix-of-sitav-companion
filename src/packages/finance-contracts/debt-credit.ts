// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance Contracts: Debt, Credit & Liability Types
// ═══════════════════════════════════════════════════════════════

export interface DebtProfile {
  totalDebtCents: number;
  totalMinimumPaymentCents: number;
  weightedAvgInterestRate: number;
  debtToIncomeRatio: number;
  utilizationPercent: number;
  accounts: DebtAccount[];
  payoffPlan: PayoffPlan;
  projectedPayoffDate: string;
  interestDragMonthlyCents: number;
  creditScorePulse: CreditScorePulse;
}

export interface DebtAccount {
  id: string;
  name: string;
  type: "credit-card" | "student-loan" | "mortgage" | "auto-loan" | "personal-loan" | "business-loan" | "line-of-credit";
  balanceCents: number;
  limitCents: number;
  interestRate: number;
  minimumPaymentCents: number;
  dueDate: string;
  utilizationPercent: number;
  monthlyInterestCents: number;
  payoffMonths: number;
  isAutoPay: boolean;
  institution: string;
}

export interface PayoffPlan {
  strategy: "avalanche" | "snowball" | "hybrid";
  monthlyBudgetCents: number;
  totalInterestSavedCents: number;
  payoffOrder: string[];
  projectedMonths: number;
  milestones: PayoffMilestone[];
}

export interface PayoffMilestone {
  accountId: string;
  accountName: string;
  payoffDate: string;
  totalPaidCents: number;
  interestPaidCents: number;
}

export interface CreditScorePulse {
  estimatedScore: number;
  trend: "improving" | "stable" | "declining";
  factors: CreditFactor[];
  lastUpdated: string;
}

export interface CreditFactor {
  name: string;
  impact: "positive" | "neutral" | "negative";
  weight: number;
  description: string;
}
