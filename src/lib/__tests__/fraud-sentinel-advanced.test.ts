import { describe, it, expect } from "vitest";
import { FraudSentinelService, type FraudContext } from "@/lib/core-services/fraud-sentinel";

const baseContext: FraudContext = {
  userId: "user-1",
  timestamp: Date.now(),
  amount: 100,
  method: "ach",
};

describe("Fraud Sentinel — evaluate", () => {
  it("triggers on large amounts", () => {
    const sentinel = new FraudSentinelService();
    const signals = sentinel.evaluate({ ...baseContext, amount: 30000 });
    expect(signals.some(s => s.type === "unusual-amount")).toBe(true);
  });

  it("triggers on velocity spike", () => {
    const sentinel = new FraudSentinelService();
    const signals = sentinel.evaluate({ ...baseContext, recentTransactionCount: 15 });
    expect(signals.some(s => s.type === "velocity-spike")).toBe(true);
  });

  it("triggers on new recipient with large amount", () => {
    const sentinel = new FraudSentinelService();
    const signals = sentinel.evaluate({ ...baseContext, isNewRecipient: true, amount: 10000 });
    expect(signals.some(s => s.type === "unusual-recipient")).toBe(true);
  });

  it("triggers on new device", () => {
    const sentinel = new FraudSentinelService();
    const signals = sentinel.evaluate({ ...baseContext, isNewDevice: true });
    expect(signals.some(s => s.type === "device-anomaly")).toBe(true);
  });

  it("triggers on rapid spend", () => {
    const sentinel = new FraudSentinelService();
    const signals = sentinel.evaluate({ ...baseContext, recentTotalAmount: 60000 });
    expect(signals.some(s => s.action === "block")).toBe(true);
  });

  it("does not trigger for normal transactions", () => {
    const sentinel = new FraudSentinelService();
    const signals = sentinel.evaluate({ ...baseContext, amount: 50, recentTransactionCount: 2 });
    expect(signals.length).toBe(0);
  });

  it("triggers on odd-hours activity", () => {
    const sentinel = new FraudSentinelService();
    const signals = sentinel.evaluate({ ...baseContext, hourOfDay: 3 });
    expect(signals.some(s => s.type === "unusual-timing")).toBe(true);
  });
});

describe("Fraud Sentinel — shouldBlock", () => {
  it("blocks on critical signals", () => {
    const sentinel = new FraudSentinelService();
    const result = sentinel.shouldBlock({ ...baseContext, recentTotalAmount: 60000 });
    expect(result.blocked).toBe(true);
    expect(result.reason).toBeDefined();
  });

  it("blocks on multiple hold signals", () => {
    const sentinel = new FraudSentinelService();
    const result = sentinel.shouldBlock({ ...baseContext, amount: 30000, isNewRecipient: true });
    expect(result.blocked).toBe(true);
  });

  it("does not block normal transactions", () => {
    const sentinel = new FraudSentinelService();
    const result = sentinel.shouldBlock({ ...baseContext, amount: 50 });
    expect(result.blocked).toBe(false);
  });
});

describe("Fraud Sentinel — resolve", () => {
  it("resolves a signal", () => {
    const sentinel = new FraudSentinelService();
    const signals = sentinel.evaluate({ ...baseContext, amount: 30000 });
    expect(signals.length).toBeGreaterThan(0);
    const resolved = sentinel.resolve(signals[0].id, "admin");
    expect(resolved).toBe(true);
    expect(sentinel.getActiveSignals().length).toBe(0);
  });

  it("returns false for unknown signal", () => {
    const sentinel = new FraudSentinelService();
    expect(sentinel.resolve("nonexistent", "admin")).toBe(false);
  });
});

describe("Fraud Sentinel — getSummary", () => {
  it("aggregates signals correctly", () => {
    const sentinel = new FraudSentinelService();
    sentinel.evaluate({ ...baseContext, amount: 30000 });
    sentinel.evaluate({ ...baseContext, isNewDevice: true });
    const summary = sentinel.getSummary();
    expect(summary.totalSignals).toBeGreaterThanOrEqual(2);
    expect(summary.topSignalTypes.length).toBeGreaterThan(0);
    expect(summary.riskScore).toBeGreaterThan(0);
  });

  it("tracks blocked transactions", () => {
    const sentinel = new FraudSentinelService();
    sentinel.evaluate({ ...baseContext, recentTotalAmount: 60000 });
    const summary = sentinel.getSummary();
    expect(summary.blockedTransactions).toBeGreaterThanOrEqual(1);
  });
});

describe("Fraud Sentinel — custom rules", () => {
  it("supports custom rules", () => {
    const sentinel = new FraudSentinelService([
      { id: "custom-1", name: "Custom", enabled: true, condition: (ctx) => (ctx.amount ?? 0) > 10, severity: "alert", action: "hold", description: "Custom rule" },
    ]);
    const signals = sentinel.evaluate({ ...baseContext, amount: 50 });
    expect(signals.length).toBe(1);
    expect(signals[0].description).toBe("Custom rule");
  });
});
