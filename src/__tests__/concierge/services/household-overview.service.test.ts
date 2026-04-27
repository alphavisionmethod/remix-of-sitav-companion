import { describe, it, expect } from "vitest";
import { buildHouseholdOverview } from "@/lib/services/concierge-os/household-overview.service";
import {
  makeHouseholdMember,
  makeHouseholdTask,
  daysAgo,
  daysAhead,
} from "@/__tests__/concierge/_helpers/concierge-fixtures";

describe("buildHouseholdOverview", () => {
  it("counts members and active vs overdue tasks deterministically", () => {
    const members = [makeHouseholdMember(), makeHouseholdMember({ id: "m-2", firstName: "Grace" })];
    const tasks = [
      makeHouseholdTask({ id: "t-1", status: "pending", priority: "high", title: "Renew passport" }),
      makeHouseholdTask({ id: "t-2", status: "in-progress", priority: "high", title: "Fix sink" }),
      makeHouseholdTask({ id: "t-3", status: "completed" }),
      makeHouseholdTask({ id: "t-4", status: "pending", dueDate: daysAgo(2) }), // overdue
      makeHouseholdTask({ id: "t-5", status: "pending", dueDate: daysAhead(2) }), // not overdue
    ];

    const overview = buildHouseholdOverview(members, tasks);

    expect(overview.memberCount).toBe(2);
    // pending + in-progress = active (4)
    expect(overview.activeTasks).toBe(4);
    // exactly one overdue (status != completed AND dueDate in past)
    expect(overview.overdueTasks).toBe(1);
    expect(overview.topPriorities).toContain("Renew passport");
    expect(overview.topPriorities).toContain("Fix sink");
  });

  it("falls back to placeholder when no high-priority tasks exist", () => {
    const overview = buildHouseholdOverview(
      [makeHouseholdMember()],
      [makeHouseholdTask({ priority: "low", status: "pending" })],
    );
    expect(overview.topPriorities).toEqual(["No high-priority tasks"]);
  });
});