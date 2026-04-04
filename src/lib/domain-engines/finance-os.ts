// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS Domain Engine
// Pure deterministic functions for financial intelligence
// Canonical types: @/packages/contracts/domain-types/finance-engine
// ═══════════════════════════════════════════════════════════════

import type {
  CashflowEntry,
  Bill,
  Budget,
  Reserve,
  FinanceInvoice,
  CashflowAnalysis,
  BudgetHealthResult,
  TaxEstimate,
  BillCalendarResult,
  ReserveAssessment,
  InvoiceAgingResult,
  FinancialHealthResult,
} from "@/packages/contracts";

// Re-export canonical types for consumers
export type {
  CashflowEntry,
  Bill,
  Budget,
  Reserve,
  FinanceInvoice,
  CashflowAnalysis,
  BudgetHealthResult,
  TaxEstimate,
  BillCalendarResult,
  ReserveAssessment,
  InvoiceAgingResult,
  FinancialHealthResult,
};

// ── Cashflow Analysis ───────────────────────────────────────────

export function analyzeCashflow(
  entries: CashflowEntry[],
  currentBalance: number,
  monthlyBurn?: number
): CashflowAnalysis {
  const inflowsByCategory: Record<string, number> = {};
  const outflowsByCategory: Record<string, number> = {};
  let totalInflows = 0;
  let totalOutflows = 0;

  for (const entry of entries) {
    if (entry.type === "inflow") {
      totalInflows += entry.amount;
      inflowsByCategory[entry.category] = (inflowsByCategory[entry.category] ?? 0) + entry.amount;
    } else {
      totalOutflows += entry.amount;
      outflowsByCategory[entry.category] = (outflowsByCategory[entry.category] ?? 0) + entry.amount;
    }
  }

  const netCashflow = totalInflows - totalOutflows;
  const burn = monthlyBurn ?? totalOutflows;
  const runwayMonths = burn > 0 ? currentBalance / burn : Infinity;

  // Project next month based on recurring entries
  const recurringIn = entries.filter(e => e.type === "inflow" && e.recurring).reduce((s, e) => s + e.amount, 0);
  const recurringOut = entries.filter(e => e.type === "outflow" && e.recurring).reduce((s, e) => s + e.amount, 0);

  const healthIndicator: CashflowAnalysis["healthIndicator"] =
    netCashflow > totalOutflows * 0.2 ? "surplus" :
    netCashflow >= 0 ? "balanced" :
    netCashflow > -totalOutflows * 0.1 ? "tight" : "negative";

  return {
    totalInflows, totalOutflows, netCashflow, runwayMonths,
    inflowsByCategory, outflowsByCategory, healthIndicator,
    projectedNextMonth: { inflows: recurringIn, outflows: recurringOut, net: recurringIn - recurringOut },
  };
}

// ── Budget Health ───────────────────────────────────────────────

export function assessBudgetHealth(budgets: Budget[]): BudgetHealthResult {
  if (budgets.length === 0) {
    return { overallUtilization: 0, overBudgetCount: 0, underBudgetCount: 0, categories: [], healthScore: 50, recommendations: ["Set up budgets to track spending"] };
  }

  let totalAllocated = 0;
  let totalSpent = 0;
  let overBudgetCount = 0;
  let underBudgetCount = 0;
  const categories: BudgetHealthResult["categories"] = [];
  const recommendations: string[] = [];

  for (const b of budgets) {
    totalAllocated += b.allocated;
    totalSpent += b.spent;
    const utilization = b.allocated > 0 ? b.spent / b.allocated : 0;
    const status: "under" | "on-track" | "warning" | "over" =
      utilization > 1 ? "over" :
      utilization > 0.85 ? "warning" :
      utilization < 0.3 ? "under" : "on-track";

    if (status === "over") overBudgetCount++;
    if (status === "under") underBudgetCount++;

    categories.push({ name: b.name, allocated: b.allocated, spent: b.spent, utilization, status });
  }

  const overallUtilization = totalAllocated > 0 ? totalSpent / totalAllocated : 0;

  if (overBudgetCount > 0) recommendations.push(`${overBudgetCount} budget(s) exceeded — review and adjust`);
  if (underBudgetCount > budgets.length * 0.5) recommendations.push("Several budgets significantly under-spent — consider reallocating");
  if (overallUtilization > 0.95) recommendations.push("Overall spending near budget limit — monitor closely");

  const healthScore = Math.max(0, Math.min(100, Math.round(
    100 - (overBudgetCount * 15) - Math.max(0, (overallUtilization - 1) * 50)
  )));

  return { overallUtilization, overBudgetCount, underBudgetCount, categories, healthScore, recommendations };
}

// ── Tax Estimation (US 2024 Federal Brackets) ───────────────────

const US_2024_BRACKETS = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

