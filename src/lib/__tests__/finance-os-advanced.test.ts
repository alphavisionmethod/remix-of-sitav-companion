import { describe, it, expect } from "vitest";
import {
  analyzeCashflow,
  assessBudgetHealth,
  estimateTax,
  analyzeBillCalendar,
  assessReserves,
  analyzeInvoiceAging,
  assessFinancialHealth,
  calculateBurnMultiple,
} from "@/lib/domain-engines/finance-os";

describe("Finance OS — analyzeCashflow", () => {
  it("calculates inflows/outflows correctly", () => {
    const entries = [
      { id: "1", type: "inflow" as const, amount: 5000, category: "revenue", description: "Sales", date: Date.now(), recurring: false },
      { id: "2", type: "outflow" as const, amount: 2000, category: "rent", description: "Office", date: Date.now(), recurring: true },
      { id: "3", type: "inflow" as const, amount: 3000, category: "revenue", description: "Consulting", date: Date.now(), recurring: true },
    ];
    const result = analyzeCashflow(entries, 10000);
    expect(result.totalInflows).toBe(8000);
    expect(result.totalOutflows).toBe(2000);
    expect(result.netCashflow).toBe(6000);
    expect(result.healthIndicator).toBe("surplus");
  });

  it("detects negative cashflow", () => {
    const entries = [
      { id: "1", type: "inflow" as const, amount: 1000, category: "sales", description: "", date: Date.now(), recurring: false },
      { id: "2", type: "outflow" as const, amount: 5000, category: "rent", description: "", date: Date.now(), recurring: false },
    ];
    const result = analyzeCashflow(entries, 5000);
    expect(result.netCashflow).toBe(-4000);
    expect(result.healthIndicator).toBe("negative");
  });

  it("handles empty entries", () => {
    const result = analyzeCashflow([], 10000);
    expect(result.totalInflows).toBe(0);
    expect(result.totalOutflows).toBe(0);
    expect(result.runwayMonths).toBe(Infinity);
  });

  it("calculates runway from monthly burn", () => {
    const entries = [
      { id: "1", type: "outflow" as const, amount: 5000, category: "ops", description: "", date: Date.now(), recurring: false },
    ];
    const result = analyzeCashflow(entries, 25000, 5000);
    expect(result.runwayMonths).toBe(5);
  });

  it("categorizes inflows and outflows separately", () => {
    const entries = [
      { id: "1", type: "inflow" as const, amount: 3000, category: "sales", description: "", date: Date.now(), recurring: false },
      { id: "2", type: "inflow" as const, amount: 2000, category: "sales", description: "", date: Date.now(), recurring: false },
      { id: "3", type: "outflow" as const, amount: 1000, category: "rent", description: "", date: Date.now(), recurring: false },
    ];
    const result = analyzeCashflow(entries, 10000);
    expect(result.inflowsByCategory["sales"]).toBe(5000);
    expect(result.outflowsByCategory["rent"]).toBe(1000);
  });
});

describe("Finance OS — assessBudgetHealth", () => {
  it("returns default for empty budgets", () => {
    const result = assessBudgetHealth([]);
    expect(result.healthScore).toBe(50);
    expect(result.recommendations).toContain("Set up budgets to track spending");
  });

  it("detects over-budget categories", () => {
    const budgets = [
      { id: "1", name: "Marketing", allocated: 1000, spent: 1500, period: "monthly" as const },
      { id: "2", name: "Ops", allocated: 2000, spent: 1000, period: "monthly" as const },
    ];
    const result = assessBudgetHealth(budgets);
    expect(result.overBudgetCount).toBe(1);
    expect(result.categories.find(c => c.name === "Marketing")?.status).toBe("over");
    expect(result.categories.find(c => c.name === "Ops")?.status).toBe("on-track");
  });

  it("detects under-budget categories", () => {
    const budgets = [
      { id: "1", name: "A", allocated: 1000, spent: 100, period: "monthly" as const },
      { id: "2", name: "B", allocated: 1000, spent: 150, period: "monthly" as const },
      { id: "3", name: "C", allocated: 1000, spent: 200, period: "monthly" as const },
    ];
    const result = assessBudgetHealth(budgets);
    expect(result.underBudgetCount).toBe(3);
  });
});

