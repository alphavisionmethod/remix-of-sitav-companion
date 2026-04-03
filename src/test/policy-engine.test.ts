import { describe, it, expect } from "vitest";
import { evaluatePolicy, type PolicyContext } from "@/lib/core-services/policy-engine";

describe("Policy Engine", () => {
  it("evaluates a simple policy context", () => {
    const ctx: PolicyContext = { domain: "finance", amount: 500, userId: "user-1" };
    const result = evaluatePolicy(ctx);
    expect(result).toBeDefined();
    expect(result.effect).toBeDefined();
    expect(result.reason).toBeDefined();
  });

  it("flags high-risk tier for approval", () => {
    const ctx: PolicyContext = { domain: "finance", riskTier: "high", amount: 50000, userId: "user-1" };
    const result = evaluatePolicy(ctx);
    expect(["require-approval", "require-dual-approval", "deny"]).toContain(result.effect);
  });
});
