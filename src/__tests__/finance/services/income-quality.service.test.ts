import { describe, it, expect } from "vitest";
import { computeIncomeQuality } from "@/lib/services/finance-os/income-quality.service";
import { makeIncomeQualityInput } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("computeIncomeQuality", () => {
  it("produces 6 dimensions and a composite score in [0, 100]", () => {
    const out = computeIncomeQuality(makeIncomeQualityInput());
    expect(out.dimensions).toHaveLength(6);
    expect(out.compositeScore).toBeGreaterThanOrEqual(0);
    expect(out.compositeScore).toBeLessThanOrEqual(100);
  });

  it("assigns grade A for an extremely strong income profile", () => {
    const out = computeIncomeQuality({
      recurringIncomePct: 95,
      topClientConcentrationPct: 5,
      seasonalVariationPct: 0,
      avgPaymentDelayDays: 0,
      oneTimeIncomePct: 0,
      householdDependencyOnUnstablePct: 0,
    });
    expect(out.grade).toBe("A");
  });

  it("assigns a low grade when concentration is dangerous and delays high", () => {
    const out = computeIncomeQuality({
      recurringIncomePct: 10,
      topClientConcentrationPct: 90,
      seasonalVariationPct: 60,
      avgPaymentDelayDays: 60,
      oneTimeIncomePct: 70,
      householdDependencyOnUnstablePct: 80,
    });
    expect(["D", "F"]).toContain(out.grade);
    expect(out.recommendation).toMatch(/Address/);
  });

  it("topRisk corresponds to the lowest-scoring dimension", () => {
    const out = computeIncomeQuality({
      recurringIncomePct: 90,
      topClientConcentrationPct: 90, // weakest
      seasonalVariationPct: 5,
      avgPaymentDelayDays: 1,
      oneTimeIncomePct: 5,
      householdDependencyOnUnstablePct: 5,
    });
    expect(out.topRisk).toMatch(/Concentration/i);
  });
});