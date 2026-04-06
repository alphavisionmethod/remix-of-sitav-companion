import { describe, it, expect } from "vitest";
import {
  assessBusinessHealth,
  analyzePipeline,
  scoreLead,
  forecastRevenue,
  identifyFollowUps,
  assessClientHealth,
} from "@/lib/domain-engines/business-os";
import type { Customer, PipelineOpportunity, BusinessLead } from "@/packages/contracts";

const makeCustomer = (overrides: Partial<Customer> = {}): Customer => ({
  id: "C-1", name: "Acme", status: "active", totalRevenue: 50000,
  avgPayDays: 25, overdueInvoices: 0, lastInteractionDays: 5, healthScore: undefined, ...overrides,
});

const makeOpp = (overrides: Partial<PipelineOpportunity> = {}): PipelineOpportunity => ({
  id: "O-1", name: "Deal", stage: "negotiation", valueCents: 500000,
  probability: 0.7, daysInStage: 10, lastActivityDays: 5, ownerId: "U-1", ...overrides,
});

const makeLead = (overrides: Partial<BusinessLead> = {}): BusinessLead => ({
  id: "L-1", name: "Lead A", source: "website", status: "active",
  engagementScore: 80, recencyDays: 3, fitScore: 75, estimatedValue: 50000, ...overrides,
});

describe("Business OS — assessBusinessHealth", () => {
  it("returns strong health for good metrics", () => {
    const result = assessBusinessHealth(
      [makeCustomer()],
      [makeOpp()],
      [6000, 6500, 7000, 7500, 8000, 8500]
    );
    expect(result.overallScore).toBeGreaterThanOrEqual(50);
    expect(result.summary).toBeDefined();
  });

  it("detects at-risk customers", () => {
    const result = assessBusinessHealth(
      [makeCustomer({ status: "at-risk", overdueInvoices: 2 })],
      [],
      [5000, 4000]
    );
    expect(result.risks.some(r => r.type === "customer-churn")).toBe(true);
  });

  it("detects revenue decline", () => {
    const result = assessBusinessHealth(
      [makeCustomer()],
      [],
      [10000, 8000, 6000, 4000, 2000, 1000]
    );
    expect(result.risks.some(r => r.type === "revenue-decline")).toBe(true);
  });

  it("detects high-value opportunities", () => {
    const result = assessBusinessHealth(
      [makeCustomer()],
      [makeOpp({ valueCents: 10000000, probability: 0.8 })],
      [8000, 8500]
    );
    expect(result.opportunities.some(o => o.type === "high-value-deals")).toBe(true);
  });

  it("includes operational metrics", () => {
    const result = assessBusinessHealth(
      [makeCustomer()],
      [makeOpp()],
      [8000, 8500],
      { openTasks: 10, overdueTasks: 5, activeWorkflows: 3, failedWorkflows: 2 }
    );
    expect(result.operationalHealth).toBeLessThan(100);
  });
});

describe("Business OS — analyzePipeline", () => {
  it("computes pipeline metrics", () => {
    const result = analyzePipeline([
      makeOpp({ stage: "discovery", valueCents: 100000, probability: 0.3 }),
      makeOpp({ stage: "negotiation", valueCents: 500000, probability: 0.7 }),
      makeOpp({ stage: "won", valueCents: 200000, probability: 1.0 }),
    ]);
    expect(result.totalValue).toBe(8000);
    expect(result.stageBreakdown["discovery"]).toBeDefined();
    expect(result.stageBreakdown["discovery"].count).toBe(1);
    expect(result.conversionRate).toBeGreaterThan(0);
  });

  it("detects stale deals", () => {
    const result = analyzePipeline([
      makeOpp({ lastActivityDays: 20, stage: "proposal" }),
      makeOpp({ lastActivityDays: 30, stage: "discovery" }),
    ]);
    expect(result.staleDealCount).toBe(2);
  });

  it("handles empty pipeline", () => {
    const result = analyzePipeline([]);
    expect(result.totalValue).toBe(0);
    expect(result.conversionRate).toBe(0);
    expect(result.avgDaysInPipeline).toBe(0);
  });
});

