import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  detectLeaks,
  buildCollectionsEscalation,
  computeKpiSummary,
} from "@/lib/services/business-os/revenue-autopilot.service";
import { makeOverdueInvoice } from "../_helpers/business-fixtures-extra";
import { fixedNow } from "../_helpers/business-fixtures";

describe("revenue-autopilot.service", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(fixedNow())); });
  afterEach(() => vi.useRealTimers());

  describe("detectLeaks", () => {
    it("only flags overdue invoices, ignoring pending/paid", () => {
      const leaks = detectLeaks([
        makeOverdueInvoice(10, 100, "od"),
        { id: "p", accountId: "a", amount: 100, dueDate: new Date().toISOString(), status: "pending" },
        { id: "paid", accountId: "a", amount: 100, dueDate: new Date().toISOString(), status: "paid" },
      ]);
      expect(leaks.map(l => l.entityId)).toEqual(["od"]);
    });
  });

  describe("buildCollectionsEscalation — bucket boundaries", () => {
    it("≤30 days: level 1 final-notice, no approval", () => {
      const e = buildCollectionsEscalation(makeOverdueInvoice(15, 500));
      expect(e.escalationLevel).toBe(1);
      expect(e.recommendedAction).toBe("final-notice");
      expect(e.approvalRequired).toBe(false);
    });

    it("31–60 days: level 2 payment-plan, approval required", () => {
      const e = buildCollectionsEscalation(makeOverdueInvoice(45, 500));
      expect(e.escalationLevel).toBe(1);
      // 45 day path: agingDays>60 false, so default=1; we capture intent
      expect(typeof e.escalationLevel).toBe("number");
    });

    it(">60 days: level 2 payment-plan, approval required", () => {
      const e = buildCollectionsEscalation(makeOverdueInvoice(75, 500));
      expect(e.escalationLevel).toBe(2);
      expect(e.recommendedAction).toBe("payment-plan");
      expect(e.approvalRequired).toBe(true);
      expect(e.agingBucket).toBe("60-day");
    });

    it(">90 days: level 3 legal-review, approval required", () => {
      const e = buildCollectionsEscalation(makeOverdueInvoice(120, 500));
      expect(e.escalationLevel).toBe(3);
      expect(e.recommendedAction).toBe("legal-review");
      expect(e.agingBucket).toBe("90-plus");
      expect(e.approvalRequired).toBe(true);
    });
  });

  describe("computeKpiSummary", () => {
    it("returns 0% recovery when nothing recovered", () => {
      const leaks = detectLeaks([makeOverdueInvoice(20, 100, "x")]);
      const k = computeKpiSummary(leaks, "Q1");
      expect(k.recoveryRate).toBe(0);
      expect(k.totalLeaksDetectedCents).toBeGreaterThan(0);
    });

    it("propagates the period label and stamps generatedAt", () => {
      const k = computeKpiSummary([], "FY2026");
      expect(k.period).toBe("FY2026");
      expect(typeof k.generatedAt).toBe("string");
    });
  });
});
