import { describe, it, expect, vi } from "vitest";
import { evaluatePolicy, classifyRiskTier, getConstitutionalRules, getRuleById } from "../policy-engine";

vi.mock("@/lib/persistence/policy-engine-persistence", () => ({
  persistPolicyEvaluation: vi.fn().mockResolvedValue("mock-id"),
}));

vi.mock("../investment-policy-rules", () => ({
  getInvestmentPolicyRules: () => [],
}));

describe("evaluatePolicy", () => {
  it("denies critical risk tier", () => {
    const result = evaluatePolicy({ riskTier: "critical" }, undefined, { skipPersist: true });
    expect(result.effect).toBe("deny");
  });

  it("requires dual approval for finance >$5K", () => {
    const result = evaluatePolicy({ domain: "finance", amount: 10000 }, undefined, { skipPersist: true });
    expect(result.effect).toBe("require-dual-approval");
  });

  it("requires approval for finance >$500", () => {
    const result = evaluatePolicy({ domain: "finance", amount: 1000 }, undefined, { skipPersist: true });
    expect(result.effect).toBe("require-approval");
  });

  it("denies on 2+ contradictions", () => {
    const result = evaluatePolicy({ contradictionCount: 3 }, undefined, { skipPersist: true });
    expect(result.effect).toBe("deny");
  });

  it("requires simulation on stale data", () => {
    const result = evaluatePolicy({ hasStaleSources: true }, undefined, { skipPersist: true });
    expect(result.effect).toBe("require-simulation");
  });

  it("requires approval for high risk", () => {
    const result = evaluatePolicy({ riskTier: "high" }, undefined, { skipPersist: true });
    expect(result.effect).toBe("require-approval");
  });

  it("allows simulation mode", () => {
    const result = evaluatePolicy({ isSimulation: true }, undefined, { skipPersist: true });
    expect(result.effect).toBe("allow");
  });

  it("allows low-risk by default", () => {
    const result = evaluatePolicy({ riskTier: "low" }, undefined, { skipPersist: true });
    expect(result.effect).toBe("allow");
  });

  it("supports custom rules with higher priority", () => {
    const result = evaluatePolicy(
      { domain: "test" },
      [{ id: "custom", name: "Custom", priority: 9999, effect: "deny", conditions: [{ field: "domain", operator: "eq", value: "test" }], reason: "custom" }],
      { skipPersist: true }
    );
    expect(result.effect).toBe("deny");
    expect(result.matchedRule?.id).toBe("custom");
  });
});

describe("classifyRiskTier", () => {
  it("returns critical for finance >5000", () => {
    expect(classifyRiskTier("finance", "pay", 10000)).toBe("critical");
  });
  it("returns high for finance >500", () => {
    expect(classifyRiskTier("finance", "pay", 1000)).toBe("high");
  });
  it("returns medium for finance without amount", () => {
    expect(classifyRiskTier("finance", "read")).toBe("medium");
  });
  it("returns high for delete capabilities", () => {
    expect(classifyRiskTier("business", "delete-record")).toBe("high");
  });
  it("returns medium for write capabilities", () => {
    expect(classifyRiskTier("business", "write-record")).toBe("medium");
  });
  it("returns low for read capabilities", () => {
    expect(classifyRiskTier("business", "read-record")).toBe("low");
  });
});

describe("getConstitutionalRules", () => {
  it("returns rules array", () => {
    expect(getConstitutionalRules().length).toBeGreaterThan(5);
  });
});

describe("getRuleById", () => {
  it("finds existing rule", () => {
    expect(getRuleById("default-allow")).toBeDefined();
  });
  it("returns undefined for missing rule", () => {
    expect(getRuleById("nonexistent")).toBeUndefined();
  });
});
