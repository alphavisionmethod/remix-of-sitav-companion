import { describe, it, expect } from "vitest";
import { createDefaultEnvelopes } from "@/lib/services/finance-os/envelope-budget.service";

describe("envelope-budget service", () => {
  it("creates four canonical envelope groups for a non-zero income", () => {
    const budget = createDefaultEnvelopes(1_000_000);
    expect(budget.groups.map((g) => g.id).sort()).toEqual([
      "debt",
      "essentials",
      "lifestyle",
      "savings-goals",
    ]);
  });

  it("never allocates more than total income across all envelopes", () => {
    const budget = createDefaultEnvelopes(1_000_000);
    expect(budget.totalAllocatedCents).toBeLessThanOrEqual(budget.totalIncomeCents);
    expect(budget.unallocatedCents).toBe(
      budget.totalIncomeCents - budget.totalAllocatedCents,
    );
  });

  it("scales allocations linearly with income", () => {
    const a = createDefaultEnvelopes(1_000_000);
    const b = createDefaultEnvelopes(2_000_000);
    // Each envelope in `b` should be ~2× its counterpart in `a`
    const aRent = a.groups[0].envelopes.find((e) => e.id === "rent")!;
    const bRent = b.groups[0].envelopes.find((e) => e.id === "rent")!;
    expect(bRent.allocatedCents).toBe(aRent.allocatedCents * 2);
  });

  it("starts every envelope on-track with zero rollover", () => {
    const budget = createDefaultEnvelopes(500_000);
    expect(budget.paceStatus).toBe("on-track");
    expect(budget.rolloverFromPriorCents).toBe(0);
  });
});