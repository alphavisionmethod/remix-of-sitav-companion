import { describe, it, expect } from "vitest";

describe("Data Hook Exports", () => {
  it("use-sita-data exports all required hooks", async () => {
    const mod = await import("@/platform/sita/hooks/use-sita-data");
    const requiredHooks = [
      "useLeads", "useCustomers", "useOpportunities", "useQuotes", "useInvoices",
      "useCommunications", "useBills", "useSubscriptions", "useReserves", "useDeals",
      "useFinancialDocuments", "useCashFlow", "useHouseholdTasks", "useFamilyEvents",
      "useGroceryList", "useTravel", "useActivityStream", "useOpportunityInsights",
      "useMemoryItems", "useAutomationRules", "useSystemConnectors", "useAITeam",
      "useIncidents", "useCosts", "useApprovals", "useProofRecords",
      "useReceipts", "useExecutionEnvelopes", "useTrustState", "useBudgets",
      "useCouncilDecisions",
    ];

    for (const hook of requiredHooks) {
      expect(mod).toHaveProperty(hook);
      expect(typeof (mod as never)[hook]).toBe("function");
    }
  });

  it("exports 31 hooks total", async () => {
    const mod = await import("@/platform/sita/hooks/use-sita-data");
    const exportedFunctions = Object.keys(mod).filter(k => typeof (mod as never)[k] === "function");
    expect(exportedFunctions.length).toBeGreaterThanOrEqual(31);
  });
});

describe("Domain Engine Exports", () => {
  it("business-os exports health assessor", async () => {
    const mod = await import("@/lib/domain-engines/business-os");
    expect(mod.assessBusinessHealth).toBeDefined();
  });

  it("finance-os exports all analyzers", async () => {
    const mod = await import("@/lib/domain-engines/finance-os");
    expect(mod.analyzeCashflow).toBeDefined();
    expect(mod.assessBudgetHealth).toBeDefined();
    expect(mod.assessReserves).toBeDefined();
    expect(mod.analyzeInvoiceAging).toBeDefined();
    expect(mod.assessFinancialHealth).toBeDefined();
    expect(mod.analyzeBillCalendar).toBeDefined();
  });

  it("concierge-os exports task prioritizer", async () => {
    const mod = await import("@/lib/domain-engines/concierge-os");
    expect(mod.prioritizeTasks).toBeDefined();
  });

  it("adapters export all conversion functions", async () => {
    const mod = await import("@/lib/domain-engines/adapters");
    const required = [
      "adaptMockLeads", "adaptMockCustomers", "adaptMockOpportunities",
      "adaptMockBills", "adaptMockInvoicesForAging", "adaptMockHouseholdTasks",
      "buildMockCashflowEntries", "buildMockBudgets", "buildMockReserves",
    ];
    for (const fn of required) {
      expect(mod).toHaveProperty(fn);
    }
  });
});

describe("Core Services", () => {
  it("fraud-sentinel is importable", async () => {
    const mod = await import("@/lib/core-services/fraud-sentinel");
    expect(mod.FraudSentinelService).toBeDefined();
  });

  it("governance-simulator is importable", async () => {
    const mod = await import("@/lib/core-services/governance-simulator");
    expect(mod.GovernanceSimulatorService).toBeDefined();
  });

  it("payment-execution exports simulate function", async () => {
    const mod = await import("@/lib/core-services/payment-execution");
    expect(mod.simulatePayment).toBeDefined();
  });
});
