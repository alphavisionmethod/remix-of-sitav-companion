import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/persistence/universal-service-persistence", () => ({
  loadServiceState: vi.fn(() => Promise.resolve(null)),
  debouncedSaveServiceState: vi.fn(),
}));

import { PaymentExecutionService } from "../index";

describe("PaymentExecutionService", () => {
  it("initiates a payment", () => {
    const svc = new PaymentExecutionService();
    const p = svc.initiate(100, "USD", "card", "r1");
    expect(p.amount).toBe(100);
    expect(p.status).toBe("pending");
    expect(p.currency).toBe("USD");
  });

  it("processes a pending payment", () => {
    const svc = new PaymentExecutionService();
    const p = svc.initiate(50, "USD", "bank", "r1");
    expect(svc.process(p.id)).toBe(true);
    expect(svc.getPayment(p.id)?.status).toBe("processing");
  });

  it("completes a payment with reference", () => {
    const svc = new PaymentExecutionService();
    const p = svc.initiate(200, "EUR", "card", "r2");
    svc.process(p.id);
    expect(svc.complete(p.id, "REF-123")).toBe(true);
    const updated = svc.getPayment(p.id);
    expect(updated?.status).toBe("completed");
    expect(updated?.reference).toBe("REF-123");
  });

  it("fails a payment", () => {
    const svc = new PaymentExecutionService();
    const p = svc.initiate(75, "USD", "card", "r3");
    expect(svc.fail(p.id)).toBe(true);
    expect(svc.getPayment(p.id)?.status).toBe("failed");
  });

  it("lists payments by status", () => {
    const svc = new PaymentExecutionService();
    svc.initiate(100, "USD", "card", "r1");
    svc.initiate(200, "USD", "card", "r2");
    const p3 = svc.initiate(300, "USD", "card", "r3");
    svc.process(p3.id);
    expect(svc.listPayments("pending").length).toBe(2);
    expect(svc.listPayments("processing").length).toBe(1);
  });

  it("serializes and hydrates", () => {
    const svc = new PaymentExecutionService();
    svc.initiate(100, "USD", "card", "r1");
    const state = svc.serialize();
    const svc2 = new PaymentExecutionService();
    svc2.hydrate(state);
    expect(svc2.listPayments().length).toBe(1);
  });
});
