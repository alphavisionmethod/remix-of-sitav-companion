import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRecoveryPlan, advanceRecoveryStep } from "@/lib/services/business-os/recovery-engine.service";
import { makeRevenueLeak, fixedNow } from "../_helpers/business-fixtures";

describe("recovery-engine.service", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(fixedNow())); });
  afterEach(() => vi.useRealTimers());

  describe("createRecoveryPlan", () => {
    it("produces a 4-step plan with email→sms→call→email channel sequence", () => {
      const plan = createRecoveryPlan(makeRevenueLeak());
      expect(plan.steps).toHaveLength(4);
      expect(plan.steps.map(s => s.channel)).toEqual(["email", "sms", "call", "email"]);
    });

    it("estimated duration is 21 days and status starts as 'planned'", () => {
      const plan = createRecoveryPlan(makeRevenueLeak());
      expect(plan.estimatedDurationDays).toBe(21);
      expect(plan.status).toBe("planned");
    });

    it("estimated recovery is 70% of leak amount (rounded)", () => {
      const plan = createRecoveryPlan(makeRevenueLeak({ leakAmountCents: 1_000_000 }));
      expect(plan.estimatedRecoveryCents).toBe(700_000);
    });

    it("links plan to leak via leakId and prefixed id", () => {
      const plan = createRecoveryPlan(makeRevenueLeak({ id: "leak-x" }));
      expect(plan.leakId).toBe("leak-x");
      expect(plan.id).toBe("recovery-leak-x");
    });
  });

  describe("advanceRecoveryStep", () => {
    it("advances planned → in-progress on first step", () => {
      const plan = createRecoveryPlan(makeRevenueLeak());
      const next = advanceRecoveryStep(plan);
      expect(next.status).toBe("in-progress");
      expect(next.steps[0].completed).toBe(true);
      expect(next.steps[1].completed).toBe(false);
    });

    it("transitions to 'completed' once all steps done", () => {
      let plan = createRecoveryPlan(makeRevenueLeak());
      for (let i = 0; i < 4; i++) plan = advanceRecoveryStep(plan);
      expect(plan.status).toBe("completed");
      expect(plan.steps.every(s => s.completed)).toBe(true);
    });
  });
});