export function estimateTax(
  annualIncome: number,
  deductions: number = 14600,  // 2024 standard deduction single
  filingStatus: "single" | "married-joint" | "head-of-household" = "single"
): TaxEstimate {
  const taxableIncome = Math.max(0, annualIncome - deductions);
  let tax = 0;
  let currentBracket = "";
  let marginalRate = 0.10;

  for (const bracket of US_2024_BRACKETS) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
      currentBracket = `${(bracket.rate * 100).toFixed(0)}%`;
      marginalRate = bracket.rate;
    }
  }

  const effectiveRate = annualIncome > 0 ? tax / annualIncome : 0;
  const quarterlyPayment = Math.round(tax / 4);
  const deductionImpact = deductions * marginalRate;

  return { estimatedTax: Math.round(tax), effectiveRate, bracket: currentBracket, quarterlyPayment, marginalRate, deductionImpact: Math.round(deductionImpact) };
}

// ── Bill Calendar Analysis ──────────────────────────────────────

export function analyzeBillCalendar(bills: Bill[]): BillCalendarResult {
  const now = Date.now();
  const in7Days = now + 7 * 86400000;
  const in30Days = now + 30 * 86400000;

  const upcoming7Days = bills.filter(b => b.dueDate >= now && b.dueDate <= in7Days && b.status !== "paid");
  const upcoming30Days = bills.filter(b => b.dueDate >= now && b.dueDate <= in30Days && b.status !== "paid");
  const overdue = bills.filter(b => b.dueDate < now && b.status !== "paid");

  const totalDueNext7 = upcoming7Days.reduce((s, b) => s + b.amount, 0);
  const totalDueNext30 = upcoming30Days.reduce((s, b) => s + b.amount, 0);
  const totalOverdue = overdue.reduce((s, b) => s + b.amount, 0);

  const autopayCount = bills.filter(b => b.autopay).length;
  const autopayPercentage = bills.length > 0 ? autopayCount / bills.length : 0;

  const riskItems: BillCalendarResult["riskItems"] = [];
  for (const bill of overdue) {
    riskItems.push({ bill, reason: `Overdue by ${Math.ceil((now - bill.dueDate) / 86400000)} days` });
  }
  for (const bill of upcoming7Days) {
    if (!bill.autopay && bill.amount > 1000) {
      riskItems.push({ bill, reason: "Large bill due soon without autopay" });
    }
  }

  return { upcoming7Days, upcoming30Days, overdue, totalDueNext7, totalDueNext30, totalOverdue, autopayPercentage, riskItems };
}

// ── Reserve Assessment ──────────────────────────────────────────

export function assessReserves(reserves: Reserve[], monthlyBurn: number): ReserveAssessment {
  const totalReserves = reserves.reduce((s, r) => s + r.currentBalance, 0);
  const totalTarget = reserves.reduce((s, r) => s + r.targetBalance, 0);
  const coverageRatio = totalTarget > 0 ? totalReserves / totalTarget : 1;
  const monthsOfRunway = monthlyBurn > 0 ? totalReserves / monthlyBurn : Infinity;

  const reserveDetails: ReserveAssessment["reserves"] = reserves.map(r => {
    const percentage = r.targetBalance > 0 ? r.currentBalance / r.targetBalance : 1;
    const status: "healthy" | "low" | "critical" | "empty" =
      percentage >= 0.8 ? "healthy" :
      percentage >= 0.5 ? "low" :
      percentage > 0 ? "critical" : "empty";
    return { name: r.name, current: r.currentBalance, target: r.targetBalance, percentage, status };
  });

  const recommendations: string[] = [];
  const criticalReserves = reserveDetails.filter(r => r.status === "critical" || r.status === "empty");
  if (criticalReserves.length > 0) {
    recommendations.push(`${criticalReserves.length} reserve(s) critically low — prioritize contributions`);
  }
  if (monthsOfRunway < 3) {
    recommendations.push("Less than 3 months runway — increase emergency reserves");
  }
  if (coverageRatio < 0.5) {
    recommendations.push("Overall reserves below 50% of target — review allocation strategy");
  }

  return { totalReserves, totalTarget, coverageRatio, monthsOfRunway, reserves: reserveDetails, recommendations };
}

// ── Invoice Aging Analysis ──────────────────────────────────────

