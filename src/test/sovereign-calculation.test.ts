import { describe, it, expect } from "vitest";
import {
  burnMultiple,
  runwayMonths,
  cagr,
  npv,
  irr,
  compoundInterest,
  debtServiceCoverageRatio,
  quickRatio,
} from "@/lib/services/sovereign-calculation/formulas/financial-formulas.service";
import {
  calculateVaR,
  calculateMaxDrawdown,
  calculateSharpeRatio,
  calculatePortfolioRisk,
} from "@/lib/services/sovereign-calculation/risk/risk-calculator.service";
import {
  runMonteCarloScenario,
  runMultipleScenarios,
} from "@/lib/services/sovereign-calculation/scenario/scenario-engine.service";
import {
  calculateReserveWaterfall,
} from "@/lib/services/sovereign-calculation/reserves/reserve-calculator.service";
import {
  calculateReceivablesAging,
} from "@/lib/services/sovereign-calculation/receivables/receivables-calculator.service";
import {
  classifyRegime,
} from "@/lib/services/sovereign-calculation/regime/regime-classifier.service";

describe("Sovereign Calculation — Financial Formulas", () => {
  it("calculates burn multiple correctly", () => {
    expect(burnMultiple(100000, 50000)).toBe(2);
    expect(burnMultiple(100000, 0)).toBe(Infinity);
    expect(burnMultiple(0, 50000)).toBe(0);
  });

  it("calculates runway months", () => {
    expect(runwayMonths(120000, 10000)).toBe(12);
    expect(runwayMonths(50000, 0)).toBe(Infinity);
    expect(runwayMonths(0, 10000)).toBe(0);
  });

  it("calculates CAGR", () => {
    const result = cagr(100, 200, 5);
    expect(result).toBeCloseTo(0.1487, 3); // ~14.87%
    expect(cagr(0, 200, 5)).toBe(0);
    expect(cagr(100, 200, 0)).toBe(0);
  });

  it("calculates NPV", () => {
    const cashflows = [-1000, 300, 400, 500, 200];
    const result = npv(0.1, cashflows);
    expect(result).toBeGreaterThan(0);
    // At 0% discount, NPV = sum of cashflows
    expect(npv(0, cashflows)).toBe(400);
  });

  it("calculates IRR converging to correct rate", () => {
    const cashflows = [-1000, 300, 400, 500, 200];
    const result = irr(cashflows);
    // IRR should make NPV ≈ 0
    const npvAtIrr = cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + result, i), 0);
    expect(Math.abs(npvAtIrr)).toBeLessThan(0.01);
  });

  it("calculates IRR for simple doubling", () => {
    const result = irr([-100, 0, 0, 200]);
    expect(result).toBeGreaterThan(0.2);
    expect(result).toBeLessThan(0.3);
  });

  it("calculates compound interest", () => {
    // $1000 at 10% for 1 year, compounded annually
    expect(compoundInterest(1000, 0.1, 1, 1)).toBeCloseTo(1100, 0);
    // Monthly compounding
    const monthly = compoundInterest(1000, 0.12, 1, 12);
    expect(monthly).toBeGreaterThan(1120);
  });

  it("calculates DSCR", () => {
    expect(debtServiceCoverageRatio(150000, 100000)).toBe(1.5);
    expect(debtServiceCoverageRatio(100000, 0)).toBe(Infinity);
  });

  it("calculates quick ratio", () => {
    expect(quickRatio(50000, 30000, 40000)).toBe(2);
    expect(quickRatio(50000, 30000, 0)).toBe(Infinity);
  });
});

describe("Sovereign Calculation — Risk", () => {
  const returns = Array.from({ length: 252 }, () => (Math.random() - 0.48) * 0.02);

  it("calculates VaR at 95% confidence", () => {
    const var95 = calculateVaR(returns, 0.95);
    expect(var95).toBeLessThan(0);
    // VaR99 should be more negative than VaR95
    const var99 = calculateVaR(returns, 0.99);
    expect(var99).toBeLessThanOrEqual(var95);
  });

  it("calculates max drawdown from values", () => {
    const values = [100, 110, 105, 120, 90, 95, 130];
    const dd = calculateMaxDrawdown(values);
    // Peak was 120, trough was 90 → drawdown = 30/120 = 0.25
    expect(dd).toBeCloseTo(0.25, 2);
  });

  it("returns 0 drawdown for monotonically increasing", () => {
    expect(calculateMaxDrawdown([1, 2, 3, 4, 5])).toBe(0);
  });

  it("calculates Sharpe ratio with annualization", () => {
    const posReturns = Array.from({ length: 252 }, () => 0.001); // ~25% annual
    const sharpe = calculateSharpeRatio(posReturns, 0.04);
    expect(sharpe).toBeGreaterThan(0);
  });

  it("calculates full portfolio risk metrics", () => {
    const metrics = calculatePortfolioRisk(returns);
    expect(metrics).toHaveProperty("valueAtRisk95");
    expect(metrics).toHaveProperty("maxDrawdown");
    expect(metrics).toHaveProperty("sharpeRatio");
    expect(metrics).toHaveProperty("sortinoRatio");
    expect(metrics).toHaveProperty("beta");
    expect(metrics.maxDrawdown).toBeGreaterThanOrEqual(0);
    expect(metrics.maxDrawdown).toBeLessThanOrEqual(1);
  });
});

