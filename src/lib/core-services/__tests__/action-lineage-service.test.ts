import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/persistence/action-lineage-persistence", () => ({
  persistActionRecord: vi.fn().mockResolvedValue("test-id"),
  persistActionTransition: vi.fn().mockResolvedValue(true),
  linkEventToAction: vi.fn().mockResolvedValue(true),
  linkReceiptToAction: vi.fn().mockResolvedValue(true),
  linkPolicyToAction: vi.fn().mockResolvedValue(true),
  linkMemoryToAction: vi.fn().mockResolvedValue(true),
  addProofToAction: vi.fn().mockResolvedValue(true),
  fetchActionLineage: vi.fn().mockResolvedValue([]),
  getActionExplanation: vi.fn().mockResolvedValue(null),
  findStuckActions: vi.fn().mockResolvedValue([]),
}));

describe("ActionLineageService", () => {
  it("creates service instance via singleton", async () => {
    const { getActionLineageService } = await import("@/lib/core-services/action-lineage-service");
    const svc = getActionLineageService();
    expect(svc).toBeTruthy();
    expect(svc.getActiveCount()).toBeGreaterThanOrEqual(0);
  });

  it("creates fresh instance", async () => {
    const { createActionLineageService } = await import("@/lib/core-services/action-lineage-service");
    const svc = createActionLineageService();
    expect(svc).toBeTruthy();
  });

  it("links event to action", async () => {
    const { createActionLineageService } = await import("@/lib/core-services/action-lineage-service");
    const svc = createActionLineageService();
    const result = await svc.linkEvent("action-1", "event-1");
    expect(typeof result).toBe("boolean");
  });

  it("links receipt to action", async () => {
    const { createActionLineageService } = await import("@/lib/core-services/action-lineage-service");
    const svc = createActionLineageService();
    const result = await svc.linkReceipt("action-1", "receipt-1");
    expect(typeof result).toBe("boolean");
  });

  it("queries actions", async () => {
    const { createActionLineageService } = await import("@/lib/core-services/action-lineage-service");
    const svc = createActionLineageService();
    const result = await svc.queryActions({ domain: "test" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("finds stuck actions", async () => {
    const { createActionLineageService } = await import("@/lib/core-services/action-lineage-service");
    const svc = createActionLineageService();
    const result = await svc.findStuck(5000);
    expect(Array.isArray(result)).toBe(true);
  });
});
