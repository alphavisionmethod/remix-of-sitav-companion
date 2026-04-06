import { describe, it, expect } from "vitest";
import { assessBusinessHealth, analyzePipeline, scoreLead, forecastRevenue, identifyFollowUps, assessClientHealth } from "@/lib/domain-engines/business-os";
import type { Customer, PipelineOpportunity, BusinessLead } from "@/packages/contracts";

const makeCustomer = (overrides: Partial<Customer> = {}): Customer => ({
  id: "C-1", name: "Acme", status: "active", totalRevenue: 50000, invoiceCount: 5,
  avgPayDays: 25, overdueInvoices: 0, lastInteractionDays: 5, tier: "mid-market", createdAt: Date.now(), ...overrides,
});
const makeOpp = (overrides: Partial<PipelineOpportunity> = {}): PipelineOpportunity => ({
  id: "O-1", name: "Deal", stage: "negotiation", valueCents: 500000, probability: 0.7,
  daysInStage: 10, lastActivityDays: 5, expectedCloseDate: Date.now() + 86400000 * 30, ...overrides,
});
const makeLead = (overrides: Partial<BusinessLead> = {}): BusinessLead => ({
  id: "L-1", name: "Lead A", status: "new", engagementScore: 80, recencyDays: 3,
  fitScore: 75, estimatedValue: 50000, createdAt: Date.now(), ...overrides,
});

describe("Business OS — assessBusinessHealth", () => {
  it("returns strong health for good metrics", () => {
    const r = assessBusinessHealth([makeCustomer()], [makeOpp()], [6000,6500,7000,7500,8000,8500]);
    expect(r.overallScore).toBeGreaterThanOrEqual(50);
  });
  it("detects at-risk customers", () => {
    const r = assessBusinessHealth([makeCustomer({ status: "at-risk", overdueInvoices: 2 })], [], [5000,4000]);
    expect(r.risks.some(x => x.type === "customer-churn")).toBe(true);
  });
  it("detects revenue decline", () => {
    const r = assessBusinessHealth([makeCustomer()], [], [10000,8000,6000,4000,2000,1000]);
    expect(r.risks.some(x => x.type === "revenue-decline")).toBe(true);
  });
  it("detects high-value opportunities", () => {
    const r = assessBusinessHealth([makeCustomer()], [makeOpp({ valueCents: 10000000, probability: 0.8 })], [8000,8500]);
    expect(r.opportunities.some(o => o.type === "high-value-deals")).toBe(true);
  });
});

describe("Business OS — analyzePipeline", () => {
  it("computes pipeline metrics", () => {
    const r = analyzePipeline([makeOpp({ stage: "discovery", valueCents: 100000, probability: 0.3 }), makeOpp({ stage: "won", valueCents: 200000, probability: 1.0 })]);
    expect(r.totalValue).toBeGreaterThan(0);
    expect(r.conversionRate).toBeGreaterThan(0);
  });
  it("detects stale deals", () => {
    const r = analyzePipeline([makeOpp({ lastActivityDays: 20, stage: "proposal" }), makeOpp({ lastActivityDays: 30, stage: "discovery" })]);
    expect(r.staleDealCount).toBe(2);
  });
  it("handles empty pipeline", () => {
    const r = analyzePipeline([]);
    expect(r.totalValue).toBe(0);
  });
});

describe("Business OS — scoreLead", () => {
  it("scores hot leads high", () => {
    const r = scoreLead(makeLead({ engagementScore: 95, recencyDays: 1, fitScore: 90, estimatedValue: 100000 }));
    expect(r.tier).toBe("hot");
  });
  it("scores cold leads low", () => {
    const r = scoreLead(makeLead({ engagementScore: 10, recencyDays: 60, fitScore: 10, estimatedValue: 1000 }));
    expect(r.tier).toBe("cold");
  });
});

describe("Business OS — forecastRevenue", () => {
  it("forecasts growing trend", () => {
    const r = forecastRevenue([5000,6000,7000,8000,9000,10000]);
    expect(r.trend).toBe("growing");
  });
  it("handles insufficient data", () => {
    const r = forecastRevenue([5000]);
    expect(r.confidence).toBe(0.2);
  });
});

describe("Business OS — identifyFollowUps", () => {
  it("identifies stale leads", () => {
    const r = identifyFollowUps([makeLead({ recencyDays: 20, status: "qualified" })], [], []);
    expect(r.length).toBe(1);
  });
  it("skips lost leads", () => {
    const r = identifyFollowUps([makeLead({ status: "lost", recencyDays: 100 })], [], []);
    expect(r.length).toBe(0);
  });
  it("identifies customers with overdue invoices", () => {
    const r = identifyFollowUps([], [makeCustomer({ overdueInvoices: 3 })], []);
    expect(r.length).toBe(1);
  });
});

describe("Business OS — assessClientHealth", () => {
  it("returns healthy for good customer", () => {
    const r = assessClientHealth(makeCustomer({ totalRevenue: 80000, avgPayDays: 15, lastInteractionDays: 3 }));
    expect(r.healthScore).toBeGreaterThanOrEqual(70);
  });
  it("returns low health for risky customer", () => {
    const r = assessClientHealth(makeCustomer({ totalRevenue: 5000, avgPayDays: 90, overdueInvoices: 3, lastInteractionDays: 60 }));
    expect(r.healthScore).toBeLessThan(50);
  });
});
