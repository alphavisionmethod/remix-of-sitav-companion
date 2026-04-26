import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { scoreOpportunity, rankOpportunities } from "@/lib/services/business-os/opportunity-engine.service";
import { makeOpportunity, fixedNow, daysAhead } from "../_helpers/business-fixtures";

describe("opportunity-engine.service", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(fixedNow())); });
  afterEach(() => vi.useRealTimers());

  describe("scoreOpportunity", () => {
    it("'closing' stage scores higher than 'discovery' for same other inputs", () => {
      const a = scoreOpportunity(makeOpportunity({ stage: "discovery" }));
      const b = scoreOpportunity(makeOpportunity({ stage: "closing" }));
      expect(b.score).toBeGreaterThan(a.score);
    });

    it("returns three weighted factors that sum to the score (rounded)", () => {
      const r = scoreOpportunity(makeOpportunity());
      expect(r.factors.map(f => f.name)).toEqual(["Stage", "Deal Value", "Time Pressure"]);
      const sum = Math.round(r.factors.reduce((s, f) => s + f.score * f.weight, 0));
      expect(r.score).toBe(sum);
    });

    it("'won' stage produces top recommendation tier", () => {
      const r = scoreOpportunity(makeOpportunity({ stage: "won" }));
      expect(r.recommendation).toMatch(/Focus|Nurture|Monitor/);
    });

    it("'lost' stage scores 0 for the stage component", () => {
      const r = scoreOpportunity(makeOpportunity({ stage: "lost" }));
      expect(r.factors.find(f => f.name === "Stage")!.score).toBe(0);
    });
  });

  describe("rankOpportunities", () => {
    it("sorts by score descending", () => {
      const low = makeOpportunity({ id: "low", stage: "discovery", valueCents: 10_000, expectedCloseDate: daysAhead(180) });
      const high = makeOpportunity({ id: "high", stage: "closing", valueCents: 1_000_000, expectedCloseDate: daysAhead(2) });
      const ranked = rankOpportunities([low, high]);
      expect(ranked[0].id).toBe("high");
      expect(ranked[1].id).toBe("low");
    });
  });
});
