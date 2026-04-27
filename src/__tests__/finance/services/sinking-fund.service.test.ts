import { describe, it, expect } from "vitest";
import {
  createSinkingFund,
  assessFundProgress,
  recommendContributionAdjustment,
} from "@/lib/services/finance-os/sinking-fund.service";
import { makeSinkingFund, daysAhead } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("sinking-fund.service", () => {
  it("createSinkingFund spreads target across remaining months", () => {
    const fund = createSinkingFund(
      "Vacation",
      1_200_000,
      daysAhead(180),
      "vacation",
      "Spring trip",
    );
    // 6 months remaining → 200k/month (rounded up)
    expect(fund.monthlyContributionCents).toBeGreaterThanOrEqual(200_000);
    expect(fund.monthlyContributionCents).toBeLessThanOrEqual(220_000);
    expect(fund.targetCents).toBe(1_200_000);
    expect(fund.currentCents).toBe(0);
    expect(fund.onTrack).toBe(true);
  });

  it("assessFundProgress flags shortfall when contributions cannot reach target", () => {
    const fund = makeSinkingFund({
      targetCents: 1_000_000,
      currentCents: 100_000,
      monthlyContributionCents: 50_000,
      targetDate: daysAhead(90), // ~3 months → projected = 100k + 150k = 250k
    });
    const assessed = assessFundProgress(fund);
    expect(assessed.onTrack).toBe(false);
    expect(assessed.projectedShortfallCents).toBeGreaterThan(0);
  });

  it("assessFundProgress reports onTrack when projected meets target", () => {
    const fund = makeSinkingFund({
      targetCents: 600_000,
      currentCents: 600_000,
      monthlyContributionCents: 0,
    });
    const assessed = assessFundProgress(fund);
    expect(assessed.onTrack).toBe(true);
    expect(assessed.projectedShortfallCents).toBe(0);
  });

  it("recommendContributionAdjustment returns null when contribution is sufficient", () => {
    const fund = makeSinkingFund({
      targetCents: 600_000,
      currentCents: 500_000,
      monthlyContributionCents: 100_000,
      targetDate: daysAhead(60),
    });
    expect(recommendContributionAdjustment(fund)).toBeNull();
  });

  it("recommendContributionAdjustment suggests an increase when underfunded", () => {
    const fund = makeSinkingFund({
      targetCents: 1_000_000,
      currentCents: 100_000,
      monthlyContributionCents: 50_000,
      targetDate: daysAhead(90),
    });
    const rec = recommendContributionAdjustment(fund);
    expect(rec).not.toBeNull();
    expect(rec!.adjustedContributionCents).toBeGreaterThan(50_000);
    expect(rec!.reason).toMatch(/Increase/);
  });
});