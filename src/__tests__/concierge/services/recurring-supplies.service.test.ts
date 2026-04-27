import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  detectResupplyNeeded,
  estimateMonthlySupplyCost,
} from "@/lib/services/concierge-os/recurring-supplies.service";
import { makeRecurringSupply, fixedNow, daysAhead } from "@/__tests__/concierge/_helpers/concierge-fixtures";

describe("recurring-supplies.service", () => {
  beforeAll(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(fixedNow())); });
  afterAll(() => vi.useRealTimers());

  it("detectResupplyNeeded returns items due within 3 days", () => {
    const out = detectResupplyNeeded([
      makeRecurringSupply({ id: "soon", nextExpectedAt: daysAhead(1) }),
      makeRecurringSupply({ id: "later", nextExpectedAt: daysAhead(30) }),
    ]);
    expect(out.map((s) => s.id)).toEqual(["soon"]);
  });

  it("estimateMonthlySupplyCost rounds and aggregates", () => {
    const cost = estimateMonthlySupplyCost([
      makeRecurringSupply({ avgPriceCents: 999, frequencyDays: 30 }),
      makeRecurringSupply({ avgPriceCents: 500, frequencyDays: 10 }),
    ]);
    // 999*1 + 500*3 = 999 + 1500 = 2499
    expect(cost).toBe(2499);
  });
});