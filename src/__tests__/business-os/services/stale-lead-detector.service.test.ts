import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  detectStaleLeads,
  buildStaleLeadReport,
} from "@/lib/services/business-os/stale-lead-detector.service";
import { makeLead, fixedNow, daysAgo } from "../_helpers/business-fixtures";

describe("stale-lead-detector.service", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(fixedNow())); });
  afterEach(() => vi.useRealTimers());

  describe("detectStaleLeads — boundaries", () => {
    it("excludes leads younger than the threshold (default 14 days)", () => {
      expect(detectStaleLeads([makeLead({ lastContact: daysAgo(13) })])).toHaveLength(0);
    });

    it("classifies 15–30 days as 're-engage'", () => {
      const [s] = detectStaleLeads([makeLead({ lastContact: daysAgo(20) })]);
      expect(s.recommendedAction).toBe("re-engage");
    });

    it("classifies 31–60 days as 'escalate'", () => {
      const [s] = detectStaleLeads([makeLead({ lastContact: daysAgo(45) })]);
      expect(s.recommendedAction).toBe("escalate");
    });

    it("classifies 61–90 days as 'reassign'", () => {
      const [s] = detectStaleLeads([makeLead({ lastContact: daysAgo(75) })]);
      expect(s.recommendedAction).toBe("reassign");
    });

    it("classifies >90 days as 'archive'", () => {
      const [s] = detectStaleLeads([makeLead({ lastContact: daysAgo(120) })]);
      expect(s.recommendedAction).toBe("archive");
    });

    it("treats missing lastContact as very stale (999 days)", () => {
      const [s] = detectStaleLeads([makeLead({ lastContact: "" })]);
      expect(s.recommendedAction).toBe("archive");
      expect(s.daysSinceLastContact).toBe(999);
    });
  });

  describe("buildStaleLeadReport", () => {
    it("rolls up counts per recommendedAction", () => {
      const report = buildStaleLeadReport([
        makeLead({ id: "a", lastContact: daysAgo(20) }),
        makeLead({ id: "b", lastContact: daysAgo(20) }),
        makeLead({ id: "c", lastContact: daysAgo(120) }),
      ]);
      expect(report.byAction["re-engage"]).toBe(2);
      expect(report.byAction["archive"]).toBe(1);
      expect(report.staleCount).toBe(3);
    });

    it("computes stalePercentage correctly", () => {
      const r = buildStaleLeadReport([
        makeLead({ id: "a", lastContact: daysAgo(20) }),
        makeLead({ id: "b", lastContact: daysAgo(2) }),
      ]);
      expect(r.stalePercentage).toBe(50);
    });

    it("returns 0% when no leads (no division-by-zero)", () => {
      expect(buildStaleLeadReport([]).stalePercentage).toBe(0);
    });
  });
});
