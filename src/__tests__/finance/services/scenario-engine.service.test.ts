import { describe, it, expect } from "vitest";
import {
  runScenario,
  generatePresetScenarios,
} from "@/lib/services/finance-os/scenario-engine.service";
import { makeScenarioInput } from "@/__tests__/finance/_helpers/finance-fixtures";

const ctx = {
  monthlyIncomeCents: 800_000,
  monthlyExpensesCents: 600_000,
  safeToSpendCents: 200_000,
  reservesCents: 1_000_000,
  monthlyBurn: 600_000,
  subscriptionsCostCents: 5_000,
  debtPaymentsCents: 0,
};

describe("scenario-engine.service", () => {
  it("cut-subscription produces a positive monthly impact", () => {
    const out = runScenario(
      makeScenarioInput({ type: "cut-subscription", parameters: { monthlySavingsCents: 5_000 } }),
      ctx,
    );
    expect(out.netImpactMonthlyCents).toBe(5_000);
    expect(out.netImpactAnnualCents).toBe(60_000);
    expect(out.projectedSafeToSpend).toBeGreaterThan(out.baselineSafeToSpend);
  });

  it("hire reduces cashflow and may flag high risk", () => {
    const out = runScenario(
      makeScenarioInput({
        id: "sc-hire",
        name: "Hire engineer",
        type: "hire",
        parameters: { monthlySalaryCents: 1_500_000 },
      }),
      ctx,
    );
    expect(out.netImpactMonthlyCents).toBe(-1_500_000);
    expect(["moderate", "high"]).toContain(out.riskLevel);
  });

  it("revenue-change scales with percentage", () => {
    const out = runScenario(
      makeScenarioInput({
        id: "sc-rev",
        name: "10% revenue lift",
        type: "revenue-change",
        parameters: { changePercent: 10 },
      }),
      ctx,
    );
    expect(out.netImpactMonthlyCents).toBe(80_000);
  });

  it("emits 12 months of baseline and projected cashflow", () => {
    const out = runScenario(makeScenarioInput(), ctx);
    expect(out.baselineCashflow).toHaveLength(12);
    expect(out.projectedCashflow).toHaveLength(12);
  });

  it("generatePresetScenarios returns at least one preset", () => {
    const presets = generatePresetScenarios(ctx);
    expect(presets.length).toBeGreaterThan(0);
    expect(presets[0].id).toBeDefined();
  });
});