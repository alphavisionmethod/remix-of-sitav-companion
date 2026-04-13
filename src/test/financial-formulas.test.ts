import { describe, it, expect } from "vitest";
import {
  dcfNPV,
  blackScholes,
  kellyCriterion,
  capmExpectedReturn,
  sharpeRatio,
  compoundInterest,
  historicalVaR,
  expectedShortfall,
  sortinoRatio,
  maxDrawdown,
} from "@/lib/simulation/financial-formulas";

describe("Financial Formula Library", () => {
  describe("DCF / NPV", () => {
    it("calculates NPV for known cash flows", () => {
      // $100/yr for 3 years @ 10% discount = ~248.69 + terminal
      const npv = dcfNPV([100, 100, 100], 0.10, 0.02);
      expect(npv).toBeGreaterThan(200);
      expect(npv).toBeLessThan(2000);
    });

    it("returns Infinity when discount <= growth", () => {
      expect(dcfNPV([100], 0.02, 0.02)).toBe(Infinity);
    });
  });

  describe("Black-Scholes", () => {
    it("prices a call option correctly", () => {
      // S=100, K=100, T=1, r=5%, sigma=20% → ~10.45
      const price = blackScholes(100, 100, 1, 0.05, 0.2, "call");
      expect(price).toBeGreaterThan(9);
      expect(price).toBeLessThan(12);
    });

    it("prices a put option via put-call parity", () => {
      const call = blackScholes(100, 100, 1, 0.05, 0.2, "call");
      const put = blackScholes(100, 100, 1, 0.05, 0.2, "put");
      // Put-Call parity: C - P = S - K*exp(-rT)
      const parity = call - put;
      const expected = 100 - 100 * Math.exp(-0.05);
      expect(Math.abs(parity - expected)).toBeLessThan(0.01);
    });

    it("returns intrinsic value at expiry", () => {
      expect(blackScholes(110, 100, 0, 0.05, 0.2, "call")).toBeCloseTo(10, 5);
      expect(blackScholes(90, 100, 0, 0.05, 0.2, "put")).toBeCloseTo(10, 5);
    });
  });

  describe("Kelly Criterion", () => {
    it("calculates optimal fraction for fair coin", () => {
      // 60% win, 1:1 ratio → f* = 0.6 - 0.4/1 = 0.2
      expect(kellyCriterion(0.6, 1)).toBeCloseTo(0.2, 5);
    });

    it("returns 0 for negative edge", () => {
      expect(kellyCriterion(0.3, 1)).toBe(0);
    });
  });

  describe("CAPM", () => {
    it("calculates expected return", () => {
      // Rf=3%, β=1.2, Rm=10% → 3 + 1.2*(10-3) = 11.4%
      expect(capmExpectedReturn(0.03, 1.2, 0.10)).toBeCloseTo(0.114, 5);
    });
  });

  describe("Sharpe Ratio", () => {
    it("calculates correctly", () => {
      // 12% return, 3% risk-free, 15% std → (0.12-0.03)/0.15 = 0.6
      expect(sharpeRatio(0.12, 0.03, 0.15)).toBeCloseTo(0.6, 5);
    });

    it("returns 0 for zero volatility", () => {
      expect(sharpeRatio(0.12, 0.03, 0)).toBe(0);
    });
  });

  describe("Compound Interest", () => {
    it("matches known FV calculation", () => {
      // $1000 @ 5% for 10 years, monthly compounding
      const fv = compoundInterest(1000, 0.05, 10, 12);
      expect(fv).toBeGreaterThan(1647);
      expect(fv).toBeLessThan(1650);
    });
  });

  describe("VaR & CVaR", () => {
    const sorted = Array.from({ length: 1000 }, (_, i) => i - 500); // -500 to 499

    it("calculates historical VaR at 95%", () => {
      const var95 = historicalVaR(sorted, 0.95);
      expect(var95).toBeLessThan(-400);
    });

    it("calculates expected shortfall", () => {
      const cvar = expectedShortfall(sorted, 0.95);
      expect(cvar).toBeLessThan(historicalVaR(sorted, 0.95));
    });
  });

  describe("Sortino Ratio", () => {
    it("returns positive for upward-biased returns", () => {
      const returns = [0.05, 0.08, -0.02, 0.12, 0.03, -0.01, 0.07];
      const ratio = sortinoRatio(returns, 0.02);
      expect(ratio).toBeGreaterThan(0);
    });
  });

  describe("Max Drawdown", () => {
    it("finds correct drawdown", () => {
      const values = [100, 110, 105, 95, 80, 90, 85, 100];
      // Peak 110, trough 80 → DD = 30/110 ≈ 0.2727
      expect(maxDrawdown(values)).toBeCloseTo(30 / 110, 2);
    });
  });
});
