import { describe, it, expect } from "vitest";
import {
  categorizeTransaction,
  aggregateSpend,
} from "@/lib/services/finance-os/transaction-categorizer.service";
import { makeTransaction } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("transaction-categorizer service", () => {
  it("categorizes via the default rule pack on description match", () => {
    const tx = categorizeTransaction(
      makeTransaction({ description: "Whole Foods Market" }),
    );
    expect(tx.category).toBe("Groceries");
    expect(tx.categorizedBy).toBe("rule");
  });

  it("recognises streaming subscriptions with subcategory", () => {
    const tx = categorizeTransaction(
      makeTransaction({ description: "NETFLIX MONTHLY" }),
    );
    expect(tx.category).toBe("Entertainment");
    expect(tx.subcategory).toBe("Streaming");
  });

  it("aggregates spend across categories with correct percentages", () => {
    const txs = [
      makeTransaction({ id: "1", category: "Groceries", amountCents: -10_000 }),
      makeTransaction({ id: "2", category: "Groceries", amountCents: -20_000 }),
      makeTransaction({ id: "3", category: "Dining", amountCents: -10_000 }),
      makeTransaction({ id: "4", category: "Income", amountCents: 50_000, type: "credit" }),
    ];
    const summary = aggregateSpend(txs);
    const groc = summary.find((s) => s.category === "Groceries")!;
    const dining = summary.find((s) => s.category === "Dining")!;
    expect(summary.find((s) => s.category === "Income")).toBeUndefined();
    expect(groc.transactionCount).toBe(2);
    expect(groc.totalCents).toBe(30_000);
    expect(groc.percentOfTotal + dining.percentOfTotal).toBe(100);
  });
});