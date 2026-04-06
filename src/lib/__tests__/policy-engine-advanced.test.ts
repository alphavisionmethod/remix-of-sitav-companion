import { describe, it, expect } from "vitest";
import {
  evaluatePolicy,
  classifyRiskTier,
  getConstitutionalRules,
  getRuleById,
} from "@/lib/core-services/policy-engine";

describe("Policy Engine — evaluatePolicy", () => {
  it("denies critical risk operations", () => {
    const result = evaluatePolicy({ riskTier: "critical" }, [], { skipPersist: true });
    expect(result.effect).toBe("deny");
    expect(result.matchedRule?.id).toBe("security-deny-critical");
  });

  it("requires dual approval for finance > $5K", () => {
    const result = evaluatePolicy({ domain: "finance", amount: 10000 }, [], { skipPersist: true });
    expect(result.effect).toBe("require-dual-approval");
  });

  it("requires approval for finance > $500", () => {
    const result = evaluatePolicy({ domain: "finance", amount: 1000 }, [], { skipPersist: true });
    expect(result.effect).toBe("require-approval");
  });

  it("denies on material contradictions", () => {
    const result = evaluatePolicy({ contradictionCount: 3 }, [], { skipPersist: true });
    expect(result.effect).toBe("deny");
  });

  it("requires simulation on stale data", () => {
    const result = evaluatePolicy({ hasStaleSources: true }, [], { skipPersist: true });
    expect(result.effect).toBe("require-simulation");
  });

  it("requires approval for high risk", () => {
    const result = evaluatePolicy({ riskTier: "high" }, [], { skipPersist: true });
    expect(result.effect).toBe("require-approval");
  });

  it("allows simulation mode", () => {
    const result = evaluatePolicy({ isSimulation: true }, [], { skipPersist: true });
    expect(result.effect).toBe("allow");
  });

  it("allows medium risk with monitoring", () => {
    const result = evaluatePolicy({ riskTier: "medium" }, [], { skipPersist: true });
    expect(result.effect).toBe("allow");
  });

  it("defaults to allow", () => {
    const result = evaluatePolicy({}, [], { skipPersist: true });
    expect(result.effect).toBe("allow");
  });

  it("respects custom rule priority", () => {
    const customRules = [
      { id: "custom-block", name: "Block Test", priority: 999, effect: "deny" as const, conditions: [{ field: "domain", operator: "eq" as const, value: "test" }], reason: "Custom block" },
    ];
    const result = evaluatePolicy({ domain: "test" }, customRules, { skipPersist: true });
    expect(result.effect).toBe("deny");
    expect(result.matchedRule?.id).toBe("custom-block");
  });

  it("records evaluation time", () => {
    const result = evaluatePolicy({}, [], { skipPersist: true });
    expect(result.evaluationTimeMs).toBeGreaterThanOrEqual(0);
  });

  it("requires approval for connector writes", () => {
    const result = evaluatePolicy({ capabilityId: "connector-write-data", domain: "connector" }, [], { skipPersist: true });
    expect(result.effect).toBe("require-approval");
  });
});

describe("Policy Engine — classifyRiskTier", () => {
  it("classifies finance with large amount as critical", () => {
    expect(classifyRiskTier("finance", "transfer", 10000)).toBe("critical");
  });

  it("classifies finance with medium amount as high", () => {
    expect(classifyRiskTier("finance", "payment", 1000)).toBe("high");
  });

  it("classifies finance without amount as medium", () => {
    expect(classifyRiskTier("finance", "view")).toBe("medium");
  });

  it("classifies delete capabilities as high", () => {
    expect(classifyRiskTier("crm", "delete-contact")).toBe("high");
  });

  it("classifies write capabilities as medium", () => {
    expect(classifyRiskTier("crm", "update-contact")).toBe("medium");
  });

  it("classifies read capabilities as low", () => {
    expect(classifyRiskTier("crm", "read-contacts")).toBe("low");
  });
});

describe("Policy Engine — getConstitutionalRules", () => {
  it("returns all rules", () => {
    const rules = getConstitutionalRules();
    expect(rules.length).toBeGreaterThanOrEqual(8);
  });

  it("returns a copy", () => {
    const rules1 = getConstitutionalRules();
    const rules2 = getConstitutionalRules();
    expect(rules1).not.toBe(rules2);
  });
});

describe("Policy Engine — getRuleById", () => {
  it("finds existing rule", () => {
    const rule = getRuleById("security-deny-critical");
    expect(rule).toBeDefined();
    expect(rule?.effect).toBe("deny");
  });

  it("returns undefined for unknown rule", () => {
    expect(getRuleById("nonexistent")).toBeUndefined();
  });
});