describe("Business OS — scoreLead", () => {
  it("scores hot leads high", () => {
    const result = scoreLead(makeLead({ engagementScore: 95, recencyDays: 1, fitScore: 90, estimatedValue: 100000 }));
    expect(result.tier).toBe("hot");
    expect(result.totalScore).toBeGreaterThanOrEqual(75);
  });

  it("scores cold leads low", () => {
    const result = scoreLead(makeLead({ engagementScore: 10, recencyDays: 60, fitScore: 10, estimatedValue: 1000 }));
    expect(result.tier).toBe("cold");
    expect(result.totalScore).toBeLessThan(25);
  });

  it("provides appropriate action for each tier", () => {
    const hot = scoreLead(makeLead({ engagementScore: 95, recencyDays: 1, fitScore: 90, estimatedValue: 100000 }));
    const cold = scoreLead(makeLead({ engagementScore: 5, recencyDays: 90, fitScore: 5, estimatedValue: 500 }));
    expect(hot.suggestedAction).toContain("call");
    expect(cold.suggestedAction).toContain("Monitor");
  });
});

describe("Business OS — forecastRevenue", () => {
  it("forecasts growing trend", () => {
    const result = forecastRevenue([5000, 6000, 7000, 8000, 9000, 10000]);
    expect(result.trend).toBe("growing");
    expect(result.nextMonthProjected).toBeGreaterThan(10000);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("forecasts declining trend", () => {
    const result = forecastRevenue([10000, 9000, 8000, 7000, 6000, 5000]);
    expect(result.trend).toBe("declining");
    expect(result.nextMonthProjected).toBeLessThan(5000);
  });

  it("handles insufficient data", () => {
    const result = forecastRevenue([5000]);
    expect(result.confidence).toBe(0.2);
    expect(result.trend).toBe("stable");
  });

  it("handles empty history", () => {
    const result = forecastRevenue([]);
    expect(result.currentMonthProjected).toBe(0);
    expect(result.confidence).toBe(0.2);
  });
});

describe("Business OS — identifyFollowUps", () => {
  it("identifies stale leads", () => {
    const result = identifyFollowUps(
      [makeLead({ recencyDays: 20, status: "active" })],
      [],
      []
    );
    expect(result.length).toBe(1);
    expect(result[0].entityType).toBe("lead");
    expect(result[0].urgency).toBe("today");
  });

  it("identifies customers with overdue invoices", () => {
    const result = identifyFollowUps(
      [],
      [makeCustomer({ overdueInvoices: 3 })],
      []
    );
    expect(result.length).toBe(1);
    expect(result[0].urgency).toBe("immediate");
  });

  it("identifies stale opportunities", () => {
    const result = identifyFollowUps(
      [],
      [],
      [makeOpp({ lastActivityDays: 35, stage: "proposal" })]
    );
    expect(result.length).toBe(1);
    expect(result[0].urgency).toBe("immediate");
  });

  it("skips lost leads", () => {
    const result = identifyFollowUps(
      [makeLead({ status: "lost", recencyDays: 100 })],
      [],
      []
    );
    expect(result.length).toBe(0);
  });

  it("sorts by urgency", () => {
    const result = identifyFollowUps(
      [makeLead({ id: "L-1", recencyDays: 10, status: "active" }), makeLead({ id: "L-2", recencyDays: 50, status: "active" })],
      [],
      []
    );
    expect(result[0].urgency).toBe("immediate");
  });
});

describe("Business OS — assessClientHealth", () => {
  it("returns healthy for good customer", () => {
    const result = assessClientHealth(makeCustomer({ totalRevenue: 80000, avgPayDays: 15, lastInteractionDays: 3 }));
    expect(result.healthScore).toBeGreaterThanOrEqual(70);
    expect(result.churnRisk).toBeLessThan(0.5);
  });

  it("returns low health for risky customer", () => {
    const result = assessClientHealth(makeCustomer({ totalRevenue: 5000, avgPayDays: 90, overdueInvoices: 3, lastInteractionDays: 60 }));
    expect(result.healthScore).toBeLessThan(50);
    expect(result.churnRisk).toBeGreaterThan(0.5);
  });

  it("calculates revenue at risk for churn-prone customers", () => {
    const result = assessClientHealth(makeCustomer({ totalRevenue: 100000, overdueInvoices: 3, lastInteractionDays: 90, avgPayDays: 120 }));
    expect(result.revenueAtRisk).toBeGreaterThan(0);
  });
});
