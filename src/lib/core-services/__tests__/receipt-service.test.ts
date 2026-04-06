import { describe, it, expect, vi } from "vitest";
import { ReceiptService, createReceiptService } from "../receipt-service";

vi.mock("@/lib/persistence/supabase-adapters", () => ({
  persistReceipt: vi.fn().mockResolvedValue(undefined),
  fetchReceipts: vi.fn().mockResolvedValue([]),
}));

describe("ReceiptService", () => {
  it("creates a receipt with hash and sequence", async () => {
    const svc = createReceiptService();
    svc.setPersistence(false);
    const receipt = await svc.createReceipt("corr-1", "execution-summary", { action: "pay" });
    expect(receipt.hash).toBeTruthy();
    expect(receipt.sequenceNumber).toBe(1);
    expect(receipt.previousHash).toBeNull();
    expect(receipt.status).toBe("valid");
  });

  it("chains hashes — second receipt references first", async () => {
    const svc = createReceiptService();
    svc.setPersistence(false);
    const r1 = await svc.createReceipt("corr-1", "execution-summary", { a: 1 });
    const r2 = await svc.createReceipt("corr-1", "approval-record", { b: 2 });
    expect(r2.previousHash).toBe(r1.hash);
    expect(r2.sequenceNumber).toBe(2);
  });

  it("verifyChain returns valid for correct chain", async () => {
    const svc = createReceiptService();
    svc.setPersistence(false);
    await svc.createReceipt("c", "execution-summary", { x: 1 });
    await svc.createReceipt("c", "approval-record", { x: 2 });
    const result = await svc.verifyChain();
    expect(result.valid).toBe(true);
  });

  it("verifyChain detects tampering", async () => {
    const svc = createReceiptService();
    svc.setPersistence(false);
    await svc.createReceipt("c", "execution-summary", { x: 1 });
    await svc.createReceipt("c", "approval-record", { x: 2 });
    // Tamper with first receipt hash
    const receipts = svc.getReceipts();
    receipts[0].hash = "tampered";
    const result = await svc.verifyChain(receipts);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(1);
  });

  it("generates proof pack for correlation ID", async () => {
    const svc = createReceiptService();
    svc.setPersistence(false);
    await svc.createReceipt("c1", "execution-summary", {});
    await svc.createReceipt("c2", "execution-summary", {});
    await svc.createReceipt("c1", "approval-record", {});
    const pack = await svc.generateProofPack("c1");
    expect(pack.receipts).toHaveLength(2);
    expect(pack.correlationId).toBe("c1");
  });

  it("filters by receipt type", async () => {
    const svc = createReceiptService();
    svc.setPersistence(false);
    await svc.createReceipt("c", "execution-summary", {});
    await svc.createReceipt("c", "refusal", {});
    expect(svc.getReceiptsByType("refusal")).toHaveLength(1);
  });

  it("reports persistence health", () => {
    const svc = createReceiptService();
    const health = svc.getPersistenceHealth();
    expect(health.enabled).toBe(true);
    expect(health.chainLength).toBe(0);
  });
});
