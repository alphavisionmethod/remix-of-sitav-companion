import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  detectContinuityAlerts,
  generateShoppingList,
  computeMonthlyGroceryBudget,
} from "@/lib/services/concierge-os/grocery-continuity.service";
import { makeRecurringSupply, fixedNow, daysAgo, daysAhead } from "@/__tests__/concierge/_helpers/concierge-fixtures";

describe("grocery-continuity.service", () => {
  beforeAll(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(fixedNow())); });
  afterAll(() => vi.useRealTimers());

  it("emits no alerts when all supplies are within window", () => {
    expect(detectContinuityAlerts([
      makeRecurringSupply({ nextExpectedAt: daysAhead(5) }),
    ])).toHaveLength(0);
  });

  it("emits warning when overdue 8+ days", () => {
    const out = detectContinuityAlerts([
      makeRecurringSupply({ id: "s1", name: "Milk", nextExpectedAt: daysAgo(10) }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].alertType).toBe("overdue-purchase");
    expect(out[0].severity).toBe("warning");
  });

  it("emits urgent when overdue 15+ days", () => {
    const out = detectContinuityAlerts([
      makeRecurringSupply({ id: "s2", name: "Eggs", nextExpectedAt: daysAgo(20) }),
    ]);
    expect(out[0].severity).toBe("urgent");
  });

  it("generateShoppingList includes items due within 3 days", () => {
    const list = generateShoppingList([
      makeRecurringSupply({ id: "a", nextExpectedAt: daysAhead(2) }),
      makeRecurringSupply({ id: "b", nextExpectedAt: daysAhead(10) }),
    ]);
    expect(list.map((i) => i.id)).toEqual(["grocery-a"]);
    expect(list[0].isRecurring).toBe(true);
  });

  it("computeMonthlyGroceryBudget scales by 30/frequencyDays", () => {
    const budget = computeMonthlyGroceryBudget([
      makeRecurringSupply({ avgPriceCents: 1000, frequencyDays: 30 }),
      makeRecurringSupply({ avgPriceCents: 1500, frequencyDays: 15 }), // ~3000/mo
    ]);
    expect(budget).toBe(1000 + 3000);
  });
});