import { describe, it, expect } from "vitest";
import { prioritizeTasks, scoreBookingOptions, detectConflicts, buildItinerary, evaluateRoutineHealth, optimizeErrands, coordinateHousehold } from "@/lib/domain-engines/concierge-os";
import type { Task, BookingOption, CalendarEvent, Routine, Errand, ConciergeHouseholdMember } from "@/packages/contracts";

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "T-1", title: "Test task", status: "pending", priority: "medium", category: "household",
  estimatedMinutes: 30, dueDate: Date.now() + 86400000, energyLevel: "medium", recurring: false, ...overrides,
});
const makeErrand = (overrides: Partial<Errand> = {}): Errand => ({
  id: "E-1", name: "Errand", location: "Mall", estimatedMinutes: 20, priority: "medium", canBeCombined: true, category: "shopping", ...overrides,
});
const makeMember = (overrides: Partial<ConciergeHouseholdMember> = {}): ConciergeHouseholdMember => ({
  id: "M-1", name: "Parent A", role: "adult", taskCapacity: 5, currentLoad: 0, preferences: [], availability: [], ...overrides,
});

describe("Concierge OS — prioritizeTasks", () => {
  it("sorts by score descending", () => {
    const r = prioritizeTasks([makeTask({ id: "T-1", priority: "low", estimatedMinutes: 120 }), makeTask({ id: "T-2", priority: "urgent", estimatedMinutes: 10, dueDate: Date.now() + 3600000 })]);
    expect(r.prioritized[0].id).toBe("T-2");
  });
  it("filters blocked and deferred", () => {
    const r = prioritizeTasks([makeTask({ status: "pending" }), makeTask({ id: "T-2", status: "blocked" }), makeTask({ id: "T-3", status: "deferred" })]);
    expect(r.prioritized.length).toBe(1);
    expect(r.blocked.length).toBe(1);
    expect(r.deferred.length).toBe(1);
  });
  it("builds focus block within 90 min", () => {
    const r = prioritizeTasks([makeTask({ estimatedMinutes: 30, priority: "high" }), makeTask({ id: "T-2", estimatedMinutes: 40, priority: "high" })]);
    expect(r.suggestedFocusBlock.totalMinutes).toBeLessThanOrEqual(90);
  });
});

describe("Concierge OS — scoreBookingOptions", () => {
  const opts: BookingOption[] = [
    { id: "B-1", type: "hotel", provider: "Booking.com", name: "Hotel A", price: 200, rating: 4.5, reviewCount: 500, preferences: ["wifi","pool"], cancellable: true, refundable: true },
    { id: "B-2", type: "hotel", provider: "Expedia", name: "Hotel B", price: 100, rating: 3.0, reviewCount: 10, preferences: ["wifi"], cancellable: false, refundable: false },
  ];
  it("scores and sorts", () => {
    const r = scoreBookingOptions(opts, ["wifi","pool"]);
    expect(r[0].score).toBeGreaterThanOrEqual(r[1].score);
  });
  it("identifies tradeoffs", () => {
    const r = scoreBookingOptions(opts);
    expect(r.find(x => x.id === "B-2")!.tradeoffs.some(t => t.includes("Non-refundable"))).toBe(true);
  });
});

describe("Concierge OS — detectConflicts", () => {
  it("detects overlapping events", () => {
    const now = Date.now();
    const events: CalendarEvent[] = [
      { id: "E-1", title: "A", startTime: now, endTime: now + 3600000, bufferMinutes: 0, isFixed: true, category: "work" },
      { id: "E-2", title: "B", startTime: now + 1800000, endTime: now + 5400000, bufferMinutes: 0, isFixed: false, category: "work" },
    ];
    const r = detectConflicts(events);
    expect(r.conflicts.length).toBe(1);
  });
  it("handles empty events", () => {
    expect(detectConflicts([]).conflicts.length).toBe(0);
  });
});

describe("Concierge OS — buildItinerary", () => {
  it("builds multi-day itinerary", () => {
    const r = buildItinerary("Paris", "2026-05-01", "2026-05-03", [{ name: "Museum", duration: 120, cost: 20, type: "activity" }]);
    expect(r.length).toBe(2);
    expect(r[0].items.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Concierge OS — evaluateRoutineHealth", () => {
  it("returns default for empty", () => {
    expect(evaluateRoutineHealth([]).overallScore).toBe(50);
  });
  it("evaluates thriving routines", () => {
    const routines: Routine[] = [{ id: "R-1", name: "Jog", type: "morning", tasks: ["run"], completionRate: 0.95, streakDays: 21, averageDurationMinutes: 30 }];
    const r = evaluateRoutineHealth(routines);
    expect(r.routines[0].health).toBe("thriving");
  });
});

describe("Concierge OS — optimizeErrands", () => {
  it("groups by location", () => {
    const r = optimizeErrands([makeErrand({ id: "E-1", location: "Mall" }), makeErrand({ id: "E-2", location: "Mall" }), makeErrand({ id: "E-3", location: "Downtown" })]);
    expect(r.combinedStops.length).toBe(1);
  });
  it("sorts by priority", () => {
    const r = optimizeErrands([makeErrand({ id: "E-1", priority: "low" }), makeErrand({ id: "E-2", priority: "high" })]);
    expect(r.optimizedOrder[0].id).toBe("E-2");
  });
});

describe("Concierge OS — coordinateHousehold", () => {
  const members = [makeMember({ id: "M-1" }), makeMember({ id: "M-2", name: "Parent B" }), makeMember({ id: "M-3", name: "Child", role: "child", taskCapacity: 2 })];
  it("identifies unassigned tasks", () => {
    const r = coordinateHousehold(members, [makeTask()]);
    expect(r.unassignedTasks.length).toBe(1);
    expect(r.suggestedAssignments.length).toBe(1);
  });
  it("restricts child assignments", () => {
    const r = coordinateHousehold(members, [makeTask({ category: "maintenance" })]);
    expect(r.suggestedAssignments[0]?.member.role).not.toBe("child");
  });
});
