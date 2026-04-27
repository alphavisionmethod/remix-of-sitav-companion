import { describe, it, expect } from "vitest";
import { reconcileCalendars } from "@/lib/services/concierge-os/reconciliation.service";

describe("reconcileCalendars", () => {
  it("returns no conflicts for non-overlapping events", () => {
    const out = reconcileCalendars([
      { id: "a", title: "1", start: "2026-05-01T10:00:00Z", end: "2026-05-01T11:00:00Z", attendees: [] } as never,
      { id: "b", title: "2", start: "2026-05-01T11:00:00Z", end: "2026-05-01T12:00:00Z", attendees: [] } as never,
    ]);
    expect(out.totalEvents).toBe(2);
    expect(out.conflicts).toHaveLength(0);
  });

  it("detects an overlap and reports overlap minutes", () => {
    const out = reconcileCalendars([
      { id: "a", title: "1", start: "2026-05-01T10:00:00Z", end: "2026-05-01T11:30:00Z", attendees: [] } as never,
      { id: "b", title: "2", start: "2026-05-01T11:00:00Z", end: "2026-05-01T12:00:00Z", attendees: [] } as never,
    ]);
    expect(out.conflicts).toHaveLength(1);
    expect(out.conflicts[0].overlapMinutes).toBe(30);
  });

  it("handles a single event without crashing", () => {
    const out = reconcileCalendars([
      { id: "a", title: "1", start: "2026-05-01T10:00:00Z", end: "2026-05-01T11:00:00Z", attendees: [] } as never,
    ]);
    expect(out.conflicts).toHaveLength(0);
    expect(out.totalEvents).toBe(1);
  });
});