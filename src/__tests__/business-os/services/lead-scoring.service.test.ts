import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  scoreLead,
  detectStaleLead,
  buildCallbackQueue,
} from "@/lib/services/business-os/lead-scoring.service";
import { makeLead, fixedNow, daysAgo } from "../_helpers/business-fixtures";

describe("lead-scoring.service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedNow()));
  });
  afterEach(() => vi.useRealTimers());

  describe("scoreLead", () => {
    it("qualified + recent contact yields a high composite score", () => {
      const r = scoreLead(makeLead({ status: "qualified", lastContact: daysAgo(1) }));
      expect(r.compositeScore).toBeGreaterThan(70);
      expect(r.breakdown.engagement).toBe(90);
      expect(r.lead.score).toBe(r.compositeScore);
    });

    it("nurturing status maps to engagement=60", () => {
      const r = scoreLead(makeLead({ status: "nurturing" }));
      expect(r.breakdown.engagement).toBe(60);
    });

    it("other statuses map to engagement=30", () => {
      const r = scoreLead(makeLead({ status: "new" }));
      expect(r.breakdown.engagement).toBe(30);
    });

    it("stale lead with no recent contact lowers recency", () => {
      const r = scoreLead(makeLead({ lastContact: daysAgo(30) }));
      // recency = max(0, 100 - 30*2) = 40
      expect(r.breakdown.recency).toBe(40);
    });

    it("missing lastContact falls back to 20 recency", () => {
      const r = scoreLead(makeLead({ lastContact: "" }));
      expect(r.breakdown.recency).toBe(20);
    });

    it("composite uses 0.4/0.35/0.25 weights", () => {
      const r = scoreLead(makeLead({ status: "qualified", lastContact: daysAgo(0) }));
      const expected = Math.round(90 * 0.4 + 100 * 0.35 + 50 * 0.25);
      expect(r.compositeScore).toBe(expected);
    });
  });

  describe("detectStaleLead", () => {
    it("returns null for fresh lead (<14d)", () => {
      expect(detectStaleLead(makeLead({ lastContact: daysAgo(5) }))).toBeNull();
    });
    it("recommends re-engage at 14–30d", () => {
      expect(detectStaleLead(makeLead({ lastContact: daysAgo(20) }))?.recommendedAction).toBe("re-engage");
    });
    it("recommends escalate at 31–60d", () => {
      expect(detectStaleLead(makeLead({ lastContact: daysAgo(45) }))?.recommendedAction).toBe("escalate");
    });
    it("recommends reassign at 61–90d", () => {
      expect(detectStaleLead(makeLead({ lastContact: daysAgo(75) }))?.recommendedAction).toBe("reassign");
    });
    it("recommends archive at >90d", () => {
      expect(detectStaleLead(makeLead({ lastContact: daysAgo(120) }))?.recommendedAction).toBe("archive");
    });
    it("reengagementScore decays with staleness and clamps at 0", () => {
      expect(detectStaleLead(makeLead({ lastContact: daysAgo(200) }))?.reengagementScore).toBe(0);
    });
  });

  describe("buildCallbackQueue", () => {
    it("filters to qualified/nurturing only and returns at most 20", () => {
      const leads = Array.from({ length: 30 }, (_, i) =>
        makeLead({
          id: `l-${i}`,
          status: i % 3 === 0 ? "qualified" : i % 3 === 1 ? "nurturing" : "lost",
          score: i,
        }),
      );
      const q = buildCallbackQueue(leads);
      expect(q.length).toBeLessThanOrEqual(20);
      expect(q.every((l) => l.status === "qualified" || l.status === "nurturing")).toBe(true);
    });

    it("orders by score descending", () => {
      const leads = [10, 80, 50, 30].map((s, i) =>
        makeLead({ id: `l-${i}`, status: "qualified", score: s }),
      );
      const q = buildCallbackQueue(leads);
      expect(q.map((l) => l.score)).toEqual([80, 50, 30, 10]);
    });
  });
});