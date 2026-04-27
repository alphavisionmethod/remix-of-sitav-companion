import { describe, it, expect } from "vitest";
import { detectSubscriptions } from "@/lib/services/finance-os/subscription-detector.service";
import { makeTransaction, daysAgo } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("detectSubscriptions", () => {
  it("groups recurring debits by merchant and infers monthly frequency", () => {
    const txs = [
      makeTransaction({ id: "t1", merchantName: "Netflix", amountCents: -1599, isRecurring: true, type: "debit", date: daysAgo(60) } as never),
      makeTransaction({ id: "t2", merchantName: "Netflix", amountCents: -1599, isRecurring: true, type: "debit", date: daysAgo(30) } as never),
      makeTransaction({ id: "t3", merchantName: "Netflix", amountCents: -1599, isRecurring: true, type: "debit", date: daysAgo(0) } as never),
    ];
    const out = detectSubscriptions(txs);
    expect(out.length).toBe(1);
    expect(out[0].frequency).toBe("monthly");
  });

  it("ignores merchants with fewer than 2 charges", () => {
    const txs = [
      makeTransaction({ id: "t1", merchantName: "OneOff Co", isRecurring: true, type: "debit" } as never),
    ];
    expect(detectSubscriptions(txs)).toHaveLength(0);
  });

  it("ignores non-recurring transactions even if duplicated", () => {
    const txs = [
      makeTransaction({ id: "t1", merchantName: "Coffee Shop", isRecurring: false, type: "debit" } as never),
      makeTransaction({ id: "t2", merchantName: "Coffee Shop", isRecurring: false, type: "debit" } as never),
    ];
    expect(detectSubscriptions(txs)).toHaveLength(0);
  });
});