import { describe, it, expect } from "vitest";
import {
  evaluatePolicy,
  classifyRiskTier,
  getConstitutionalRules,
  getRuleById,
  type PolicyContext,
} from "@/lib/core-services/policy-engine";

describe("Policy Engine Chain — Integration", () => {
  it("denies critical risk operations", () => {
    const ctx: PolicyContext = { riskTier: "critical", domain: "finance" };
    const result = evaluatePolicy(ctx, undefined, { skipPersist: true });
    expect(result.effect).toBe("deny");
    expect(result.matchedRule?.id).toBe("security-deny-critical");
  });

  it("requires dual approval for finance >$5K", () => {
    const ctx: PolicyContext = { domain: "finance", amount: 10000 };
    const result = evaluatePolicy(ctx, undefined, { skipPersist: true });
    expect(result.effect).toBe("require-dual-approval");
  });

  it("requires single approval for finance >$500", () => {
    const ctx: PolicyContext = { domain: "finance", amount: 1000 };
    const result = evaluatePolicy(ctx, undefined, { skipPersist: true });
    expect(result.effect).toBe("require-approval");
  });

  it("blocks on material contradictions", () => {
    const ctx: PolicyContext = { contradictionCount: 3 };
    const result = evaluatePolicy(ctx, undefined, { skipPersist: true });
    expect(result.effect).toBe("deny");
    expect(result.matchedRule?.id).toBe("contradiction-block");
  });

  it("requires simulation on stale data", () => {
    const ctx: PolicyContext = { hasStaleSources: true };
    const result = evaluatePolicy(ctx, undefined, { skipPersist: true });
    expect(result.effect).toBe("require-simulation");
  });

  it("allows simulation mode bypass", () => {
    const ctx: PolicyContext = { isSimulation: true };
    const result = evaluatePolicy(ctx, undefined, { skipPersist: true });
    expect(result.effect).toBe("allow");
    expect(result.matchedRule?.id).toBe("simulation-bypass");
  });

  it("allows low-risk operations by default", () => {
    const ctx: PolicyContext = { domain: "concierge", riskTier: "low" };
    const result = evaluatePolicy(ctx, undefined, { skipPersist: true });
    expect(result.effect).toBe("allow");
  });

  it("classifies risk tiers correctly", () => {
    expect(classifyRiskTier("finance", "pay-invoice", 10000)).toBe("critical");
    expect(classifyRiskTier("finance", "pay-invoice", 1000)).toBe("high");
    expect(classifyRiskTier("finance", "view-balance")).toBe("medium");
    expect(classifyRiskTier("business", "delete-record")).toBe("high");
    expect(classifyRiskTier("business", "update-record")).toBe("medium");
    expect(classifyRiskTier("business", "view-record")).toBe("low");
  });

  it("returns constitutional rules list", () => {
    const rules = getConstitutionalRules();
    expect(rules.length).toBeGreaterThan(5);
    expect(rules[0].priority).toBeGreaterThan(0);
  });

  it("looks up rules by ID", () => {
    const rule = getRuleById("security-deny-critical");
    expect(rule).toBeDefined();
    expect(rule?.effect).toBe("deny");
  });

  it("custom rules take precedence over constitutional", () => {
    const customRule = {
      id: "custom-override",
      name: "Always deny test",
      priority: 9999,
      effect: "deny" as const,
      conditions: [],
      reason: "Custom override",
    };
    const result = evaluatePolicy({}, [customRule], { skipPersist: true });
    expect(result.effect).toBe("deny");
    expect(result.matchedRule?.id).toBe("custom-override");
  });

  it("measures evaluation time", () => {
    const result = evaluatePolicy({ domain: "finance", amount: 100 }, undefined, { skipPersist: true });
    expect(result.evaluationTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.evaluatedRules).toBeGreaterThan(0);
  });
});
