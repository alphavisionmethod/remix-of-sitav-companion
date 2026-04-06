import { describe, it, expect } from "vitest";
import {
  prioritizeTasks,
  scoreBookingOptions,
  detectConflicts,
  buildItinerary,
  evaluateRoutineHealth,
  optimizeErrands,
  coordinateHousehold,
} from "@/lib/domain-engines/concierge-os";
import type { Task, BookingOption, CalendarEvent, Routine, Errand, ConciergeHouseholdMember } from "@/packages/contracts";

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "T-1", title: "Test task", status: "pending", priority: "medium",
  category: "household", estimatedMinutes: 30, dueDate: Date.now() + 86400000,
  energyLevel: "medium", assignedTo: undefined, ...overrides,
});

describe("Concierge OS — prioritizeTasks", () => {
  it("sorts by score descending", () => {
    const tasks = [
      makeTask({ id: "T-1", priority: "low", estimatedMinutes: 120 }),
      makeTask({ id: "T-2", priority: "urgent", estimatedMinutes: 10, dueDate: Date.now() + 3600000 }),
    ];
    const result = prioritizeTasks(tasks);
    expect(result.prioritized[0].id).toBe("T-2");
    expect(result.prioritized[0].score).toBeGreaterThan(result.prioritized[1].score);
  });

  it("filters blocked and deferred tasks", () => {
    const tasks = [
      makeTask({ id: "T-1", status: "pending" }),
      makeTask({ id: "T-2", status: "blocked" }),
      makeTask({ id: "T-3", status: "deferred" }),
    ];
    const result = prioritizeTasks(tasks);
    expect(result.prioritized.length).toBe(1);
    expect(result.blocked.length).toBe(1);
    expect(result.deferred.length).toBe(1);
  });

  it("builds focus block within 90 minutes", () => {
    const tasks = [
      makeTask({ id: "T-1", estimatedMinutes: 30, priority: "high" }),
      makeTask({ id: "T-2", estimatedMinutes: 40, priority: "high" }),
      makeTask({ id: "T-3", estimatedMinutes: 120, priority: "medium" }),
    ];
    const result = prioritizeTasks(tasks);
    expect(result.suggestedFocusBlock.totalMinutes).toBeLessThanOrEqual(90);
    expect(result.suggestedFocusBlock.tasks.length).toBeGreaterThanOrEqual(1);
  });

  it("gives bonus to quick-win tasks", () => {
    const quick = makeTask({ id: "T-1", estimatedMinutes: 10, priority: "medium" });
    const long = makeTask({ id: "T-2", estimatedMinutes: 120, priority: "medium" });
    const result = prioritizeTasks([quick, long]);
    const quickScore = result.prioritized.find(t => t.id === "T-1")!.score;
    const longScore = result.prioritized.find(t => t.id === "T-2")!.score;
    expect(quickScore).toBeGreaterThan(longScore);
  });

  it("handles overdue tasks with high urgency", () => {
    const overdue = makeTask({ dueDate: Date.now() - 86400000, priority: "medium" });
    const result = prioritizeTasks([overdue]);
    expect(result.prioritized[0].score).toBeGreaterThanOrEqual(50);
  });
});

describe("Concierge OS — scoreBookingOptions", () => {
  const options: BookingOption[] = [
    { id: "B-1", name: "Hotel A", price: 200, rating: 4.5, reviewCount: 500, preferences: ["wifi", "pool"], cancellable: true, refundable: true },
    { id: "B-2", name: "Hotel B", price: 100, rating: 3.0, reviewCount: 10, preferences: ["wifi"], cancellable: false, refundable: false },
  ];

  it("scores and sorts options", () => {
    const result = scoreBookingOptions(options, ["wifi", "pool"]);
    expect(result.length).toBe(2);
    expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
  });

  it("identifies tradeoffs", () => {
    const result = scoreBookingOptions(options);
    const hotelB = result.find(r => r.id === "B-2")!;
    expect(hotelB.tradeoffs.some(t => t.includes("Non-refundable"))).toBe(true);
  });

  it("assigns recommendations", () => {
    const result = scoreBookingOptions(options, ["wifi", "pool"]);
    expect(["strong", "good", "acceptable", "weak"]).toContain(result[0].recommendation);
  });
});

describe("Concierge OS — detectConflicts", () => {
  it("detects overlapping events", () => {
    const now = Date.now();
    const events: CalendarEvent[] = [
      { id: "E-1", title: "Meeting A", startTime: now, endTime: now + 3600000, bufferMinutes: 0, isFixed: true, location: "Office", priority: "high" },
      { id: "E-2", title: "Meeting B", startTime: now + 1800000, endTime: now + 5400000, bufferMinutes: 0, isFixed: false, location: "Remote", priority: "medium" },
    ];
    const result = detectConflicts(events);
    expect(result.conflicts.length).toBe(1);
    expect(result.conflicts[0].overlapMinutes).toBe(30);
  });

  it("warns on tight gaps", () => {
    const now = Date.now();
    const events: CalendarEvent[] = [
      { id: "E-1", title: "A", startTime: now, endTime: now + 3600000, bufferMinutes: 30, isFixed: true, location: "", priority: "medium" },
      { id: "E-2", title: "B", startTime: now + 3600000 + 600000, endTime: now + 7200000, bufferMinutes: 0, isFixed: false, location: "", priority: "medium" },
    ];
    const result = detectConflicts(events);
    expect(result.warnings.length).toBeGreaterThanOrEqual(1);
  });

  it("handles empty events", () => {
    const result = detectConflicts([]);
    expect(result.conflicts.length).toBe(0);
    expect(result.warnings.length).toBe(0);
  });
});

