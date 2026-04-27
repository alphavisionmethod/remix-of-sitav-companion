import { describe, it, expect } from "vitest";
import { derivePrepTasks } from "@/lib/services/concierge-os/prep-derivation.service";

describe("derivePrepTasks", () => {
  it("creates one prep task per calendar event with due date 1h before start", () => {
    const start = "2026-05-01T10:00:00.000Z";
    const tasks = derivePrepTasks([
      { id: "e1", title: "Doctor", start, end: "2026-05-01T11:00:00.000Z", attendees: ["m-1"] } as never,
    ]);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Prepare for: Doctor");
    expect(tasks[0].assignedTo).toBe("m-1");
    expect(tasks[0].dueDate).toBe("2026-05-01T09:00:00.000Z");
    expect(tasks[0].tags).toContain("auto-derived");
  });

  it("returns an empty list for no events", () => {
    expect(derivePrepTasks([])).toHaveLength(0);
  });
});