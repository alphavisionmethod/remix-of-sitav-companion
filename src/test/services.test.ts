import { describe, it, expect } from "vitest";
import { scoreLead, detectStaleLead, buildCallbackQueue } from "@/lib/services/business-os/lead-scoring.service";
import { computeCustomerHealth } from "@/lib/services/business-os/customer-dashboard.service";
import { detectWaste, computeTotalWaste } from "@/lib/services/finance-os/subscription-waste.service";
import { computeHouseholdKpis } from "@/lib/services/concierge-os/household-ops.service";

describe("Business OS — Lead Scoring", () => {
  it("scores a lead", () => {
    const result = scoreLead({ id: "L1", name: "Test", status: "qualified", score: 80, lastContact: new Date().toISOString() } as never);
    expect(result.compositeScore).toBeGreaterThan(0);
  });
});

describe("Finance OS — Subscription Waste", () => {
  it("returns array from detectWaste", () => {
    const waste = detectWaste([
      { id: "S1", name: "Active", amount: 10, usageScore: 90, status: "active", frequency: "monthly", lastUsedAt: new Date().toISOString() } as never,
    ]);
    expect(Array.isArray(waste)).toBe(true);
  });

  it("computes total waste", () => {
    const waste = detectWaste([
      { id: "S1", name: "Waste", amount: 55, usageScore: 5, status: "active", frequency: "monthly" } as never,
    ]);
    const total = computeTotalWaste(waste);
    expect(total).toBeGreaterThanOrEqual(0);
  });
});
