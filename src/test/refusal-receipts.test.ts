import { describe, it, expect } from "vitest";
import {
  createActionReceipt,
  createSystemReceipt,
  createRefusalReceipt,
  getChain,
  verifyChainIntegrity,
  getReceiptById,
} from "@/lib/services/receipt-service/receipts.service";

describe("Receipt Service with Refusal Receipts", () => {
  it("creates an action receipt with hash chain", () => {
    const receipt = createActionReceipt({
      actionId: "act-1",
      actionType: "follow-up",
      executor: "business-lead",
      input: { customerId: "c1" },
      output: { status: "sent" },
      status: "completed",
      tenantId: "t1",
    });
    expect(receipt.type).toBe("action");
    expect(receipt.hash).toBeTruthy();
    expect(receipt.id).toBeTruthy();
  });

  it("creates a system receipt", () => {
    const receipt = createSystemReceipt({
      action: "mode-switch",
      scope: "global",
      details: { from: "sanctum", to: "boardroom" },
      tenantId: "t1",
    });
    expect(receipt.type).toBe("system");
  });

  it("creates a refusal receipt with policy details", () => {
    const receipt = createRefusalReceipt({
      refusalReason: "Payment exceeds daily limit",
      blockedAction: "execute-payment",
      policyId: "pol-max-daily-spend",
      advisorId: "money-lead",
      confidenceAtRefusal: 92,
      requiredForRetry: ["owner-approval", "budget-increase"],
      tenantId: "t1",
    });
    expect(receipt.type).toBe("refusal");
    expect(receipt.refusalReason).toBe("Payment exceeds daily limit");
    expect(receipt.blockedAction).toBe("execute-payment");
    expect(receipt.policyId).toBe("pol-max-daily-spend");
    expect(receipt.requiredForRetry).toContain("owner-approval");
    expect(receipt.hash).toBeTruthy();
    expect(receipt.previousHash).toBeTruthy();
  });

  it("maintains chain integrity across all receipt types", () => {
    const chain = getChain();
    expect(chain.length).toBeGreaterThanOrEqual(3);
    const integrity = verifyChainIntegrity();
    expect(integrity.valid).toBe(true);
  });

  it("finds receipt by id", () => {
    const receipt = createSystemReceipt({
      action: "test-lookup",
      scope: "unit-test",
      details: {},
      tenantId: "t1",
    });
    const found = getReceiptById(receipt.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(receipt.id);
  });
});
