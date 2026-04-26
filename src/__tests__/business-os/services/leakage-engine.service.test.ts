import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { detectLeakageComprehensive } from "@/lib/services/business-os/leakage-engine.service";
import { makeInvoice, makeOverdueInvoice } from "../_helpers/business-fixtures-extra";
import { fixedNow } from "../_helpers/business-fixtures";

describe("leakage-engine.service", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(fixedNow())); });
  afterEach(() => vi.useRealTimers());

  it("emits a leak per overdue invoice", () => {
    const leaks = detectLeakageComprehensive([
      makeOverdueInvoice(20, 500, "i1"),
      makeOverdueInvoice(70, 500, "i2"),
    ]);
    expect(leaks.filter(l => l.id.startsWith("leak-inv-"))).toHaveLength(2);
  });

  it("escalates >60-day overdue invoices to collections", () => {
    const leaks = detectLeakageComprehensive([makeOverdueInvoice(70, 500, "old")]);
    const leak = leaks.find(l => l.entityId === "old")!;
    expect(leak.suggestedRecoveryAction).toBe("Escalate to collections");
  });

  it("recommends a friendly reminder for ≤60-day overdue invoices", () => {
    const leaks = detectLeakageComprehensive([makeOverdueInvoice(20, 500, "fresh")]);
    const leak = leaks.find(l => l.entityId === "fresh")!;
    expect(leak.suggestedRecoveryAction).toBe("Send automated reminder");
  });

  it("flags significantly underpriced PAID invoices (<50% of average)", () => {
    const invoices = [
      makeInvoice({ id: "big1", amount: 1000, status: "paid" }),
      makeInvoice({ id: "big2", amount: 1000, status: "paid" }),
      makeInvoice({ id: "tiny", amount: 100, status: "paid" }),
    ];
    const leaks = detectLeakageComprehensive(invoices);
    expect(leaks.find(l => l.id === "leak-price-tiny")).toBeDefined();
    expect(leaks.find(l => l.id === "leak-price-big1")).toBeUndefined();
  });

  it("returns empty array when no invoices supplied", () => {
    expect(detectLeakageComprehensive([])).toEqual([]);
  });

  it("clamps confidence at 95 even for very aged invoices", () => {
    const leaks = detectLeakageComprehensive([makeOverdueInvoice(365, 500, "ancient")]);
    const leak = leaks.find(l => l.entityId === "ancient")!;
    expect(leak.confidence).toBe(95);
  });
});
