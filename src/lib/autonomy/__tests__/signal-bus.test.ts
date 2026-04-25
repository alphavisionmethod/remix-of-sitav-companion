import { describe, it, expect } from "vitest";
import {
  SIGNAL_KINDS,
  compareSeverity,
  DEFAULT_SUBSCRIPTIONS,
} from "../signal-bus";

describe("signal-bus contract", () => {
  it("exposes a stable set of canonical signal kinds", () => {
    const required = [
      "CASH_RUNWAY_DIP",
      "CASH_BURN_SPIKE",
      "INBOX_BACKLOG_SPIKE",
      "INBOX_VIP_UNANSWERED",
      "CALENDAR_CONFLICT",
      "OPS_ANOMALY",
      "GOAL_DRIFT",
    ];
    for (const k of required) {
      expect(SIGNAL_KINDS).toHaveProperty(k);
    }
  });

  it("orders severity correctly", () => {
    expect(compareSeverity("info", "low")).toBeLessThan(0);
    expect(compareSeverity("critical", "high")).toBeGreaterThan(0);
    expect(compareSeverity("medium", "medium")).toBe(0);
  });

  it("seeds default subscriptions for the core advisors", () => {
    const advisorIds = DEFAULT_SUBSCRIPTIONS.map((s) => s.advisorId);
    expect(advisorIds).toContain("cfo-advisor");
    expect(advisorIds).toContain("ceo-advisor");
    expect(advisorIds).toContain("concierge-advisor");
    // Every default sub must have at least one signal kind
    for (const sub of DEFAULT_SUBSCRIPTIONS) {
      expect(sub.signalKinds.length).toBeGreaterThan(0);
    }
  });

  it("CFO subscribes to cash signals", () => {
    const cfo = DEFAULT_SUBSCRIPTIONS.find((s) => s.advisorId === "cfo-advisor");
    expect(cfo).toBeTruthy();
    expect(cfo!.signalKinds).toContain(SIGNAL_KINDS.CASH_RUNWAY_DIP);
  });

  it("Concierge subscribes to inbox + calendar signals", () => {
    const c = DEFAULT_SUBSCRIPTIONS.find((s) => s.advisorId === "concierge-advisor");
    expect(c).toBeTruthy();
    expect(c!.signalKinds).toContain(SIGNAL_KINDS.INBOX_BACKLOG_SPIKE);
    expect(c!.signalKinds).toContain(SIGNAL_KINDS.CALENDAR_CONFLICT);
  });
});