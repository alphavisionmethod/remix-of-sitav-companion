import { describe, it, expect } from "vitest";
import { buildPortfolioRiskReport } from "@/lib/services/finance-os/portfolio-risk.service";

describe("buildPortfolioRiskReport", () => {
  it("returns a structurally complete risk report", () => {
    const report = buildPortfolioRiskReport();
    expect(report.riskBudget.totalRiskBudget).toBe(100);
    expect(report.riskBudget.usedRiskBudget + report.riskBudget.remainingRiskBudget).toBe(100);
    expect(report.factorRisk.factors.length).toBeGreaterThan(0);
    expect(report.stressScenarios.length).toBeGreaterThan(0);
    expect(["low", "moderate", "high"]).toContain(report.overallRiskLevel);
  });

  it("only reports negative impact percentages for downside stress scenarios", () => {
    const report = buildPortfolioRiskReport();
    for (const scenario of report.stressScenarios) {
      expect(scenario.impactPct).toBeLessThan(0);
      expect(["mild", "moderate", "severe"]).toContain(scenario.severity);
    }
  });

  it("identifies the dominant factor by largest contribution", () => {
    const report = buildPortfolioRiskReport();
    const top = [...report.factorRisk.factors].sort(
      (a, b) => b.contribution - a.contribution,
    )[0];
    expect(report.factorRisk.dominantFactor).toBe(top.name);
  });
});