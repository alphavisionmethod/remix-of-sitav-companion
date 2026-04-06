import { describe, it, expect } from "vitest";
import { FraudSentinelService } from "../fraud-sentinel";
import type { FraudContext } from "../fraud-sentinel";

function makeContext(overrides: Partial<FraudContext> = {}): FraudContext {
  return {
    userId: "user1",
    timestamp: Date.now(),
    amount: 100,
    ...overrides,
  };
}

describe("FraudSentinelService", () => {
  it("returns no signals for normal transactions", () => {
    const svc = new FraudSentinelService();
    const signals = svc.evaluate(makeContext({ amount: 100 }));
    // Should not trigger large-amount, velocity, etc.
    const blocking = signals.filter(s => s.action === "block" || s.action === "hold");
    expect(blocking).toHaveLength(0);
  });

  it("triggers large amount alert for >$25K", () => {
    const svc = new FraudSentinelService();
    const signals = svc.evaluate(makeContext({ amount: 30000 }));
    expect(signals.some(s => s.type === "unusual-amount")).toBe(true);
  });

  it("triggers velocity spike for >10 recent transactions", () => {
    const svc = new FraudSentinelService();
    const signals = svc.evaluate(makeContext({ recentTransactionCount: 15 }));
    expect(signals.some(s => s.type === "velocity-spike")).toBe(true);
  });

  it("triggers new recipient + large amount", () => {
    const svc = new FraudSentinelService();
    const signals = svc.evaluate(makeContext({ isNewRecipient: true, amount: 6000 }));
    expect(signals.some(s => s.type === "unusual-recipient")).toBe(true);
  });

  it("triggers new device signal", () => {
    const svc = new FraudSentinelService();
    const signals = svc.evaluate(makeContext({ isNewDevice: true }));
    expect(signals.some(s => s.type === "device-anomaly")).toBe(true);
  });

  it("shouldBlock returns blocked for rapid spend >$50K", () => {
    const svc = new FraudSentinelService();
    const result = svc.shouldBlock(makeContext({ recentTotalAmount: 60000 }));
    expect(result.blocked).toBe(true);
  });

  it("shouldBlock returns not blocked for normal context", () => {
    const svc = new FraudSentinelService();
    const result = svc.shouldBlock(makeContext({ amount: 50 }));
    expect(result.blocked).toBe(false);
  });

  it("resolves a signal", () => {
    const svc = new FraudSentinelService();
    const signals = svc.evaluate(makeContext({ amount: 30000 }));
    const resolved = svc.resolve(signals[0].id, "admin");
    expect(resolved).toBe(true);
    expect(svc.getActiveSignals().find(s => s.id === signals[0].id)).toBeUndefined();
  });

  it("getSummary returns aggregate stats", () => {
    const svc = new FraudSentinelService();
    svc.evaluate(makeContext({ amount: 30000 }));
    svc.evaluate(makeContext({ isNewDevice: true }));
    const summary = svc.getSummary();
    expect(summary.totalSignals).toBeGreaterThanOrEqual(2);
  });
});
