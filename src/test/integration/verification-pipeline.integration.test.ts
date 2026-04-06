import { describe, it, expect } from "vitest";
import { VerificationEngine } from "@/lib/core-services/verification-engine";

describe("Verification Pipeline — Integration", () => {
  it("verifies a successful execution result", () => {
    const engine = new VerificationEngine();
    const result = engine.verify(
      "corr-1",
      "business.create-lead",
      "env-1",
      { status: "success" },
      { status: "success", id: "lead-123", data: { name: "Acme" } }
    );

    expect(result.passed).toBe(true);
    expect(result.checks.length).toBeGreaterThan(0);
    expect(result.rollbackRecommended).toBe(false);
  });

  it("detects empty result as failure", () => {
    const engine = new VerificationEngine();
    const result = engine.verify(
      "corr-2",
      "business.create-lead",
      "env-2",
      {},
      {}
    );

    expect(result.passed).toBe(false);
    expect(result.checks.some(c => c.ruleId === "result-not-null" && !c.result.passed)).toBe(true);
  });

  it("detects error fields in result", () => {
    const engine = new VerificationEngine();
    const result = engine.verify(
      "corr-3",
      "business.update-record",
      "env-3",
      {},
      { error: "Database timeout", errorCode: "DB_TIMEOUT" }
    );

    expect(result.passed).toBe(false);
    const errorCheck = result.checks.find(c => c.ruleId === "no-error-field");
    expect(errorCheck?.result.passed).toBe(false);
  });

  it("verifies finance amount matching", () => {
    const engine = new VerificationEngine();
    const result = engine.verify(
      "corr-4",
      "finance.pay-invoice",
      "env-4",
      { amount: 1000 },
      { amount: 1005, status: "success", id: "tx-1" }
    );

    // Within 1% tolerance
    const amountCheck = result.checks.find(c => c.ruleId === "amount-match");
    expect(amountCheck?.result.passed).toBe(true);
  });

  it("detects amount mismatch outside tolerance", () => {
    const engine = new VerificationEngine();
    const result = engine.verify(
      "corr-5",
      "finance.pay-invoice",
      "env-5",
      { amount: 1000 },
      { amount: 1200, status: "success", id: "tx-2" }
    );

    const amountCheck = result.checks.find(c => c.ruleId === "amount-match");
    expect(amountCheck?.result.passed).toBe(false);
  });

  it("supports custom verification rules", () => {
    const customRule = {
      id: "custom-check",
      name: "Custom Field Check",
      description: "Checks custom field exists",
      capabilityPattern: "*",
      check: (_expected: Record<string, unknown>, actual: Record<string, unknown>) => ({
        passed: "customField" in actual,
        message: "customField" in actual ? "Present" : "Missing customField",
      }),
    };

    const engine = new VerificationEngine([customRule]);
    const result = engine.verify("c1", "test.cap", "e1", {}, { customField: true, status: "ok" });

    const custom = result.checks.find(c => c.ruleId === "custom-check");
    expect(custom?.result.passed).toBe(true);
  });

  it("tracks verification duration", () => {
    const engine = new VerificationEngine();
    const result = engine.verify("c", "test.x", "e", {}, { status: "ok", data: {} });
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});
