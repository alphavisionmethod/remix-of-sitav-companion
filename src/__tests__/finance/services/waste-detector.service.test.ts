import { describe, it, expect } from "vitest";
import { buildWasteReport } from "@/lib/services/finance-os/waste-detector.service";
import { makeSubscription } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("buildWasteReport", () => {
  it("aggregates only active waste subscriptions", () => {
    const out = buildWasteReport([
      makeSubscription({ id: "a", isWaste: true, status: "active", savingsIfCancelled: 24_000 }),
      makeSubscription({ id: "b", isWaste: true, status: "cancelled", savingsIfCancelled: 99_999 }),
      makeSubscription({ id: "c", isWaste: false, status: "active", savingsIfCancelled: 99_999 }),
    ]);
    expect(out.actionableCount).toBe(1);
    expect(out.totalWasteAnnualCents).toBe(24_000);
    expect(out.totalWasteMonthCents).toBe(2_000);
  });

  it("normalises annual subscriptions to a monthly cost", () => {
    const out = buildWasteReport([
      makeSubscription({
        id: "a",
        isWaste: true,
        status: "active",
        frequency: "annually",
        amountCents: 12_000, // → 1000/mo
        savingsIfCancelled: 12_000,
      }),
    ]);
    expect(out.opportunities[0].monthlyCostCents).toBe(1_000);
  });

  it("returns an empty report when nothing is waste", () => {
    const out = buildWasteReport([makeSubscription({ isWaste: false, status: "active" })]);
    expect(out.actionableCount).toBe(0);
    expect(out.totalWasteAnnualCents).toBe(0);
    expect(out.topCategory).toBe("none");
  });

  it("picks the most-frequent waste category as topCategory", () => {
    const out = buildWasteReport([
      makeSubscription({ id: "a", isWaste: true, status: "active", category: "entertainment" }),
      makeSubscription({ id: "b", isWaste: true, status: "active", category: "entertainment" }),
      makeSubscription({ id: "c", isWaste: true, status: "active", category: "tools" }),
    ]);
    expect(out.topCategory).toBe("entertainment");
  });
});