import { describe, it, expect } from "vitest";
import {
  CapabilityRouter,
  createCapabilityRouter,
  type CapabilityDefinition,
} from "@/lib/core-services/capability-router";

describe("AI Gateway / Capability Router Chain — Integration", () => {
  it("creates router with default capabilities", () => {
    const router = createCapabilityRouter();
    const caps = router.listCapabilities();
    expect(caps.length).toBeGreaterThan(0);
    expect(caps.some(c => c.domain === "finance")).toBe(true);
    expect(caps.some(c => c.domain === "business")).toBe(true);
  });

  it("routes by exact capability ID", () => {
    const router = createCapabilityRouter();
    const decision = router.route({
      intentType: "query",
      domain: "finance",
      action: "query",
      urgency: "low",
    });

    expect(decision).not.toBeNull();
    expect(decision?.capabilityId).toBe("finance-query");
    expect(decision?.serviceName).toBe("finance-os");
  });

  it("falls back to domain match", () => {
    const router = createCapabilityRouter();
    const decision = router.route({
      intentType: "unknown",
      domain: "concierge",
      action: "unknown-action",
      urgency: "low",
    });

    expect(decision).not.toBeNull();
    expect(decision?.capabilityId).toContain("concierge");
  });

  it("returns null for unregistered domain", () => {
    const router = new CapabilityRouter();
    const decision = router.route({
      intentType: "query",
      domain: "nonexistent",
      action: "test",
      urgency: "low",
    });

    expect(decision).toBeNull();
  });

  it("selects draft mode for high-risk capabilities", () => {
    const router = createCapabilityRouter();
    const decision = router.route({
      intentType: "action",
      domain: "finance",
      action: "action",
      urgency: "low",
    });

    expect(decision?.selectedMode).toBe("draft");
  });

  it("selects real mode for critical urgency", () => {
    const router = createCapabilityRouter();
    const decision = router.route({
      intentType: "query",
      domain: "business",
      action: "query",
      urgency: "critical",
    });

    expect(decision?.selectedMode).toBe("real");
  });

  it("records routing history", () => {
    const router = createCapabilityRouter();
    router.route({ intentType: "q", domain: "business", action: "query", urgency: "low" });
    router.route({ intentType: "q", domain: "finance", action: "query", urgency: "low" });

    const history = router.getRoutingHistory();
    expect(history).toHaveLength(2);
  });

  it("reports health status", () => {
    const router = createCapabilityRouter();
    const health = router.getHealth();
    expect(health.status).toBe("healthy");
    expect(health.registeredCapabilities).toBeGreaterThan(0);
  });

  it("registers and retrieves custom capabilities", () => {
    const router = new CapabilityRouter();
    const cap: CapabilityDefinition = {
      id: "custom-cap",
      name: "Custom",
      domain: "test",
      serviceName: "test-service",
      requiredPolicies: [],
      riskTier: "R0",
      executionModes: ["real"],
      timeout: 5000,
      retryable: true,
    };

    router.register(cap);
    expect(router.getCapability("custom-cap")).toEqual(cap);
    expect(router.listCapabilities("test")).toHaveLength(1);
  });
});
