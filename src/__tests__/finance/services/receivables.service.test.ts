import { describe, it, expect } from "vitest";
import {
  buildAgingReport,
  flagOverdueReceivables,
} from "@/lib/services/finance-os/receivables.service";
import { makeReceivable } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("receivables.service", () => {
  it("buckets receivables by aging window", () => {
    const out = buildAgingReport([
      makeReceivable({ id: "a", agingDays: 5, amountCents: 100_000 }),
      makeReceivable({ id: "b", agingDays: 45, amountCents: 200_000 }),
      makeReceivable({ id: "c", agingDays: 75, amountCents: 300_000 }),
      makeReceivable({ id: "d", agingDays: 120, amountCents: 400_000 }),
    ]);
    expect(out.current.totalCents).toBe(100_000);
    expect(out.thirtyDay.totalCents).toBe(200_000);
    expect(out.sixtyDay.totalCents).toBe(300_000);
    expect(out.ninetyPlus.totalCents).toBe(400_000);
    expect(out.totalOutstandingCents).toBe(1_000_000);
    expect(out.averageAgingDays).toBeGreaterThan(0);
  });

  it("ignores received and written-off receivables", () => {
    const out = buildAgingReport([
      makeReceivable({ id: "x", status: "received", agingDays: 5, amountCents: 999_999 }),
      makeReceivable({ id: "y", status: "written-off", agingDays: 5, amountCents: 999_999 }),
    ]);
    expect(out.totalOutstandingCents).toBe(0);
    expect(out.averageAgingDays).toBe(0);
  });

  it("flagOverdueReceivables filters by aging threshold", () => {
    const out = flagOverdueReceivables(
      [
        makeReceivable({ id: "a", agingDays: 10 }),
        makeReceivable({ id: "b", agingDays: 50 }),
      ],
      30,
    );
    expect(out.map((r) => r.id)).toEqual(["b"]);
  });
});