import { describe, it, expect } from "vitest";
import {
  detectConflicts,
  suggestResolutions,
} from "@/lib/services/concierge-os/conflict-detector.service";
import { makeCalendarEvent } from "@/__tests__/concierge/_helpers/concierge-fixtures";

const at = (iso: string, mins: number) =>
  new Date(new Date(iso).getTime() + mins * 60000).toISOString();

describe("conflict-detector service", () => {
  it("detects overlapping events and computes overlap minutes", () => {
    const start = "2026-04-15T09:00:00Z";
    const events = [
      makeCalendarEvent({ id: "a", start, end: at(start, 60), title: "Standup" }),
      makeCalendarEvent({ id: "b", start: at(start, 30), end: at(start, 90), title: "Vendor call" }),
      makeCalendarEvent({ id: "c", start: at(start, 120), end: at(start, 180), title: "School run" }),
    ];

    const conflicts = detectConflicts(events);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].eventA.id).toBe("a");
    expect(conflicts[0].eventB.id).toBe("b");
    expect(conflicts[0].overlapMinutes).toBe(30);
  });

  it("returns empty array when no events overlap", () => {
    const start = "2026-04-15T09:00:00Z";
    const events = [
      makeCalendarEvent({ id: "a", start, end: at(start, 30) }),
      makeCalendarEvent({ id: "b", start: at(start, 60), end: at(start, 90) }),
    ];
    expect(detectConflicts(events)).toEqual([]);
  });

  it("flags small overlaps as auto-resolvable and large as not", () => {
    const start = "2026-04-15T09:00:00Z";
    const tinyOverlap = [
      makeCalendarEvent({ id: "a", start, end: at(start, 20) }),
      makeCalendarEvent({ id: "b", start: at(start, 10), end: at(start, 40), title: "Quick sync" }),
    ];
    const tinyResolutions = suggestResolutions(detectConflicts(tinyOverlap));
    expect(tinyResolutions[0].autoResolvable).toBe(true);
    expect(tinyResolutions[0].suggestion).toMatch(/15 min/);

    const bigOverlap = [
      makeCalendarEvent({ id: "a", start, end: at(start, 120) }),
      makeCalendarEvent({ id: "b", start: at(start, 30), end: at(start, 150), title: "Long meeting" }),
    ];
    const bigResolutions = suggestResolutions(detectConflicts(bigOverlap));
    expect(bigResolutions[0].autoResolvable).toBe(false);
    expect(bigResolutions[0].suggestion).toMatch(/Reschedule/);
  });
});