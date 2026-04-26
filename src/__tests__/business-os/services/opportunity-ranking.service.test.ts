import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rankOpportunitiesWeighted } from "@/lib/services/business-os/opportunity-ranking.service";
import { makeOpportunity, fixedNow, daysAhead } from "../_helpers/business-fixtures";

describe("opportunity-ranking.service", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(fixedNow())); });
  afterEach(() => vi.useRealTimers());

  it("ranks higher-value, higher-probability opps above lower ones", () => {
    const a = makeOpportunity({ id: "a", valueCents: 100_000, probability: 0.2, expectedCloseDate: daysAhead(60) });
    const b = makeOpportunity({ id: "b", valueCents: 1_000_000, probability: 0.9, expectedCloseDate: daysAhead(5) });
    const ranked = rankOpportunitiesWeighted([a, b]);
    expect(ranked[0].opportunity.id).toBe("b");
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(2);
  });

  it("composite score equals sum of weighted breakdown factors (rounded)", () => {
    const opp = makeOpportunity({ valueCents: 500_000, probability: 0.5, expectedCloseDate: daysAhead(10) });
    const [r] = rankOpportunitiesWeighted([opp]);
    const sum = Math.round(r.breakdown.reduce((s, b) => s + b.weighted, 0));
    expect(r.compositeScore).toBe(sum);
  });

  it("includes Value, Probability, Urgency, Account Health factors", () => {
    const [r] = rankOpportunitiesWeighted([makeOpportunity()]);
    expect(r.breakdown.map((b) => b.factor)).toEqual(["Value", "Probability", "Urgency", "Account Health"]);
  });
});