describe("Concierge OS — buildItinerary", () => {
  it("builds multi-day itinerary", () => {
    const activities = [
      { name: "Museum", duration: 120, cost: 20, type: "activity" as const, timePreference: "morning" as const },
      { name: "Show", duration: 180, cost: 80, type: "activity" as const, timePreference: "evening" as const },
    ];
    const result = buildItinerary("Paris", "2026-05-01", "2026-05-03", activities);
    expect(result.length).toBe(2);
    expect(result[0].items.length).toBeGreaterThanOrEqual(2);
    expect(result[0].totalCost).toBeGreaterThan(0);
  });

  it("includes budget warnings", () => {
    const activities = [
      { name: "Expensive Tour", duration: 240, cost: 500, type: "activity" as const },
    ];
    const result = buildItinerary("Tokyo", "2026-06-01", "2026-06-02", activities, 100);
    expect(result[0].notes.some(n => n.includes("budget"))).toBe(true);
  });
});

describe("Concierge OS — evaluateRoutineHealth", () => {
  it("returns default for empty routines", () => {
    const result = evaluateRoutineHealth([]);
    expect(result.overallScore).toBe(50);
  });

  it("evaluates thriving routines", () => {
    const routines: Routine[] = [
      { id: "R-1", name: "Morning jog", completionRate: 0.95, streakDays: 21, frequency: "daily", category: "health" },
    ];
    const result = evaluateRoutineHealth(routines);
    expect(result.overallScore).toBe(100);
    expect(result.routines[0].health).toBe("thriving");
  });

  it("identifies broken routines", () => {
    const routines: Routine[] = [
      { id: "R-1", name: "Meditation", completionRate: 0.2, streakDays: 0, frequency: "daily", category: "wellness" },
    ];
    const result = evaluateRoutineHealth(routines);
    expect(result.routines[0].health).toBe("broken");
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});

describe("Concierge OS — optimizeErrands", () => {
  it("returns empty for no errands", () => {
    const result = optimizeErrands([]);
    expect(result.totalEstimatedMinutes).toBe(0);
    expect(result.savedMinutes).toBe(0);
  });

  it("groups errands by location", () => {
    const errands: Errand[] = [
      { id: "E-1", name: "Groceries", location: "Mall", estimatedMinutes: 30, priority: "high" },
      { id: "E-2", name: "Dry cleaning", location: "Mall", estimatedMinutes: 10, priority: "low" },
      { id: "E-3", name: "Bank", location: "Downtown", estimatedMinutes: 20, priority: "medium" },
    ];
    const result = optimizeErrands(errands);
    expect(result.combinedStops.length).toBe(1);
    expect(result.combinedStops[0].errands.length).toBe(2);
    expect(result.savedMinutes).toBeGreaterThanOrEqual(0);
  });

  it("sorts by priority", () => {
    const errands: Errand[] = [
      { id: "E-1", name: "Low", location: "A", estimatedMinutes: 10, priority: "low" },
      { id: "E-2", name: "High", location: "B", estimatedMinutes: 10, priority: "high" },
    ];
    const result = optimizeErrands(errands);
    expect(result.optimizedOrder[0].id).toBe("E-2");
  });
});

describe("Concierge OS — coordinateHousehold", () => {
  const members: ConciergeHouseholdMember[] = [
    { id: "M-1", name: "Parent A", role: "parent", taskCapacity: 5 },
    { id: "M-2", name: "Parent B", role: "parent", taskCapacity: 5 },
    { id: "M-3", name: "Child A", role: "child", taskCapacity: 2 },
  ];

  it("identifies unassigned tasks", () => {
    const tasks = [makeTask({ assignedTo: undefined })];
    const result = coordinateHousehold(members, tasks);
    expect(result.unassignedTasks.length).toBe(1);
    expect(result.suggestedAssignments.length).toBe(1);
  });

  it("calculates fairness score", () => {
    const tasks = [
      makeTask({ id: "T-1", assignedTo: "M-1" }),
      makeTask({ id: "T-2", assignedTo: "M-1" }),
      makeTask({ id: "T-3", assignedTo: "M-1" }),
    ];
    const result = coordinateHousehold(members, tasks);
    expect(result.fairnessScore).toBeLessThan(100);
  });

  it("detects overloaded members", () => {
    const tasks = Array.from({ length: 8 }, (_, i) => makeTask({ id: `T-${i}`, assignedTo: "M-1" }));
    const result = coordinateHousehold(members, tasks);
    expect(result.memberLoads.find(m => m.member.id === "M-1")?.status).toBe("overloaded");
  });

  it("restricts child task assignments", () => {
    const tasks = [makeTask({ assignedTo: undefined, category: "maintenance" })];
    const result = coordinateHousehold(members, tasks);
    const assignment = result.suggestedAssignments[0];
    expect(assignment.member.role).not.toBe("child");
  });
});
