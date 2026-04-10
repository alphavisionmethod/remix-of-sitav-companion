// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance Contracts: Envelope / YNAB-Style Budget
// ═══════════════════════════════════════════════════════════════

export interface EnvelopeBudget {
  id: string;
  period: string; // "2026-04"
  totalIncomeCents: number;
  totalAllocatedCents: number;
  unallocatedCents: number;
  groups: EnvelopeGroup[];
  rolloverFromPriorCents: number;
  paceStatus: "ahead" | "on-track" | "behind";
}

export interface EnvelopeGroup {
  id: string;
  name: string;
  sortOrder: number;
  envelopes: Envelope[];
  totalAllocatedCents: number;
  totalSpentCents: number;
}

export interface Envelope {
  id: string;
  name: string;
  allocatedCents: number;
  spentCents: number;
  availableCents: number;
  rolloverCents: number;
  isOverspent: boolean;
  category: string;
  goalTargetCents?: number;
  goalTargetDate?: string;
  goalProgress?: number;
}

export interface EnvelopeAllocationRule {
  id: string;
  envelopeId: string;
  type: "fixed" | "percentage" | "remainder";
  valueCents?: number;
  percentOfIncome?: number;
  priority: number;
}

export interface HouseholdFinanceSummary {
  householdId: string;
  memberCount: number;
  totalIncomeCents: number;
  totalExpensesCents: number;
  sharedGoals: SharedGoal[];
  memberBreakdown: MemberFinanceSummary[];
  sharedBudgetHealth: number;
}

export interface SharedGoal {
  id: string;
  name: string;
  targetCents: number;
  currentCents: number;
  contributors: { memberId: string; contributedCents: number }[];
  projectedCompletionDate: string;
}

export interface MemberFinanceSummary {
  memberId: string;
  name: string;
  incomeCents: number;
  expensesCents: number;
  personalSavingsCents: number;
  sharedContributionCents: number;
}
