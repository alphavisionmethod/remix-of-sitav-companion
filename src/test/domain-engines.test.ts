import { describe, it, expect } from "vitest";
import { assessBusinessHealth } from "@/lib/domain-engines/business-os";
import { analyzeCashflow, assessReserves } from "@/lib/domain-engines/finance-os";
import { prioritizeTasks } from "@/lib/domain-engines/concierge-os";
import { adaptMockLeads, adaptMockCustomers, adaptMockOpportunities } from "@/lib/domain-engines/adapters";

describe("Business OS Domain Engine", () => {
  it("assesses business health", () => {
    const customers = adaptMockCustomers([{ id: "C-1", name: "Bloom", mrr: "$1,200", health: "healthy", lastInteraction: "Yesterday" }]);
    const pipeline = adaptMockOpportunities([{ id: "O-1", name: "Deal", value: "$5,000", stage: "proposal", probability: 60, daysOpen: 10 }]);
    const result = assessBusinessHealth(customers, pipeline, [8000, 9000, 8500, 9200, 10000, 10500]);
    expect(result).toBeDefined();
    expect(typeof result.overallScore).toBe("number");
  });
});

describe("Finance OS Domain Engine", () => {
  it("analyzes cashflow", () => {
    const entries = [
      { id: "cf-1", type: "inflow" as const, category: "revenue", amount: 5000, date: Date.now(), recurring: false, description: "Revenue" },
      { id: "cf-2", type: "outflow" as const, category: "rent", amount: 2000, date: Date.now(), recurring: true, description: "Rent" },
    ];
    const result = analyzeCashflow(entries, 10000);
    expect(result).toBeDefined();
    expect(typeof result.netCashflow).toBe("number");
  });

  it("assesses reserves", () => {
    const reserves = [{ id: "r-1", name: "Emergency", type: "emergency" as const, currentBalance: 5000, targetBalance: 10000 }];
    const monthlyExpenses = 4000;
    const result = assessReserves(reserves, monthlyExpenses);
    expect(result).toBeDefined();
  });
});

describe("Concierge OS Domain Engine", () => {
  it("prioritizes tasks", () => {
    const tasks = [
      { id: "T-1", title: "Schedule dentist", category: "health" as const, priority: "high" as const, estimatedMinutes: 15, status: "pending" as const, recurring: false, energyLevel: "low" as const, dueDate: Date.now() + 86400000 },
      { id: "T-2", title: "Grocery run", category: "errands" as const, priority: "medium" as const, estimatedMinutes: 60, status: "pending" as const, recurring: true, energyLevel: "medium" as const },
    ];
    const result = prioritizeTasks(tasks);
    expect(result).toBeDefined();
    expect(result.prioritized.length).toBeGreaterThan(0);
  });
});
