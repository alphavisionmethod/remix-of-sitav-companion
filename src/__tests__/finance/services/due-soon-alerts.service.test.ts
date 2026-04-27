import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  generateDueSoonAlerts,
  countUpcomingTotal,
} from "@/lib/services/finance-os/due-soon-alerts.service";
import { makeObligation, fixedNow, daysAhead, daysAgo } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("due-soon-alerts.service", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedNow()));
  });
  afterAll(() => vi.useRealTimers());

  it("flags overdue obligations as urgent", () => {
    const out = generateDueSoonAlerts([
      makeObligation({ id: "o1", nextDueDate: daysAgo(2), status: "due" }),
    ]);
    expect(out[0].severity).toBe("urgent");
    expect(out[0].message).toMatch(/overdue/);
  });

  it("flags 1-2 days out as warning", () => {
    const out = generateDueSoonAlerts([
      makeObligation({ id: "o2", nextDueDate: daysAhead(1), status: "upcoming" }),
    ]);
    expect(out[0].severity).toBe("warning");
  });

  it("respects the lookahead window", () => {
    const out = generateDueSoonAlerts(
      [makeObligation({ id: "o3", nextDueDate: daysAhead(20), status: "upcoming" })],
      7,
    );
    expect(out).toHaveLength(0);
  });

  it("countUpcomingTotal sums alert amounts", () => {
    const total = countUpcomingTotal([
      { obligationId: "x", name: "n", amountCents: 100, dueDate: "", daysUntilDue: 0, severity: "info", hasAutoPay: false, message: "" },
      { obligationId: "y", name: "n", amountCents: 250, dueDate: "", daysUntilDue: 1, severity: "info", hasAutoPay: false, message: "" },
    ]);
    expect(total).toBe(350);
  });
});