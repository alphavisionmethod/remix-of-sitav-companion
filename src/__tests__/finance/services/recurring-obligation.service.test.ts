import { describe, it, expect } from "vitest";
import { summarizeRecurringObligations } from "@/lib/services/finance-os/recurring-obligation.service";
import { makeObligation } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("summarizeRecurringObligations", () => {
  it("excludes one-time obligations from the recurring summary", () => {
    const summary = summarizeRecurringObligations([
      makeObligation({ id: "rent", frequency: "monthly", amountCents: 200_000 }),
      makeObligation({ id: "fee", frequency: "one-time", amountCents: 99_999 }),
    ]);
    expect(summary.obligationCount).toBe(1);
    expect(summary.totalMonthlyCommitmentCents).toBe(200_000);
    expect(summary.totalAnnualCommitmentCents).toBe(2_400_000);
  });

  it("normalises annual obligations into monthly cents", () => {
    const summary = summarizeRecurringObligations([
      makeObligation({ id: "ins", frequency: "annually", amountCents: 1_200_000 }),
    ]);
    // 1,200,000 / 12 = 100,000 monthly
    expect(summary.totalMonthlyCommitmentCents).toBe(100_000);
  });

  it("splits autopay vs manual counts correctly", () => {
    const summary = summarizeRecurringObligations([
      makeObligation({ id: "a", frequency: "monthly", autoPay: true }),
      makeObligation({ id: "b", frequency: "monthly", autoPay: true }),
      makeObligation({ id: "c", frequency: "monthly", autoPay: false }),
    ]);
    expect(summary.autoPayCount).toBe(2);
    expect(summary.manualPayCount).toBe(1);
  });

  it("sorts byCategory descending by monthly commitment", () => {
    const summary = summarizeRecurringObligations([
      makeObligation({ id: "a", category: "Housing", amountCents: 200_000, frequency: "monthly" }),
      makeObligation({ id: "b", category: "Streaming", amountCents: 1_500, frequency: "monthly" }),
      makeObligation({ id: "c", category: "Insurance", amountCents: 50_000, frequency: "monthly" }),
    ]);
    const cats = summary.byCategory.map((c) => c.category);
    expect(cats).toEqual(["Housing", "Insurance", "Streaming"]);
  });
});