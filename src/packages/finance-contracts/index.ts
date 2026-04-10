// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance Domain Contracts (Barrel)
// ═══════════════════════════════════════════════════════════════

// ── Account Summary ──────────────────────────────────────────

export interface FinancialAccount {
  id: string;
  name: string;
  type: AccountType;
  institution: string;
  balanceCents: number;
  availableCents: number;
  currency: string;
  lastSyncedAt: string;
  connectorId: string;
  isActive: boolean;
}

export type AccountType = "checking" | "savings" | "credit" | "investment" | "loan" | "retirement";

export interface AccountSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  accounts: FinancialAccount[];
  lastUpdated: string;
}

// ── Transaction ──────────────────────────────────────────────

export interface TransactionRecord {
  id: string;
  accountId: string;
  amountCents: number;
  description: string;
  category: string;
  subcategory?: string;
  date: string;
  type: "debit" | "credit";
  merchantName?: string;
  isRecurring: boolean;
  tags: string[];
  categorizedBy: "rule" | "ai" | "manual";
}

export interface CategorizedSpend {
  category: string;
  totalCents: number;
  transactionCount: number;
  percentOfTotal: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
}

// ── Reserve ──────────────────────────────────────────────────

export interface ReserveModel {
  id: string;
  name: string;
  targetCents: number;
  currentCents: number;
  percentFunded: number;
  priority: number;
  category: "emergency" | "tax" | "goal" | "operating" | "custom";
  autoAllocate: boolean;
  monthlyContributionCents: number;
}

// ── Obligation / Bill ────────────────────────────────────────

export interface ObligationRecord {
  id: string;
  name: string;
  payee: string;
  amountCents: number;
  frequency: "one-time" | "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";
  nextDueDate: string;
  category: string;
  autoPay: boolean;
  accountId?: string;
  status: "upcoming" | "due" | "paid" | "overdue";
}

// ── Subscription ─────────────────────────────────────────────

export interface SubscriptionRecord {
  id: string;
  name: string;
  provider: string;
  amountCents: number;
  frequency: "monthly" | "quarterly" | "annually";
  category: string;
  detectedAt: string;
  lastChargeDate: string;
  isWaste: boolean;
  wasteReason?: string;
  savingsIfCancelled: number;
  status: "active" | "flagged-waste" | "cancelled";
}

export interface WasteOpportunity {
  subscriptionId: string;
  name: string;
  monthlyCostCents: number;
  annualSavingsCents: number;
  reason: string;
  confidence: number;
  detectedAt: string;
}

// ── Receivable ───────────────────────────────────────────────

export interface Receivable {
  id: string;
  fromEntity: string;
  amountCents: number;
  dueDate: string;
  status: "expected" | "overdue" | "received" | "written-off";
  linkedInvoiceId?: string;
  agingDays: number;
}

// ── Safe to Spend ────────────────────────────────────────────

export interface SafeToSpendResult {
  balanceCents: number;
  upcomingObligationsCents: number;
  reserveAllocationCents: number;
  pendingIncomeCents: number;
  safeToSpendCents: number;
  calculatedAt: string;
  confidence: number;
  warnings: string[];
}

// ── Budget ───────────────────────────────────────────────────

export interface BudgetHealth {
  budgetId: string;
  name: string;
  period: string;
  allocatedCents: number;
  spentCents: number;
  remainingCents: number;
  percentUsed: number;
  daysRemaining: number;
  paceStatus: "under" | "on-track" | "over";
  projectedOverage?: number;
}

// ── Tax ──────────────────────────────────────────────────────

export interface TaxEstimation {
  taxableIncome: number;
  filingStatus: "single" | "married-joint" | "married-separate" | "head-of-household";
  federalTax: number;
  effectiveRate: number;
  marginalRate: number;
  brackets: TaxBracketResult[];
  calculatedAt: string;
  taxYear: number;
}

export interface TaxBracketResult {
  bracketMin: number;
  bracketMax: number | null;
  rate: number;
  taxInBracket: number;
}

// ── Finance Boardroom ────────────────────────────────────────

export interface FinanceBoardroomPacket {
  cashPosition: number;
  monthlyBurn: number;
  monthlyIncome: number;
  reserveHealth: number;
  upcomingObligations: ObligationRecord[];
  wasteOpportunities: WasteOpportunity[];
  receivables: Receivable[];
  investmentPerformance?: InvestmentSummary;
  taxObligations?: TaxEstimation;
  generatedAt: string;
}

// ── Family Office ────────────────────────────────────────────

export interface FamilyOfficeReviewPacket {
  entities: EntityPerformance[];
  totalNetWorth: number;
  portfolioAllocation: AssetAllocation[];
  taxObligations: TaxEstimation[];
  upcomingEvents: string[];
  riskAssessment: string;
  generatedAt: string;
}

export interface EntityPerformance {
  entityId: string;
  name: string;
  type: "trust" | "llc" | "individual" | "foundation";
  netWorth: number;
  performancePeriod: string;
  returnPercent: number;
}

export interface AssetAllocation {
  assetClass: string;
  valueCents: number;
  percentOfPortfolio: number;
  targetPercent: number;
  drift: number;
}

// ── Investment ───────────────────────────────────────────────

export interface InvestmentSummary {
  totalValueCents: number;
  totalCostBasisCents: number;
  totalGainLossCents: number;
  returnPercent: number;
  allocations: AssetAllocation[];
  lastUpdated: string;
}

// ── Treasury / Scenario ──────────────────────────────────────

export interface TreasuryScenarioResult {
  scenarioName: string;
  assumptions: Record<string, number>;
  projectedCashPosition: number[];
  monthsOfRunway: number;
  breakEvenMonth?: number;
  riskLevel: "low" | "moderate" | "high";
  recommendations: string[];
}

// ── Sub-module re-exports ────────────────────────────────────
export * from "./reserves";
export * from "./subscriptions";
export * from "./family-office";
export * from "./investment-office";
export * from "./debt-credit";
export * from "./health-score";
export * from "./envelope-budget";
export * from "./scenario";
