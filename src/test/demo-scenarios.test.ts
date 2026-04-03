import { describe, it, expect } from "vitest";
import { founderScenario } from "@/lib/demo-scenarios/founder";
import { familyScenario } from "@/lib/demo-scenarios/family";
import { moneyScenario } from "@/lib/demo-scenarios/money";
import { defaultScenario } from "@/lib/demo-scenarios/default";
import { scenarios, getScenarioData } from "@/lib/demo-scenarios";

describe("Demo Scenarios Registry", () => {
  it("exports all 4 scenario keys", () => {
    expect(scenarios).toHaveLength(4);
    const keys = scenarios.map(s => s.key);
    expect(keys).toContain("founder");
    expect(keys).toContain("family");
    expect(keys).toContain("money");
    expect(keys).toContain("default");
  });

  it("each scenario has label and description", () => {
    for (const s of scenarios) {
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.description.length).toBeGreaterThan(0);
    }
  });

  it("getScenarioData resolves each key", async () => {
    for (const s of scenarios) {
      const data = await getScenarioData(s.key);
      expect(data).toBeDefined();
      expect(data.name).toBeTruthy();
      expect(data.description).toBeTruthy();
      expect(data.data).toBeDefined();
    }
  });
});

describe("Founder Scenario", () => {
  it("has leads with required fields", () => {
    for (const lead of founderScenario.data.leads) {
      expect(lead.id).toBeTruthy();
      expect(lead.name).toBeTruthy();
      expect(lead.company).toBeTruthy();
      expect(lead.score).toBeGreaterThan(0);
    }
  });

  it("has invoices with statuses", () => {
    for (const inv of founderScenario.data.invoices) {
      expect(["paid", "overdue", "pending", "sent", "draft"]).toContain(inv.status);
    }
  });

  it("has a focus statement", () => {
    expect(founderScenario.data.focus.length).toBeGreaterThan(10);
  });
});

describe("Family Scenario", () => {
  it("has household tasks with priorities", () => {
    for (const task of familyScenario.data.householdTasks) {
      expect(["high", "medium", "low"]).toContain(task.priority);
      expect(["pending", "in-progress", "done"]).toContain(task.status);
    }
  });

  it("has family events with location", () => {
    for (const evt of familyScenario.data.familyEvents) {
      expect(evt.location).toBeTruthy();
      expect(evt.when).toBeTruthy();
    }
  });
});

describe("Money Scenario", () => {
  it("has bills with amounts", () => {
    for (const bill of moneyScenario.data.bills) {
      expect(bill.amount).toMatch(/^\$/);
    }
  });

  it("has cash flow data", () => {
    expect(moneyScenario.data.cashFlow.available).toMatch(/^\$/);
    expect(moneyScenario.data.cashFlow.runway).toBeTruthy();
  });
});

describe("Default (Full OS) Scenario", () => {
  const d = defaultScenario.data;

  it("has all domain data populated", () => {
    expect(d.leads.length).toBeGreaterThanOrEqual(5);
    expect(d.customers.length).toBeGreaterThanOrEqual(3);
    expect(d.opportunities.length).toBeGreaterThanOrEqual(3);
    expect(d.invoices.length).toBeGreaterThanOrEqual(4);
    expect(d.bills.length).toBeGreaterThanOrEqual(5);
    expect(d.subscriptions.length).toBeGreaterThanOrEqual(5);
    expect(d.householdTasks.length).toBeGreaterThanOrEqual(5);
    expect(d.familyEvents.length).toBeGreaterThanOrEqual(5);
    expect(d.groceryList.length).toBeGreaterThanOrEqual(5);
    expect(d.travel.length).toBeGreaterThanOrEqual(2);
    expect(d.reserves.length).toBeGreaterThanOrEqual(2);
  });

  it("has cross-domain insights", () => {
    expect(d.crossDomainInsights.length).toBeGreaterThanOrEqual(3);
    for (const insight of d.crossDomainInsights) {
      expect(insight.domains.length).toBeGreaterThan(0);
      expect(["high", "medium", "low"]).toContain(insight.impact);
    }
  });

  it("has unique IDs across all entities", () => {
    const allIds = [
      ...d.leads.map(l => l.id),
      ...d.customers.map(c => c.id),
      ...d.opportunities.map(o => o.id),
      ...d.invoices.map(i => i.id),
      ...d.bills.map(b => b.id),
      ...d.subscriptions.map(s => s.id),
      ...d.householdTasks.map(t => t.id),
      ...d.familyEvents.map(e => e.id),
      ...d.groceryList.map(g => g.id),
      ...d.travel.map(t => t.id),
      ...d.reserves.map(r => r.id),
    ];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it("cash flow has all required fields", () => {
    expect(d.cashFlow.available).toBeTruthy();
    expect(d.cashFlow.incoming).toBeTruthy();
    expect(d.cashFlow.outgoing).toBeTruthy();
    expect(d.cashFlow.runway).toBeTruthy();
    expect(d.cashFlow.burnRate).toBeTruthy();
    expect(d.cashFlow.reserveHealth).toBeTruthy();
  });

  it("service providers have ratings", () => {
    for (const sp of d.serviceProviders) {
      expect(sp.rating).toBeGreaterThan(0);
      expect(sp.rating).toBeLessThanOrEqual(5);
    }
  });
});
