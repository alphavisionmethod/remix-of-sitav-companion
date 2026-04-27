import { describe, it, expect } from "vitest";
import { computeFinancialHealth } from "@/lib/services/finance-os/financial-health.service";

const baseInputs = {
  safeToSpendCents: 300_000,
  monthlyIncomeCents: 1_000_000,
  totalDebtCents: 100_000,
  debtToIncomeRatio: 5,
  creditUtilization: 10,
  billsCoveredPct: 100,
  reserveFundedPct: 80,
  savingsRatePct: 20,
  recurringBurdenPct: 30,
  taxReservedPct: 90,
  wasteSubscriptionCount: 0,
  overdueReceivablesCents: 0,
};

describe("computeFinancialHealth", () => {
  it("produces a healthy composite score for a strong profile", () => {
    const result = computeFinancialHealth(baseInputs);
    expect(result.dimensions.length).toBeGreaterThanOrEqual(8);
    expect(result.overallScore).toBeGreaterThan(70);
    expect(result.dimensions.find((d) => d.key === "debtPressure")?.score).toBeGreaterThanOrEqual(80);
  });

  it("penalises high debt-to-income aggressively", () => {
    const stressed = computeFinancialHealth({
      ...baseInputs,
      debtToIncomeRatio: 55,
    });
    const debtDim = stressed.dimensions.find((d) => d.key === "debtPressure")!;
    expect(debtDim.score).toBeLessThan(40);
  });

  it("keeps every dimension score within 0..100 bounds", () => {
    const result = computeFinancialHealth(baseInputs);
    for (const d of result.dimensions) {
      expect(d.score).toBeGreaterThanOrEqual(0);
      expect(d.score).toBeLessThanOrEqual(100);
    }
  });
});