describe("Sovereign Calculation — Monte Carlo", () => {
  it("runs a basic Monte Carlo scenario", () => {
    const result = runMonteCarloScenario({
      initialValueCents: 10000000,
      monthlyGrowthRate: 0.005,
      volatility: 0.03,
      months: 12,
      simulations: 500,
    });
    expect(result.scenarioId).toBeDefined();
    expect(result.projectedValueCents).toBeGreaterThan(0);
    expect(result.bestCaseCents).toBeGreaterThanOrEqual(result.medianCents);
    expect(result.worstCaseCents).toBeLessThanOrEqual(result.medianCents);
  });

  it("projects higher value with positive growth", () => {
    const growing = runMonteCarloScenario({
      initialValueCents: 1000000,
      monthlyGrowthRate: 0.02,
      volatility: 0.01,
      months: 12,
      simulations: 1000,
    });
    expect(growing.projectedValueCents).toBeGreaterThan(1000000);
  });

  it("runs multiple named scenarios", () => {
    const results = runMultipleScenarios(
      { initialValueCents: 1000000, months: 6 },
      [
        { name: "Base", growthRate: 0.005, volatility: 0.02 },
        { name: "Bear", growthRate: -0.01, volatility: 0.05 },
        { name: "Bull", growthRate: 0.02, volatility: 0.01 },
      ]
    );
    expect(results).toHaveLength(3);
    expect(results[0].name).toBe("Base");
    expect(results[1].name).toBe("Bear");
    expect(results[2].name).toBe("Bull");
  });
});

describe("Sovereign Calculation — Reserves", () => {
  it("allocates reserves by priority waterfall", () => {
    const result = calculateReserveWaterfall(50000, [
      { fundId: "f1", name: "Emergency", targetCents: 30000, priority: 1 },
      { fundId: "f2", name: "Tax", targetCents: 20000, priority: 2 },
      { fundId: "f3", name: "Opportunity", targetCents: 15000, priority: 3 },
    ]);
    expect(result.allocations[0].currentCents).toBe(30000); // Fully funded
    expect(result.allocations[1].currentCents).toBe(20000); // Fully funded
    expect(result.allocations[2].currentCents).toBe(0); // Nothing left
    expect(result.shortfallCents).toBe(15000);
  });

  it("handles more funds than available", () => {
    const result = calculateReserveWaterfall(10000, [
      { fundId: "f1", name: "A", targetCents: 30000, priority: 1 },
    ]);
    expect(result.allocations[0].currentCents).toBe(10000);
    expect(result.allocations[0].fundedPct).toBeCloseTo(33.33, 1);
  });
});

describe("Sovereign Calculation — Receivables", () => {
  it("buckets invoices by aging", () => {
    const result = calculateReceivablesAging([
      { amountCents: 10000, daysPastDue: 0 },
      { amountCents: 20000, daysPastDue: 15 },
      { amountCents: 30000, daysPastDue: 45 },
      { amountCents: 5000, daysPastDue: 100 },
    ]);
    expect(result.buckets).toHaveLength(5);
    expect(result.totalOutstandingCents).toBe(65000);
    expect(result.weightedCollectibleCents).toBeLessThan(result.totalOutstandingCents);
    expect(result.avgDaysOutstanding).toBe(40);
  });
});

describe("Sovereign Calculation — Regime", () => {
  it("classifies bull regime", () => {
    const result = classifyRegime({ sma50: 110, sma200: 100, currentPrice: 115, vix: 15, drawdownPct: 3 });
    expect(result.regime).toBe("bull");
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it("classifies crisis regime with high VIX", () => {
    const result = classifyRegime({ sma50: 90, sma200: 100, currentPrice: 85, vix: 40, drawdownPct: 25 });
    expect(result.regime).toBe("crisis");
  });

  it("classifies bear regime", () => {
    const result = classifyRegime({ sma50: 95, sma200: 100, currentPrice: 92, vix: 20, drawdownPct: 10 });
    expect(result.regime).toBe("bear");
  });

  it("returns transition probabilities summing to ~1", () => {
    const result = classifyRegime({ sma50: 100, sma200: 100, currentPrice: 100, vix: 18, drawdownPct: 5 });
    const sum = Object.values(result.transitionProbabilities).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 1);
  });
});
