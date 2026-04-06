import { describe, it, expect } from "vitest";
import { CapabilityRouter, createCapabilityRouter } from "../../core-services/capability-router";

describe("CapabilityRouter", () => {
  it("registers and retrieves capabilities", () => {
    const router = new CapabilityRouter();
    router.register({
      id: "test-cap", name: "Test", domain: "test", serviceName: "test-svc",
      requiredPolicies: [], riskTier: "R0", executionModes: ["real"], timeout: 5000, retryable: true,
    });
    expect(router.getCapability("test-cap")).toBeDefined();
  });

  it("routes to exact match capability", () => {
    const router = new CapabilityRouter();
    router.register({
      id: "biz-query", name: "Biz Query", domain: "biz", serviceName: "biz-svc",
      requiredPolicies: [], riskTier: "R0", executionModes: ["real", "simulation"], timeout: 5000, retryable: true,
    });
    const decision = router.route({ intentType: "query", domain: "biz", action: "query", urgency: "low" });
    expect(decision).not.toBeNull();
    expect(decision!.capabilityId).toBe("biz-query");
  });

  it("returns null when no capability matches", () => {
    const router = new CapabilityRouter();
    const decision = router.route({ intentType: "q", domain: "unknown", action: "x", urgency: "low" });
    expect(decision).toBeNull();
  });

  it("selects draft mode for high risk tiers", () => {
    const router = new CapabilityRouter();
    router.register({
      id: "fin-action", name: "Fin", domain: "fin", serviceName: "fin-svc",
      requiredPolicies: [], riskTier: "R4", executionModes: ["draft", "simulation"], timeout: 5000, retryable: false,
    });
    const decision = router.route({ intentType: "action", domain: "fin", action: "action", urgency: "critical" });
    expect(decision!.selectedMode).toBe("draft");
  });

  it("lists capabilities by domain", () => {
    const router = createCapabilityRouter();
    const bizCaps = router.listCapabilities("business");
    expect(bizCaps.length).toBeGreaterThan(0);
    expect(bizCaps.every(c => c.domain === "business")).toBe(true);
  });

  it("tracks routing history", () => {
    const router = new CapabilityRouter();
    router.route({ intentType: "q", domain: "none", action: "x", urgency: "low" });
    expect(router.getRoutingHistory()).toHaveLength(1);
  });

  it("getHealth returns registered count", () => {
    const router = createCapabilityRouter();
    const health = router.getHealth();
    expect(health.status).toBe("healthy");
    expect(health.registeredCapabilities).toBeGreaterThan(0);
  });
});
