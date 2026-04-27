import { describe, it, expect } from "vitest";
import {
  analyzeLoad,
  suggestRebalance,
} from "@/lib/services/concierge-os/load-balance.service";
import {
  makeHouseholdMember,
  makeHouseholdTask,
} from "@/__tests__/concierge/_helpers/concierge-fixtures";

describe("load-balance service", () => {
  it("derives per-member hours and flags overload", () => {
    const ada = makeHouseholdMember({ id: "ada", firstName: "Ada", lastName: "L" });
    const grace = makeHouseholdMember({ id: "grace", firstName: "Grace", lastName: "H" });
    const tasks = [
      // 10 hours assigned to ada (overloaded > 8h)
      ...Array.from({ length: 20 }, (_, i) =>
        makeHouseholdTask({ id: `a-${i}`, assignedTo: "ada", estimatedMinutes: 30, status: "pending" }),
      ),
      makeHouseholdTask({ id: "g-1", assignedTo: "grace", estimatedMinutes: 60, status: "pending" }),
      // Completed tasks should be ignored
      makeHouseholdTask({ id: "done", assignedTo: "ada", estimatedMinutes: 600, status: "completed" }),
    ];

    const reports = analyzeLoad([ada, grace], tasks);
    const adaReport = reports.find((r) => r.memberId === "ada")!;
    const graceReport = reports.find((r) => r.memberId === "grace")!;

    expect(adaReport.taskCount).toBe(20);
    expect(adaReport.hours).toBe(10);
    expect(adaReport.overloaded).toBe(true);
    expect(graceReport.hours).toBe(1);
    expect(graceReport.overloaded).toBe(false);
  });

  it("suggests rebalance from heaviest to lightest when delta >= 2h", () => {
    const ada = makeHouseholdMember({ id: "ada", firstName: "Ada", lastName: "L" });
    const grace = makeHouseholdMember({ id: "grace", firstName: "Grace", lastName: "H" });
    const tasks = [
      ...Array.from({ length: 10 }, (_, i) =>
        makeHouseholdTask({ id: `a-${i}`, assignedTo: "ada", estimatedMinutes: 30, status: "pending" }),
      ),
      makeHouseholdTask({ id: "g-1", assignedTo: "grace", estimatedMinutes: 30, status: "pending" }),
    ];
    const reports = analyzeLoad([ada, grace], tasks);
    const suggestions = suggestRebalance(reports);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].from).toBe("Ada L");
    expect(suggestions[0].to).toBe("Grace H");
  });

  it("returns no suggestions when load is already balanced", () => {
    const ada = makeHouseholdMember({ id: "ada", firstName: "Ada", lastName: "L" });
    const grace = makeHouseholdMember({ id: "grace", firstName: "Grace", lastName: "H" });
    const tasks = [
      makeHouseholdTask({ id: "a", assignedTo: "ada", estimatedMinutes: 60, status: "pending" }),
      makeHouseholdTask({ id: "g", assignedTo: "grace", estimatedMinutes: 60, status: "pending" }),
    ];
    const reports = analyzeLoad([ada, grace], tasks);
    expect(suggestRebalance(reports)).toEqual([]);
  });
});