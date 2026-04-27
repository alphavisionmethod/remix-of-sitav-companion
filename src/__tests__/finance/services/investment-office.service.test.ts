import { describe, it, expect } from "vitest";
import {
  assessMarketRegime,
  computePortfolioExposure,
  computeRiskBudgetService,
} from "@/lib/services/finance-os/investment-office.service";

describe("investment-office service", () => {
  it("assesses a market regime with a confidence and posture", () => {
    const regime = assessMarketRegime();
    expect(["risk-on", "risk-off", "transition"]).toContain(regime.currentRegime);
    expect(regime.confidence).toBeGreaterThanOrEqual(0);
    expect(regime.confidence).toBeLessThanOrEqual(100);
    expect(regime.signals.length).toBeGreaterThan(0);
  });

  it("portfolio exposure totals add up to ~100% per breakdown", () => {
    const exp = computePortfolioExposure();
    const sum = (xs: { percent: number }[]) =>
      xs.reduce((s, x) => s + x.percent, 0);
    expect(sum(exp.byAssetClass)).toBe(100);
    expect(sum(exp.byGeography)).toBe(100);
    // Sector breakdown is partial (top sectors only) — must not exceed 100
    expect(sum(exp.bySector)).toBeLessThanOrEqual(100);
  });

  it("risk budget used + remaining equals the total budget", () => {
    const budget = computeRiskBudgetService();
    expect(budget.usedRiskBudget + budget.remainingRiskBudget).toBe(
      budget.totalRiskBudget,
    );
    expect(budget.recommendations.length).toBeGreaterThan(0);
  });
});