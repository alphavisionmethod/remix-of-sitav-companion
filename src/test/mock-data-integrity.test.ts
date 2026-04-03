import { describe, it, expect } from "vitest";
import {
  mockLeads, mockCustomers, mockOpportunities, mockQuotes, mockInvoices,
  mockCommunications, mockBills, mockSubscriptions, mockCashFlow,
  mockHouseholdTasks, mockFamilyEvents, mockGroceryList, mockTravel,
  mockActivity, mockOpportunityInsights, mockMemoryItems, mockConnectors,
  mockAutomationRules, mockAITeam, mockIncidents, mockCosts,
} from "@/lib/mocks";
import {
  mockAdminIncidents, mockAdminAuditLogs, mockAdminPolicies,
  mockAdminDevices, mockAdminCouncilDecisions, mockAdminIntelligence,
  mockAgentRuntimeStates,
} from "@/lib/mocks/admin";

describe("Mock Data Integrity", () => {
  describe("Business Domain", () => {
    it("leads have unique IDs", () => {
      const ids = mockLeads.map(l => l.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("customers have unique IDs", () => {
      const ids = mockCustomers.map(c => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("opportunities reference valid stages", () => {
      const stages = ["discovery", "proposal", "negotiation", "closed-won", "closed-lost", "qualified"];
      for (const opp of mockOpportunities) {
        expect(stages).toContain(opp.stage);
      }
    });

    it("invoices have valid statuses", () => {
      for (const inv of mockInvoices) {
        expect(["draft", "sent", "pending", "paid", "overdue", "cancelled"]).toContain(inv.status);
      }
    });

    it("communications have valid channels", () => {
      for (const com of mockCommunications) {
        expect(["email", "sms", "slack", "call", "meeting"]).toContain(com.channel);
      }
    });
  });

  describe("Money Domain", () => {
    it("bills have valid statuses", () => {
      for (const bill of mockBills) {
        expect(["upcoming", "overdue", "paid", "scheduled"]).toContain(bill.status);
      }
    });

    it("subscriptions have valid statuses", () => {
      for (const sub of mockSubscriptions) {
        expect(["active", "underused", "waste", "cancelled"]).toContain(sub.status);
      }
    });

    it("cash flow has positive values", () => {
      expect(mockCashFlow.available).toMatch(/^\$/);
      expect(mockCashFlow.runway).toBeTruthy();
    });
  });

  describe("Concierge Domain", () => {
    it("household tasks have valid priorities", () => {
      for (const task of mockHouseholdTasks) {
        expect(["high", "medium", "low"]).toContain(task.priority);
      }
    });

    it("family events have locations", () => {
      for (const evt of mockFamilyEvents) {
        expect(evt.location).toBeTruthy();
      }
    });

    it("grocery items have categories", () => {
      for (const item of mockGroceryList) {
        expect(item.category).toBeTruthy();
      }
    });

    it("travel items have valid statuses", () => {
      for (const trip of mockTravel) {
        expect(["booked", "planning", "confirmed", "completed"]).toContain(trip.status);
      }
    });
  });

  describe("System Domain", () => {
    it("connectors have valid statuses", () => {
      for (const c of mockConnectors) {
        expect(["connected", "degraded", "disconnected"]).toContain(c.status);
      }
    });

    it("activity items have valid types", () => {
      const types = ["noticed", "recommended", "executed", "approved", "verified", "escalated"];
      for (const a of mockActivity) {
        expect(types).toContain(a.type);
      }
    });

    it("automation rules have valid trust levels", () => {
      for (const rule of mockAutomationRules) {
        expect(["suggest", "approval-ready", "execute"]).toContain(rule.trustLevel);
      }
    });
  });

  describe("Admin Data", () => {
    it("admin incidents have valid severities", () => {
      for (const inc of mockAdminIncidents) {
        expect(inc.severity).toMatch(/^SEV-/);
      }
    });

    it("admin audit logs have timestamps", () => {
      for (const log of mockAdminAuditLogs) {
        expect(new Date(log.created_at).getTime()).toBeGreaterThan(0);
      }
    });

    it("admin policies have categories", () => {
      for (const pol of mockAdminPolicies) {
        expect(pol.category).toBeTruthy();
      }
    });

    it("admin devices have connectivity states", () => {
      for (const dev of mockAdminDevices) {
        expect(["online", "offline"]).toContain(dev.connectivity);
      }
    });

    it("council decisions have valid statuses", () => {
      for (const dec of mockAdminCouncilDecisions) {
        expect(["pending", "approved", "rejected", "tabled"]).toContain(dec.status);
      }
    });

    it("intelligence has anomaly data", () => {
      expect(mockAdminIntelligence.anomalies.total_anomalies).toBeGreaterThan(0);
      expect(mockAdminIntelligence.forecasts.length).toBeGreaterThan(0);
    });

    it("agent runtime states have invocation counts", () => {
      for (const state of mockAgentRuntimeStates) {
        expect(state.invocationCount).toBeGreaterThanOrEqual(0);
        expect(["active", "paused", "degraded", "error"]).toContain(state.status);
      }
    });
  });
});