export function analyzeInvoiceAging(invoices: FinanceInvoice[]): InvoiceAgingResult {
  const buckets = {
    current: { count: 0, total: 0 },
    days1to30: { count: 0, total: 0 },
    days31to60: { count: 0, total: 0 },
    days61to90: { count: 0, total: 0 },
    days90plus: { count: 0, total: 0 },
  };

  let totalOutstanding = 0;
  let weightedDaysSum = 0;
  const customerOverdue: Map<string, { total: number; oldestDays: number; name: string }> = new Map();

  const unpaid = invoices.filter(inv => inv.status !== "paid" && inv.status !== "written-off");

  for (const inv of unpaid) {
    const outstanding = inv.amount - inv.paidAmount;
    totalOutstanding += outstanding;
    weightedDaysSum += outstanding * inv.daysSinceIssued;

    if (inv.daysSinceIssued <= 0) buckets.current.count++, buckets.current.total += outstanding;
    else if (inv.daysSinceIssued <= 30) buckets.days1to30.count++, buckets.days1to30.total += outstanding;
    else if (inv.daysSinceIssued <= 60) buckets.days31to60.count++, buckets.days31to60.total += outstanding;
    else if (inv.daysSinceIssued <= 90) buckets.days61to90.count++, buckets.days61to90.total += outstanding;
    else buckets.days90plus.count++, buckets.days90plus.total += outstanding;

    if (inv.status === "overdue") {
      const existing = customerOverdue.get(inv.customerId);
      if (existing) {
        existing.total += outstanding;
        existing.oldestDays = Math.max(existing.oldestDays, inv.daysSinceIssued);
      } else {
        customerOverdue.set(inv.customerId, { total: outstanding, oldestDays: inv.daysSinceIssued, name: inv.customerName });
      }
    }
  }

  const weightedAvgDays = totalOutstanding > 0 ? Math.round(weightedDaysSum / totalOutstanding) : 0;
  const totalIssued = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const collectionEfficiency = totalIssued > 0 ? totalPaid / totalIssued : 1;

  const atRiskAccounts = Array.from(customerOverdue.entries()).map(([customerId, data]) => ({
    customerId, customerName: data.name, totalOverdue: data.total, oldestDays: data.oldestDays,
  })).sort((a, b) => b.totalOverdue - a.totalOverdue);

  return { ...buckets, totalOutstanding, weightedAvgDays, collectionEfficiency, atRiskAccounts };
}

// ── Financial Health Assessment ─────────────────────────────────

export function assessFinancialHealth(
  cashflow: CashflowAnalysis,
  budgetHealth: BudgetHealthResult,
  reserveAssessment: ReserveAssessment,
  invoiceAging: InvoiceAgingResult
): FinancialHealthResult {
  const cashflowHealth = cashflow.healthIndicator === "surplus" ? 90 :
    cashflow.healthIndicator === "balanced" ? 70 :
    cashflow.healthIndicator === "tight" ? 45 : 20;

  const reserveHealth = Math.round(Math.min(100, reserveAssessment.coverageRatio * 100));
  const receivablesHealth = Math.round(invoiceAging.collectionEfficiency * 100);

  const overallScore = Math.round(
    cashflowHealth * 0.35 + budgetHealth.healthScore * 0.20 + reserveHealth * 0.25 + receivablesHealth * 0.20
  );

  const risks: FinancialHealthResult["risks"] = [];

  if (cashflow.netCashflow < 0) {
    risks.push({ type: "negative-cashflow", severity: "critical", description: "Net cashflow is negative", suggestedAction: "Reduce expenses or accelerate receivables" });
  }
  if (reserveAssessment.monthsOfRunway < 3) {
    risks.push({ type: "low-runway", severity: "high", description: `Only ${reserveAssessment.monthsOfRunway.toFixed(1)} months of runway`, suggestedAction: "Increase reserves or reduce burn rate" });
  }
  if (invoiceAging.days90plus.total > 0) {
    risks.push({ type: "aged-receivables", severity: "high", description: `$${invoiceAging.days90plus.total.toLocaleString()} in 90+ day receivables`, suggestedAction: "Escalate collections on aged invoices" });
  }
  if (budgetHealth.overBudgetCount > 0) {
    risks.push({ type: "budget-overrun", severity: "medium", description: `${budgetHealth.overBudgetCount} budget(s) exceeded`, suggestedAction: "Review and adjust spending in over-budget categories" });
  }

  const summary = overallScore >= 80 ? "Financial health is strong — well-positioned across all dimensions."
    : overallScore >= 60 ? "Financial health is stable — some areas warrant attention."
    : overallScore >= 40 ? "Financial health needs improvement — review cashflow and reserves."
    : "Financial health is critical — immediate action required.";

  return { overallScore, cashflowHealth, budgetHealth: budgetHealth.healthScore, reserveHealth, receivablesHealth, risks, summary };
}

// ── Burn Multiple ───────────────────────────────────────────────

export function calculateBurnMultiple(netBurn: number, netNewARR: number): { burnMultiple: number; rating: "excellent" | "good" | "fair" | "poor" | "critical"; description: string } {
  if (netNewARR <= 0) {
    return { burnMultiple: Infinity, rating: "critical", description: "No new ARR — burning cash without growth" };
  }

  const burnMultiple = Math.abs(netBurn) / netNewARR;

  const rating: "excellent" | "good" | "fair" | "poor" | "critical" =
    burnMultiple < 1 ? "excellent" :
    burnMultiple < 1.5 ? "good" :
    burnMultiple < 2 ? "fair" :
    burnMultiple < 3 ? "poor" : "critical";

  const description =
    rating === "excellent" ? "Excellent capital efficiency — spending less than earning"
    : rating === "good" ? "Good efficiency — sustainable growth trajectory"
    : rating === "fair" ? "Acceptable — monitor for improvement opportunities"
    : rating === "poor" ? "Inefficient burn — review spending relative to growth"
    : "Critical — burning significantly more than earning";

  return { burnMultiple, rating, description };
}
