import { describe, it, expect } from "vitest";
import {
  summarizeLedger,
  type RecoveredValueEntry,
} from "@/lib/services/business-os/recovered-value-ledger.service";

function entry(p: Partial<RecoveredValueEntry> = {}): RecoveredValueEntry {
  return {
    id: "e1",
    leakId: "l1",
    recoveryPlanId: "p1",
    amountCents: 10_000,
    recoveredAt: new Date().toISOString(),
    method: "auto-reminder",
    accountId: "a1",
    accountName: "Acme",
    invoiceId: "inv-1",
    ...p,
  };
}

describe("recovered-value-ledger.service", () => {
  it("sums total recovered cents across entries", () => {
    const sum = summarizeLedger([entry({ amountCents: 100 }), entry({ amountCents: 250 })], 1000, "Q1");
    expect(sum.totalRecoveredCents).toBe(350);
    expect(sum.totalEntriesCount).toBe(2);
  });

  it("computes recovery rate against total leaked cents", () => {
    const sum = summarizeLedger([entry({ amountCents: 250 })], 1000, "Q1");
    expect(sum.recoveryRate).toBe(25);
  });

  it("returns 0 recovery rate when no leaks (no division-by-zero)", () => {
    const sum = summarizeLedger([entry({ amountCents: 100 })], 0, "Q1");
    expect(sum.recoveryRate).toBe(0);
  });

  it("groups by method with counts and totals", () => {
    const sum = summarizeLedger([
      entry({ id: "1", method: "auto-reminder", amountCents: 100 }),
      entry({ id: "2", method: "auto-reminder", amountCents: 200 }),
      entry({ id: "3", method: "collections", amountCents: 500 }),
    ], 1000, "Q1");
    const auto = sum.byMethod.find(m => m.method === "auto-reminder");
    const collections = sum.byMethod.find(m => m.method === "collections");
    expect(auto?.count).toBe(2);
    expect(auto?.amountCents).toBe(300);
    expect(collections?.count).toBe(1);
    expect(collections?.amountCents).toBe(500);
  });

  it("propagates the period label and stamps generatedAt", () => {
    const sum = summarizeLedger([], 0, "FY2026");
    expect(sum.period).toBe("FY2026");
    expect(typeof sum.generatedAt).toBe("string");
  });
});
