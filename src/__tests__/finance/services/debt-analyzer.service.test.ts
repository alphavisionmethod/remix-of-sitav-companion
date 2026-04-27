import { describe, it, expect } from "vitest";
import { computeDebtProfile } from "@/lib/services/finance-os/debt-analyzer.service";
import { makeDebtAccount } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("computeDebtProfile", () => {
  it("aggregates totals, weighted rate, utilization, and DTI", () => {
    const out = computeDebtProfile(
      [
        makeDebtAccount({ id: "a", balanceCents: 500_000, limitCents: 1_000_000, interestRate: 20, minimumPaymentCents: 25_000 }),
        makeDebtAccount({ id: "b", balanceCents: 500_000, limitCents: 1_000_000, interestRate: 10, minimumPaymentCents: 25_000 }),
      ],
      500_000, // monthly income
    );
    expect(out.totalDebtCents).toBe(1_000_000);
    expect(out.totalMinimumPaymentCents).toBe(50_000);
    expect(out.weightedAvgInterestRate).toBe(15);
    expect(out.utilizationPercent).toBe(50);
    expect(out.debtToIncomeRatio).toBe(10);
  });

  it("picks a payoff plan that produces non-negative interest savings", () => {
    const out = computeDebtProfile(
      [makeDebtAccount({ balanceCents: 200_000, interestRate: 18, minimumPaymentCents: 10_000 })],
      500_000,
    );
    expect(["avalanche", "snowball"]).toContain(out.payoffPlan.strategy);
    expect(out.payoffPlan.totalInterestSavedCents).toBeGreaterThanOrEqual(0);
    expect(out.payoffPlan.projectedMonths).toBeGreaterThan(0);
  });

  it("handles an empty account list without dividing by zero", () => {
    const out = computeDebtProfile([], 500_000);
    expect(out.totalDebtCents).toBe(0);
    expect(out.weightedAvgInterestRate).toBe(0);
    expect(out.utilizationPercent).toBe(0);
  });

  it("emits a credit score pulse with a numeric estimated score", () => {
    const out = computeDebtProfile(
      [makeDebtAccount({ balanceCents: 200_000 })],
      500_000,
    );
    expect(typeof out.creditScorePulse.estimatedScore).toBe("number");
    expect(out.creditScorePulse.factors.length).toBeGreaterThan(0);
  });
});