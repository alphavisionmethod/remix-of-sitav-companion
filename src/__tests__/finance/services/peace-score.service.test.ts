import { describe, it, expect } from "vitest";
import { computePeaceScore } from "@/lib/services/finance-os/peace-score.service";
import { makePeaceScoreInput } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("computePeaceScore", () => {
  it("returns a strong-status report for a calm household", () => {
    const result = computePeaceScore(makePeaceScoreInput());
    expect(result.dimensions.length).toBeGreaterThan(3);
    expect(["strong", "adequate"]).toContain(result.dimensions[0].status);
  });

  it("flags reserves as critical when reserve funding is near zero", () => {
    const result = computePeaceScore(
      makePeaceScoreInput({ reserveFundedPct: 5 }),
    );
    const reserves = result.dimensions.find((d) => d.key === "reserves")!;
    expect(reserves.status).toBe("critical");
  });

  it("flags debt as concerning when DTI is high", () => {
    const result = computePeaceScore(
      makePeaceScoreInput({ debtToIncomeRatio: 0.5 }),
    );
    const debt = result.dimensions.find((d) => d.key === "debt")!;
    expect(debt.insight).toMatch(/concerning/i);
  });
});