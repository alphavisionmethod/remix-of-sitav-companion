import { describe, it, expect } from "vitest";
import { analyzeCashflow, assessBudgetHealth, estimateTax, analyzeBillCalendar, assessReserves, analyzeInvoiceAging, assessFinancialHealth, calculateBurnMultiple } from "@/lib/domain-engines/finance-os";

const now = Date.now();
const makeBill = (overrides = {}) => ({ id: "B-1", vendor: "V", amount: 1000, dueDate: now + 3 * 86400000, category: "rent", recurring: false, status: "upcoming" as const, autopay: false, ...overrides });
const makeBudget = (overrides = {}) => ({ id: "BU-1", name: "Marketing", category: "marketing", period: "monthly" as const, allocated: 1000, spent: 500, startDate: now, endDate: now + 30 * 86400000, ...overrides });
const makeInvoice = (overrides = {}) => ({ id: "I-1", customerId: "C1", customerName: "Acme", amount: 1000, issuedDate: now - 10 * 86400000, dueDate: now, status: "sent" as const, paidAmount: 0, daysSinceIssued: 10, ...overrides });

describe("Finance OS — analyzeCashflow", () => {
  it("calculates correctly", () => {
    const r = analyzeCashflow([
      { id: "1", type: "inflow", amount: 5000, category: "revenue", description: "", date: now, recurring: false },
      { id: "2", type: "outflow", amount: 2000, category: "rent", description: "", date: now, recurring: true },
    ], 10000);
    expect(r.totalInflows).toBe(5000);
    expect(r.totalOutflows).toBe(2000);
    expect(r.healthIndicator).toBe("surplus");
  });
  it("detects negative cashflow", () => {
    const r = analyzeCashflow([{ id: "1", type: "inflow", amount: 1000, category: "s", description: "", date: now, recurring: false }, { id: "2", type: "outflow", amount: 5000, category: "r", description: "", date: now, recurring: false }], 5000);
    expect(r.healthIndicator).toBe("negative");
  });
  it("handles empty", () => {
    expect(analyzeCashflow([], 10000).runwayMonths).toBe(Infinity);
  });
});

describe("Finance OS — assessBudgetHealth", () => {
  it("returns default for empty", () => { expect(assessBudgetHealth([]).healthScore).toBe(50); });
  it("detects over-budget", () => {
    const r = assessBudgetHealth([makeBudget({ spent: 1500 }), makeBudget({ id: "BU-2", name: "Ops", spent: 500 })]);
    expect(r.overBudgetCount).toBe(1);
  });
});

describe("Finance OS — estimateTax", () => {
  it("calculates for basic income", () => { const r = estimateTax(50000); expect(r.estimatedTax).toBeGreaterThan(0); });
  it("zero for income below deduction", () => { expect(estimateTax(10000, 14600).estimatedTax).toBe(0); });
  it("handles high income", () => { expect(estimateTax(1000000).marginalRate).toBe(0.37); });
});

describe("Finance OS — analyzeBillCalendar", () => {
  it("categorizes bills", () => {
    const r = analyzeBillCalendar([makeBill(), makeBill({ id: "B-2", dueDate: now - 86400000 })]);
    expect(r.overdue.length).toBe(1);
    expect(r.upcoming7Days.length).toBe(1);
  });
  it("tracks autopay percentage", () => {
    const r = analyzeBillCalendar([makeBill({ autopay: true }), makeBill({ id: "B-2", autopay: false })]);
    expect(r.autopayPercentage).toBe(0.5);
  });
});

describe("Finance OS — assessReserves", () => {
  it("calculates reserve health", () => {
    const r = assessReserves([{ id: "1", name: "Emergency", currentBalance: 8000, targetBalance: 10000, type: "emergency" }], 5000);
    expect(r.coverageRatio).toBeCloseTo(0.8, 1);
    expect(r.monthsOfRunway).toBe(1.6);
  });
  it("warns on low runway", () => {
    const r = assessReserves([{ id: "1", name: "E", currentBalance: 5000, targetBalance: 20000, type: "emergency" }], 5000);
    expect(r.recommendations.some(x => x.includes("runway"))).toBe(true);
  });
});

describe("Finance OS — analyzeInvoiceAging", () => {
  it("buckets invoices", () => {
    const r = analyzeInvoiceAging([makeInvoice({ daysSinceIssued: 5 }), makeInvoice({ id: "I-2", daysSinceIssued: 45, status: "overdue", customerName: "Bloom", customerId: "C2" })]);
    expect(r.days1to30.count).toBe(1);
    expect(r.days31to60.count).toBe(1);
    expect(r.atRiskAccounts.length).toBe(1);
  });
});

describe("Finance OS — assessFinancialHealth", () => {
  it("computes composite score", () => {
    const cf = { totalInflows: 10000, totalOutflows: 5000, netCashflow: 5000, runwayMonths: 12, inflowsByCategory: {}, outflowsByCategory: {}, healthIndicator: "surplus" as const, projectedNextMonth: { inflows: 10000, outflows: 5000, net: 5000 } };
    const bh = { overallUtilization: 0.6, overBudgetCount: 0, underBudgetCount: 0, categories: [], healthScore: 85, recommendations: [] };
    const ra = { totalReserves: 50000, totalTarget: 50000, coverageRatio: 1.0, monthsOfRunway: 8, reserves: [], recommendations: [] };
    const ia = { current: { count: 0, total: 0 }, days1to30: { count: 0, total: 0 }, days31to60: { count: 0, total: 0 }, days61to90: { count: 0, total: 0 }, days90plus: { count: 0, total: 0 }, totalOutstanding: 0, weightedAvgDays: 0, collectionEfficiency: 1.0, atRiskAccounts: [] };
    const r = assessFinancialHealth(cf, bh, ra, ia);
    expect(r.overallScore).toBeGreaterThanOrEqual(80);
  });
});

describe("Finance OS — calculateBurnMultiple", () => {
  it("excellent for low burn", () => { expect(calculateBurnMultiple(5000, 10000).rating).toBe("excellent"); });
  it("critical for zero ARR", () => { expect(calculateBurnMultiple(10000, 0).rating).toBe("critical"); });
});
