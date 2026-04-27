import { describe, it, expect } from "vitest";
import { buildRenewalRiskReport } from "@/lib/services/finance-os/renewal-risk.service";
import { makeSubscription } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("buildRenewalRiskReport", () => {
  it("flags waste subscriptions as auto-renew-waste with cancel action", () => {
    const out = buildRenewalRiskReport([
      makeSubscription({ id: "a", isWaste: true, savingsIfCancelled: 24_000 }),
    ]);
    expect(out.risks[0].riskLevel).toBe("auto-renew-waste");
    expect(out.risks[0].recommendedAction).toBe("cancel");
    expect(out.totalPotentialSavingsCents).toBe(24_000);
    expect(out.highRiskCount).toBe(1);
  });

  it("ignores cancelled subscriptions", () => {
    const out = buildRenewalRiskReport([
      makeSubscription({ id: "a", status: "cancelled", isWaste: true, savingsIfCancelled: 99_999 }),
    ]);
    expect(out.risks).toHaveLength(0);
    expect(out.totalPotentialSavingsCents).toBe(0);
  });

  it("annualises monthly cost into annual cost", () => {
    const out = buildRenewalRiskReport([
      makeSubscription({ amountCents: 1000, frequency: "monthly" }),
    ]);
    expect(out.risks[0].annualCostCents).toBe(12_000);
  });
});