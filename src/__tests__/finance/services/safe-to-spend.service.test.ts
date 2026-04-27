import { describe, it, expect } from "vitest";
import { computeSafeToSpendForecast } from "@/lib/services/finance-os/safe-to-spend.service";
import {
  makeAccount,
  makeObligation,
  makeReserve,
} from "@/__tests__/finance/_helpers/finance-fixtures";

describe("computeSafeToSpendForecast", () => {
  it("returns current/7d/30d windows with non-negative safe-to-spend", () => {
    const accounts = [
      makeAccount({ id: "a1", availableCents: 0, balanceCents: 0 }),
      makeAccount({ id: "a2", availableCents: 1_000_000, balanceCents: 1_000_000 }),
    ];
    const forecast = computeSafeToSpendForecast(accounts, [], []);
    expect(forecast.current.safeToSpendCents).toBeGreaterThanOrEqual(0);
    expect(forecast.sevenDay.safeToSpendCents).toBeGreaterThanOrEqual(0);
    expect(forecast.thirtyDay.safeToSpendCents).toBeGreaterThanOrEqual(0);
    expect(["improving", "stable", "tightening"]).toContain(forecast.trend);
  });

  it("warns when obligations exceed 80% of balance", () => {
    const accounts = [makeAccount({ availableCents: 100_000 })];
    const obligations = [
      makeObligation({
        amountCents: 90_000,
        nextDueDate: new Date().toISOString(),
        status: "due",
      }),
    ];
    const forecast = computeSafeToSpendForecast(accounts, obligations, []);
    expect(forecast.current.warnings.join(" ")).toMatch(/80%/);
  });

  it("recommends deferring spending when current safe-to-spend is very low", () => {
    const accounts = [makeAccount({ availableCents: 10_000 })];
    const reserves = [makeReserve({ monthlyContributionCents: 0 })];
    const forecast = computeSafeToSpendForecast(accounts, [], reserves);
    expect(forecast.recommendations.join(" ")).toMatch(/deferring/i);
  });
});