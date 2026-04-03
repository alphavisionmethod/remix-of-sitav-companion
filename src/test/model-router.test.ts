import { describe, it, expect, beforeEach } from "vitest";
import {
  routeToModel,
  getModelBudgetStatus,
  recordModelSpend,
  setModelBudget,
  resetDailySpend,
} from "@/lib/services/brain-core/model-router";

describe("Budget-Aware Model Router", () => {
  beforeEach(() => {
    resetDailySpend();
    setModelBudget(10000); // $100
  });

  describe("routeToModel", () => {
    it("routes trivial/low-risk to nano", () => {
      const decision = routeToModel({ complexity: "trivial", riskClass: "low" });
      expect(decision.selectedTier).toBe("nano");
      expect(decision.downgraded).toBe(false);
    });

    it("routes simple/standard to standard", () => {
      const decision = routeToModel({ complexity: "simple", riskClass: "standard" });
      expect(decision.selectedTier).toBe("standard");
    });

    it("routes complex intents to premium", () => {
      const decision = routeToModel({ complexity: "complex", riskClass: "standard" });
      expect(decision.selectedTier).toBe("premium");
    });

    it("routes expert complexity to reasoning", () => {
      const decision = routeToModel({ complexity: "expert", riskClass: "low" });
      expect(decision.selectedTier).toBe("reasoning");
    });

    it("routes critical domains to premium minimum", () => {
      const decision = routeToModel({ complexity: "simple", riskClass: "critical" });
      expect(decision.selectedTier).toBe("premium");
    });

    it("routes critical + expert to reasoning", () => {
      const decision = routeToModel({ complexity: "expert", riskClass: "critical" });
      expect(decision.selectedTier).toBe("reasoning");
    });

    it("routes simulations to standard minimum", () => {
      const decision = routeToModel({ complexity: "trivial", riskClass: "low", isSimulation: true });
      expect(decision.selectedTier).toBe("standard");
    });

    it("provides reasoning string", () => {
      const decision = routeToModel({ complexity: "moderate", riskClass: "elevated" });
      expect(decision.reasoning).toContain("moderate");
      expect(decision.reasoning).toContain("elevated");
    });
  });

  describe("Budget constraints", () => {
    it("downgrades when budget exhausted", () => {
      setModelBudget(3); // Only 3 cents
      const decision = routeToModel({ complexity: "expert", riskClass: "low" });
      // Should downgrade from reasoning (100¢) to nano (1¢)
      expect(decision.downgraded).toBe(true);
      expect(decision.selectedTier).toBe("nano");
    });

    it("enforces standard minimum for critical domains even on budget constraint", () => {
      setModelBudget(3);
      const decision = routeToModel({ complexity: "simple", riskClass: "critical" });
      expect(["standard", "premium", "reasoning"]).toContain(decision.selectedTier);
    });

    it("includes downgrade reason", () => {
      setModelBudget(2);
      const decision = routeToModel({ complexity: "complex", riskClass: "standard" });
      expect(decision.downgraded).toBe(true);
      expect(decision.downgradeReason).toBeTruthy();
    });
  });

  describe("Budget tracking", () => {
    it("tracks spend and reports status", () => {
      recordModelSpend(50);
      recordModelSpend(100);
      const status = getModelBudgetStatus();
      expect(status.spentCents).toBe(150);
      expect(status.remainingCents).toBe(9850);
    });

    it("detects constrained state", () => {
      setModelBudget(100);
      recordModelSpend(95);
      const status = getModelBudgetStatus();
      expect(status.isConstrained).toBe(true);
    });

    it("resets daily spend", () => {
      recordModelSpend(500);
      resetDailySpend();
      const status = getModelBudgetStatus();
      expect(status.spentCents).toBe(0);
    });
  });
});
