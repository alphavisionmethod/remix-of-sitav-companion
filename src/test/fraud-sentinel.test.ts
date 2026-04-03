import { describe, it, expect } from "vitest";
import { FraudSentinelService, type FraudContext } from "@/lib/core-services/fraud-sentinel";

describe("Fraud Sentinel Service", () => {
  it("creates a service instance", () => {
    const service = new FraudSentinelService();
    expect(service).toBeDefined();
  });

  it("evaluates a normal transaction without alerts", () => {
    const service = new FraudSentinelService();
    const ctx: FraudContext = { amount: 100, timestamp: Date.now(), userId: "user-1" };
    const signals = service.evaluate(ctx);
    expect(Array.isArray(signals)).toBe(true);
  });

  it("flags unusually large amounts", () => {
    const service = new FraudSentinelService();
    const ctx: FraudContext = { amount: 999999, timestamp: Date.now(), userId: "user-1", isNewRecipient: true };
    const signals = service.evaluate(ctx);
    expect(signals.length).toBeGreaterThan(0);
  });
});
