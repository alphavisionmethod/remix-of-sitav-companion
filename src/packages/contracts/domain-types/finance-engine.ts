// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance Engine Canonical Types
// Migrated from src/lib/domain-engines/finance-os.ts
// ═══════════════════════════════════════════════════════════════

export interface CashflowEntry {
  id: string;
  type: "inflow" | "outflow";
  category: string;
  amount: number;
  date: number;
  recurring: boolean;
  frequency?: "weekly" | "biweekly" | "monthly" | "quarterly" | "annual";
  description: string;
  linkedEntity?: string;
}

export interface Bill {
  id: string;
  vendor: string;
  amount: number;
  dueDate: number;
  category: string;
  recurring: boolean;
  frequency?: "weekly" | "biweekly" | "monthly" | "quarterly" | "annual";
  status: "upcoming" | "due-today" | "overdue" | "paid";
  autopay: boolean;
  lastPaid?: number;
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  period: "monthly" | "quarterly" | "annual";
  allocated: number;
  spent: number;
  startDate: number;
  endDate: number;
}

export interface Reserve {
  id: string;
  name: string;
  type: "emergency" | "operating" | "tax" | "growth" | "personal";
  currentBalance: number;
  targetBalance: number;
  lastContribution?: number;
}

export interface FinanceInvoice {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  issuedDate: number;
  dueDate: number;
  status: "draft" | "sent" | "viewed" | "partial" | "paid" | "overdue" | "written-off";
  paidAmount: number;
  daysSinceIssued: number;
}

export interface CashflowAnalysis {
  totalInflows: number;
  totalOutflows: number;
  netCashflow: number;
  runwayMonths: number;
  inflowsByCategory: Record<string, number>;
  outflowsByCategory: Record<string, number>;
  healthIndicator: "surplus" | "balanced" | "tight" | "negative";
  projectedNextMonth: { inflows: number; outflows: number; net: number };
}

export interface BudgetHealthResult {
  overallUtilization: number;
  overBudgetCount: number;
  underBudgetCount: number;
  categories: { name: string; allocated: number; spent: number; utilization: number; status: "under" | "on-track" | "warning" | "over" }[];
  healthScore: number;
  recommendations: string[];
}

export interface TaxEstimate {
  estimatedTax: number;
  effectiveRate: number;
  bracket: string;
  quarterlyPayment: number;
  marginalRate: number;
  deductionImpact: number;
}

export interface BillCalendarResult {
  upcoming7Days: Bill[];
  upcoming30Days: Bill[];
  overdue: Bill[];
  totalDueNext7: number;
  totalDueNext30: number;
  totalOverdue: number;
  autopayPercentage: number;
  riskItems: { bill: Bill; reason: string }[];
}

export interface ReserveAssessment {
  totalReserves: number;
  totalTarget: number;
  coverageRatio: number;
  monthsOfRunway: number;
  reserves: { name: string; current: number; target: number; percentage: number; status: "healthy" | "low" | "critical" | "empty" }[];
  recommendations: string[];
}

export interface InvoiceAgingResult {
  current: { count: number; total: number };
  days1to30: { count: number; total: number };
  days31to60: { count: number; total: number };
  days61to90: { count: number; total: number };
  days90plus: { count: number; total: number };
  totalOutstanding: number;
  weightedAvgDays: number;
  collectionEfficiency: number;
  atRiskAccounts: { customerId: string; customerName: string; totalOverdue: number; oldestDays: number }[];
}

export interface FinancialHealthResult {
  overallScore: number;
  cashflowHealth: number;
  budgetHealth: number;
  reserveHealth: number;
  receivablesHealth: number;
  risks: { type: string; severity: "low" | "medium" | "high" | "critical"; description: string; suggestedAction: string }[];
  summary: string;
}
