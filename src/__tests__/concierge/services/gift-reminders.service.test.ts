import { describe, it, expect } from "vitest";
import {
  getUpcomingGiftReminders,
  filterUrgent,
} from "@/lib/services/concierge-os/gift-reminders.service";

describe("gift-reminders.service", () => {
  it("returns at least one reminder with budget and ideas", () => {
    const out = getUpcomingGiftReminders();
    expect(out.length).toBeGreaterThan(0);
    expect(out[0].ideas.length).toBeGreaterThan(0);
    expect(out[0].budgetCents).toBeGreaterThan(0);
    expect(out[0].purchased).toBe(false);
  });

  it("filterUrgent keeps reminders within threshold and excludes purchased", () => {
    const out = filterUrgent(
      [
        { id: "a", recipientName: "x", occasion: "Bday", date: "", daysUntil: 7, budgetCents: 0, ideas: [], purchased: false },
        { id: "b", recipientName: "y", occasion: "Bday", date: "", daysUntil: 5, budgetCents: 0, ideas: [], purchased: true },
        { id: "c", recipientName: "z", occasion: "Bday", date: "", daysUntil: 30, budgetCents: 0, ideas: [], purchased: false },
      ],
      14,
    );
    expect(out.map((r) => r.id)).toEqual(["a"]);
  });
});