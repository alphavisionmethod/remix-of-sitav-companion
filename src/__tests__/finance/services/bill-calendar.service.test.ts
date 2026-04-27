import { describe, it, expect } from "vitest";
import {
  buildBillCalendar,
  getNextDueBills,
} from "@/lib/services/finance-os/bill-calendar.service";
import { makeObligation, daysAhead } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("bill-calendar.service", () => {
  it("builds the requested number of months", () => {
    const cal = buildBillCalendar([], 4);
    expect(cal).toHaveLength(4);
    expect(cal[0].totalDueCents).toBe(0);
  });

  it("groups multiple obligations on the same day into a single calendar day", () => {
    const sameDay = daysAhead(2);
    const cal = buildBillCalendar(
      [
        makeObligation({ id: "a", nextDueDate: sameDay, amountCents: 100_000 }),
        makeObligation({ id: "b", nextDueDate: sameDay, amountCents: 50_000 }),
      ],
      1,
    );
    const month = cal[0];
    expect(month.obligationCount).toBe(2);
    expect(month.totalDueCents).toBe(150_000);
    expect(month.days).toHaveLength(1);
  });

  it("getNextDueBills returns the requested count sorted ascending by due date", () => {
    const list = getNextDueBills(
      [
        makeObligation({ id: "later", nextDueDate: daysAhead(20), status: "upcoming" }),
        makeObligation({ id: "soon", nextDueDate: daysAhead(2), status: "upcoming" }),
      ],
      5,
    );
    expect(list[0].id).toBe("soon");
  });

  it("ignores paid/cancelled obligations in next-due ranking", () => {
    const list = getNextDueBills(
      [makeObligation({ id: "paid", status: "paid" as never, nextDueDate: daysAhead(1) })],
      5,
    );
    expect(list).toHaveLength(0);
  });
});