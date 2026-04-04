import { describe, it, expect } from "vitest";
import { evaluateCrossDomainIntelligence } from "@/lib/cross-domain";
import { mockLeads, mockInvoices, mockCashFlow, mockHouseholdTasks, mockBills, mockSubscriptions } from "@/lib/mock-data/legacy-display-mocks";

describe("Cross-Domain Intelligence", () => {
  it("produces insights from multi-domain data", () => {
    const insights = evaluateCrossDomainIntelligence({
      invoices: mockInvoices,
      leads: mockLeads,
      cashFlow: mockCashFlow,
      householdTasks: mockHouseholdTasks,
      bills: mockBills,
      subscriptions: mockSubscriptions,
    });
    expect(insights.length).toBeGreaterThan(0);
  });

  it("each insight has required fields", () => {
    const insights = evaluateCrossDomainIntelligence({
      invoices: mockInvoices,
      leads: mockLeads,
      cashFlow: mockCashFlow,
      householdTasks: mockHouseholdTasks,
      bills: mockBills,
      subscriptions: mockSubscriptions,
    });
    for (const insight of insights) {
      expect(insight.title).toBeTruthy();
      expect(insight.description).toBeTruthy();
      expect(insight.severity).toBeTruthy();
      expect(insight.sourceDomain).toBeTruthy();
    }
  });

  it("handles empty inputs gracefully", () => {
    const insights = evaluateCrossDomainIntelligence({
      invoices: [],
      leads: [],
      cashFlow: mockCashFlow,
      householdTasks: [],
      bills: [],
      subscriptions: [],
    });
    expect(Array.isArray(insights)).toBe(true);
  });
});
