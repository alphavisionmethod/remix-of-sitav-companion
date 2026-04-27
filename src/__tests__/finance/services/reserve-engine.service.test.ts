import { describe, it, expect } from "vitest";
import {
  computeSafeToSpend,
  assessReserveHealth,
} from "@/lib/services/finance-os/reserve-engine.service";
import {
  makeAccount,
  makeObligation,
  makeReserve,
  makeSinkingFund,
} from "@/__tests__/finance/_helpers/finance-fixtures";

describe("reserve-engine.service", () => {
  describe("computeSafeToSpend", () => {
    it("subtracts upcoming obligations and reserve allocation from balance", () => {
      const out = computeSafeToSpend(
        [makeAccount({ availableCentss: 500_000 } as never)],
        [makeObligation({ amountCents: 100_000, status: "upcoming" })],
        [makeReserve({ monthlyContributionCents: 50_000 })],
      );
      expect(out.balanceCents).toBe(500_000);
      expect(out.upcomingObligationsCents).toBe(100_000);
      expect(out.reserveAllocationCents).toBe(50_000);
      expect(out.safeToSpendCents).toBe(350_000);
    });

    it("only counts checking and savings balances", () => {
      const out = computeSafeToSpend(
        [
          makeAccount({ id: "a", type: "checking", availableCents: 100_000 }),
          makeAccount({ id: "b", type: "credit", availableCents: 999_999 }),
        ],
        [],
        [],
      );
      expect(out.balanceCents).toBe(100_000);
    });

    it("never returns a negative safe-to-spend", () => {
      const out = computeSafeToSpend(
        [makeAccount({ availableCents: 10_000 })],
        [makeObligation({ amountCents: 999_999, status: "due" })],
        [],
      );
      expect(out.safeToSpendCents).toBe(0);
    });

    it("warns when obligations exceed 80% of balance", () => {
      const out = computeSafeToSpend(
        [makeAccount({ availableCents: 100_000 })],
        [makeObligation({ amountCents: 90_000, status: "upcoming" })],
        [],
      );
      expect(out.warnings.some((w) => /80%/.test(w))).toBe(true);
    });
  });

  describe("assessReserveHealth", () => {
    it("classifies critical when funded percent is under 25", () => {
      const out = assessReserveHealth(
        [makeReserve({ targetCents: 1_000_000, currentCents: 100_000 })],
        [],
      );
      expect(out.percentFunded).toBe(10);
      expect(out.riskLevel).toBe("critical");
      expect(out.recommendations.some((r) => /Urgently/.test(r))).toBe(true);
    });

    it("classifies healthy when funded ≥ 75%", () => {
      const out = assessReserveHealth(
        [makeReserve({ targetCents: 1_000_000, currentCents: 800_000 })],
        [],
      );
      expect(out.percentFunded).toBe(80);
      expect(out.riskLevel).toBe("healthy");
    });

    it("flags off-track sinking funds in recommendations", () => {
      const out = assessReserveHealth(
        [makeReserve({ targetCents: 1_000_000, currentCents: 600_000 })],
        [makeSinkingFund({ onTrack: false })],
      );
      expect(out.recommendations.some((r) => /off track/.test(r))).toBe(true);
    });

    it("returns 100% funded when no targets exist", () => {
      const out = assessReserveHealth([], []);
      expect(out.percentFunded).toBe(100);
      expect(out.riskLevel).toBe("healthy");
    });
  });
});