describe("Finance OS — estimateTax", () => {
  it("calculates tax for basic income", () => {
    const result = estimateTax(50000);
    expect(result.estimatedTax).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeLessThan(1);
    expect(result.quarterlyPayment).toBe(Math.round(result.estimatedTax / 4));
  });

  it("returns zero tax for income below deduction", () => {
    const result = estimateTax(10000, 14600);
    expect(result.estimatedTax).toBe(0);
  });

  it("applies custom deductions", () => {
    const withStandard = estimateTax(100000);
    const withHigher = estimateTax(100000, 30000);
    expect(withHigher.estimatedTax).toBeLessThan(withStandard.estimatedTax);
  });

  it("handles zero income", () => {
    const result = estimateTax(0);
    expect(result.estimatedTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it("handles high income brackets", () => {
    const result = estimateTax(1000000);
    expect(result.marginalRate).toBe(0.37);
    expect(result.bracket).toBe("37%");
  });
});

describe("Finance OS — analyzeBillCalendar", () => {
  const now = Date.now();

  it("categorizes bills correctly", () => {
    const bills = [
      { id: "1", name: "Rent", amount: 2000, dueDate: now + 3 * 86400000, status: "pending" as const, autopay: true, category: "housing", payee: "Landlord" },
      { id: "2", name: "Phone", amount: 100, dueDate: now - 86400000, status: "pending" as const, autopay: false, category: "utilities", payee: "Verizon" },
    ];
    const result = analyzeBillCalendar(bills);
    expect(result.overdue.length).toBe(1);
    expect(result.upcoming7Days.length).toBe(1);
    expect(result.totalOverdue).toBe(100);
    expect(result.totalDueNext7).toBe(2000);
  });

  it("tracks autopay percentage", () => {
    const bills = [
      { id: "1", name: "A", amount: 100, dueDate: now + 86400000, status: "pending" as const, autopay: true, category: "misc", payee: "X" },
      { id: "2", name: "B", amount: 200, dueDate: now + 86400000, status: "pending" as const, autopay: false, category: "misc", payee: "Y" },
    ];
    const result = analyzeBillCalendar(bills);
    expect(result.autopayPercentage).toBe(0.5);
  });

  it("identifies risk items for large non-autopay bills", () => {
    const bills = [
      { id: "1", name: "Rent", amount: 5000, dueDate: now + 2 * 86400000, status: "pending" as const, autopay: false, category: "housing", payee: "Landlord" },
    ];
    const result = analyzeBillCalendar(bills);
    expect(result.riskItems.length).toBe(1);
  });
});

describe("Finance OS — assessReserves", () => {
  it("calculates reserve health", () => {
    const reserves = [
      { id: "1", name: "Emergency", currentBalance: 8000, targetBalance: 10000, type: "emergency" as const },
      { id: "2", name: "Tax", currentBalance: 5000, targetBalance: 5000, type: "tax" as const },
    ];
    const result = assessReserves(reserves, 5000);
    expect(result.totalReserves).toBe(13000);
    expect(result.coverageRatio).toBeCloseTo(0.867, 2);
    expect(result.monthsOfRunway).toBe(2.6);
  });

  it("warns on low runway", () => {
    const reserves = [
      { id: "1", name: "Emergency", currentBalance: 5000, targetBalance: 20000, type: "emergency" as const },
    ];
    const result = assessReserves(reserves, 5000);
    expect(result.monthsOfRunway).toBe(1);
    expect(result.recommendations.some(r => r.includes("runway"))).toBe(true);
  });

  it("handles zero burn rate", () => {
    const reserves = [
      { id: "1", name: "Emergency", currentBalance: 10000, targetBalance: 10000, type: "emergency" as const },
    ];
    const result = assessReserves(reserves, 0);
    expect(result.monthsOfRunway).toBe(Infinity);
  });
});

describe("Finance OS — analyzeInvoiceAging", () => {
  it("buckets invoices by age", () => {
    const invoices = [
      { id: "1", customerId: "C1", customerName: "Acme", amount: 1000, paidAmount: 0, status: "pending" as const, daysSinceIssued: 5, dueDate: Date.now() },
      { id: "2", customerId: "C2", customerName: "Bloom", amount: 2000, paidAmount: 0, status: "overdue" as const, daysSinceIssued: 45, dueDate: Date.now() },
      { id: "3", customerId: "C1", customerName: "Acme", amount: 500, paidAmount: 500, status: "paid" as const, daysSinceIssued: 10, dueDate: Date.now() },
    ];
    const result = analyzeInvoiceAging(invoices);
    expect(result.days1to30.count).toBe(1);
    expect(result.days31to60.count).toBe(1);
    expect(result.totalOutstanding).toBe(3000);
    expect(result.atRiskAccounts.length).toBe(1);
    expect(result.atRiskAccounts[0].customerName).toBe("Bloom");
  });

  it("calculates collection efficiency", () => {
    const invoices = [
      { id: "1", customerId: "C1", customerName: "A", amount: 1000, paidAmount: 1000, status: "paid" as const, daysSinceIssued: 30, dueDate: Date.now() },
      { id: "2", customerId: "C2", customerName: "B", amount: 1000, paidAmount: 0, status: "pending" as const, daysSinceIssued: 10, dueDate: Date.now() },
    ];
    const result = analyzeInvoiceAging(invoices);
    expect(result.collectionEfficiency).toBe(0.5);
  });
});

describe("Finance OS — assessFinancialHealth", () => {
  it("computes composite health score", () => {
    const cashflow = { totalInflows: 10000, totalOutflows: 5000, netCashflow: 5000, runwayMonths: 12, inflowsByCategory: {}, outflowsByCategory: {}, healthIndicator: "surplus" as const, projectedNextMonth: { inflows: 10000, outflows: 5000, net: 5000 } };
    const budget = { overallUtilization: 0.6, overBudgetCount: 0, underBudgetCount: 0, categories: [], healthScore: 85, recommendations: [] };
    const reserves = { totalReserves: 50000, totalTarget: 50000, coverageRatio: 1.0, monthsOfRunway: 8, reserves: [], recommendations: [] };
    const aging = { current: { count: 0, total: 0 }, days1to30: { count: 0, total: 0 }, days31to60: { count: 0, total: 0 }, days61to90: { count: 0, total: 0 }, days90plus: { count: 0, total: 0 }, totalOutstanding: 0, weightedAvgDays: 0, collectionEfficiency: 1.0, atRiskAccounts: [] };
    const result = assessFinancialHealth(cashflow, budget, reserves, aging);
    expect(result.overallScore).toBeGreaterThanOrEqual(80);
    expect(result.risks.length).toBe(0);
  });

  it("identifies critical risks", () => {
    const cashflow = { totalInflows: 2000, totalOutflows: 8000, netCashflow: -6000, runwayMonths: 1, inflowsByCategory: {}, outflowsByCategory: {}, healthIndicator: "negative" as const, projectedNextMonth: { inflows: 2000, outflows: 8000, net: -6000 } };
    const budget = { overallUtilization: 1.5, overBudgetCount: 3, underBudgetCount: 0, categories: [], healthScore: 20, recommendations: [] };
    const reserves = { totalReserves: 5000, totalTarget: 50000, coverageRatio: 0.1, monthsOfRunway: 0.6, reserves: [], recommendations: [] };
    const aging = { current: { count: 0, total: 0 }, days1to30: { count: 0, total: 0 }, days31to60: { count: 0, total: 0 }, days61to90: { count: 0, total: 0 }, days90plus: { count: 1, total: 5000 }, totalOutstanding: 5000, weightedAvgDays: 100, collectionEfficiency: 0.3, atRiskAccounts: [] };
    const result = assessFinancialHealth(cashflow, budget, reserves, aging);
    expect(result.overallScore).toBeLessThan(40);
    expect(result.risks.length).toBeGreaterThanOrEqual(3);
  });
});

describe("Finance OS — calculateBurnMultiple", () => {
  it("returns excellent for low burn", () => {
    const result = calculateBurnMultiple(5000, 10000);
    expect(result.rating).toBe("excellent");
    expect(result.burnMultiple).toBe(0.5);
  });

  it("returns critical for zero ARR", () => {
    const result = calculateBurnMultiple(10000, 0);
    expect(result.rating).toBe("critical");
    expect(result.burnMultiple).toBe(Infinity);
  });

  it("returns poor for high burn", () => {
    const result = calculateBurnMultiple(25000, 10000);
    expect(result.rating).toBe("poor");
  });
});
