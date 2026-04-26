import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  detectNoShows,
  buildNoShowRecoveryActions,
  computeNoShowRate,
} from "@/lib/services/business-os/no-show-recovery.service";
import { makeNoShowEvent, fixedNow, daysAgo, daysAhead } from "../_helpers/business-fixtures";

describe("no-show-recovery.service", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(fixedNow())); });
  afterEach(() => vi.useRealTimers());

  describe("detectNoShows", () => {
    it("filters out future events", () => {
      const past = makeNoShowEvent({ id: "p", scheduledAt: daysAgo(1) });
      const future = makeNoShowEvent({ id: "f", scheduledAt: daysAhead(1) });
      const detected = detectNoShows([past, future]);
      expect(detected.map(e => e.id)).toEqual(["p"]);
    });

    it("returns empty array for all-future schedule", () => {
      expect(detectNoShows([makeNoShowEvent({ scheduledAt: daysAhead(2) })])).toEqual([]);
    });
  });

  describe("buildNoShowRecoveryActions", () => {
    it("recent (<2h) no-show → auto-reschedule", () => {
      const ev = makeNoShowEvent({ scheduledAt: new Date(fixedNow() - 30 * 60_000).toISOString() });
      const [action] = buildNoShowRecoveryActions([ev]);
      expect(action.action).toBe("auto-reschedule");
    });

    it("aged (>48h) no-show → escalate", () => {
      const ev = makeNoShowEvent({ scheduledAt: daysAgo(3) });
      const [action] = buildNoShowRecoveryActions([ev]);
      expect(action.action).toBe("escalate");
    });

    it("mid-range high-value (>$5000) → call", () => {
      const ev = makeNoShowEvent({ scheduledAt: new Date(fixedNow() - 12 * 3_600_000).toISOString(), valueCents: 800_000 });
      const [action] = buildNoShowRecoveryActions([ev]);
      expect(action.action).toBe("call");
    });

    it("mid-range low-value defaults to follow-up-email", () => {
      const ev = makeNoShowEvent({ scheduledAt: new Date(fixedNow() - 12 * 3_600_000).toISOString(), valueCents: 1000 });
      const [action] = buildNoShowRecoveryActions([ev]);
      expect(action.action).toBe("follow-up-email");
    });
  });

  describe("computeNoShowRate", () => {
    it("returns 0 when total is 0 (no division-by-zero)", () => {
      expect(computeNoShowRate(0, 0)).toBe(0);
    });
    it("rounds to nearest integer percent", () => {
      expect(computeNoShowRate(7, 1)).toBe(14); // 14.28..%
    });
    it("100% when all are no-shows", () => {
      expect(computeNoShowRate(5, 5)).toBe(100);
    });
  });
});
