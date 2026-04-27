import { describe, it, expect } from "vitest";
import {
  computeLiquidity,
  runLiquidityStressTest,
} from "@/lib/services/finance-os/liquidity.service";
import { makeAccount } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("liquidity service", () => {
  it("classifies a liquid portfolio as passing the stress test", () => {
    const result = computeLiquidity([
      makeAccount({ id: "c", type: "checking", availableCents: 5_000_000, balanceCents: 5_000_000 }),
      makeAccount({ id: "s", type: "savings", availableCents: 5_000_000, balanceCents: 5_000_000 }),
    ]);
    expect(result.stressTestResult).toBe("pass");
    expect(result.liquidityRatio).toBe(1);
    expect(result.lockedCents).toBe(0);
  });

  it("classifies illiquid portfolios as fail and recommends increasing liquidity", () => {
    const result = computeLiquidity([
      makeAccount({ id: "c", type: "checking", availableCents: 100_000, balanceCents: 100_000 }),
      makeAccount({ id: "r", type: "retirement", availableCents: 0, balanceCents: 90_000_000 }),
    ]);
    expect(result.stressTestResult).toBe("fail");
    expect(result.recommendations.join(" ")).toMatch(/Liquidity critically low/);
  });

  it("stress test reduces investment availability by the shock percent", () => {
    const accounts = [
      makeAccount({ id: "c", type: "checking", availableCents: 1_000_000, balanceCents: 1_000_000 }),
      makeAccount({ id: "i", type: "investment", availableCents: 1_000_000, balanceCents: 1_000_000 }),
    ];
    const baseline = computeLiquidity(accounts);
    const stressed = runLiquidityStressTest(accounts, 50);
    expect(stressed.totalCents).toBeLessThan(baseline.totalCents);
  });
});