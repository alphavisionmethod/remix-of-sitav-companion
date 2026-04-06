import { describe, it, expect } from "vitest";
import { BillingService } from "../index";

describe("BillingService", () => {
  it("registers and retrieves a plan", () => {
    const svc = new BillingService();
    svc.registerPlan({ id: "p1", name: "Pro", tier: "pro", price: 99, currency: "USD", features: ["all"], limits: { api_calls: 10000 } });
    expect(svc.getPlan("p1")?.name).toBe("Pro");
  });

  it("lists all plans", () => {
    const svc = new BillingService();
    svc.registerPlan({ id: "p1", name: "Free", tier: "free", price: 0, currency: "USD", features: [], limits: {} });
    svc.registerPlan({ id: "p2", name: "Pro", tier: "pro", price: 99, currency: "USD", features: [], limits: {} });
    expect(svc.listPlans().length).toBe(2);
  });

  it("records usage and checks limits", () => {
    const svc = new BillingService();
    svc.registerPlan({ id: "p1", name: "Free", tier: "free", price: 0, currency: "USD", features: [], limits: { api_calls: 100 } });
    svc.recordUsage({ metricName: "api_calls", quantity: 50, recordedAt: "2026-01-01", userId: "u1" });
    const check = svc.checkLimit("u1", "api_calls", "p1");
    expect(check.within).toBe(true);
    expect(check.used).toBe(50);
    expect(check.limit).toBe(100);
  });

  it("detects limit exceeded", () => {
    const svc = new BillingService();
    svc.registerPlan({ id: "p1", name: "Free", tier: "free", price: 0, currency: "USD", features: [], limits: { api_calls: 10 } });
    svc.recordUsage({ metricName: "api_calls", quantity: 15, recordedAt: "2026-01-01", userId: "u1" });
    expect(svc.checkLimit("u1", "api_calls", "p1").within).toBe(false);
  });

  it("generates invoice", () => {
    const svc = new BillingService();
    svc.registerPlan({ id: "p1", name: "Pro", tier: "pro", price: 99, currency: "USD", features: [], limits: {} });
    const inv = svc.generateInvoice("u1", "p1", "2026-01-01", "2026-02-01");
    expect(inv.amount).toBe(99);
    expect(inv.status).toBe("draft");
    expect(inv.lineItems.length).toBe(1);
  });

  it("serializes and hydrates state", () => {
    const svc = new BillingService();
    svc.registerPlan({ id: "p1", name: "Pro", tier: "pro", price: 99, currency: "USD", features: [], limits: {} });
    svc.generateInvoice("u1", "p1", "2026-01-01", "2026-02-01");
    const state = svc.serialize();
    const svc2 = new BillingService();
    svc2.hydrate(state);
    expect(svc2.getInvoices("u1").length).toBe(1);
  });
});
