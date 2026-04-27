import { describe, it, expect } from "vitest";
import {
  buildEventPlan,
  getMockEventPlans,
} from "@/lib/services/concierge-os/event-continuity.service";

describe("event-continuity.service", () => {
  it("buildEventPlan creates an event with all tasks marked undone", () => {
    const plan = buildEventPlan("Wedding", "2026-09-12T00:00:00Z", ["Book venue", "Send invites"]);
    expect(plan.name).toBe("Wedding");
    expect(plan.tasks).toHaveLength(2);
    expect(plan.tasks.every((t) => t.done === false)).toBe(true);
    expect(plan.completionPct).toBe(0);
  });

  it("getMockEventPlans returns at least one event with tasks", () => {
    const plans = getMockEventPlans();
    expect(plans.length).toBeGreaterThan(0);
    expect(plans[0].tasks.length).toBeGreaterThan(0);
  });
});