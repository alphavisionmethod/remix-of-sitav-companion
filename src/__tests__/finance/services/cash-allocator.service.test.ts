import { describe, it, expect } from "vitest";
import { computeCashAllocations } from "@/lib/services/finance-os/cash-allocator.service";
import { makeCashAllocatorInput } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("computeCashAllocations", () => {
  it("produces plans for all three strategies", () => {
    const plans = computeCashAllocations(makeCashAllocatorInput());
    expect(Object.keys(plans).sort()).toEqual([
      "aggressive",
      "balanced",
      "conservative",
    ]);
  });

  it("always allocates bills first when cash is sufficient", () => {
    const plans = computeCashAllocations(
      makeCashAllocatorInput({
        availableCashCents: 500_000,
        billsDueCents: 200_000,
      }),
    );
    for (const plan of Object.values(plans)) {
      const bills = plan.allocations.find((a) => a.bucket === "bills");
      expect(bills?.amountCents).toBe(200_000);
      // Bills must be the first allocation entry
      expect(plan.allocations[0].bucket).toBe("bills");
    }
  });

  it("never allocates more than available cash", () => {
    const input = makeCashAllocatorInput({
      availableCashCents: 300_000,
      billsDueCents: 250_000,
      taxOwedCents: 500_000,
      taxReservedCents: 0,
      emergencyTargetCents: 5_000_000,
      emergencyCurrentCents: 0,
    });
    const plans = computeCashAllocations(input);
    for (const plan of Object.values(plans)) {
      const total = plan.allocations.reduce((s, a) => s + a.amountCents, 0);
      expect(total).toBeLessThanOrEqual(input.availableCashCents);
    }
  });

  it("returns no allocations when no cash is available", () => {
    const plans = computeCashAllocations(
      makeCashAllocatorInput({ availableCashCents: 0 }),
    );
    for (const plan of Object.values(plans)) {
      const total = plan.allocations.reduce((s, a) => s + a.amountCents, 0);
      expect(total).toBe(0);
    }
  });
});