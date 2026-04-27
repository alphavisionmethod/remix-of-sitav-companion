import { describe, it, expect } from "vitest";
import { computeHouseholdKpis } from "@/lib/services/concierge-os/household-ops.service";
import {
  makeHouseholdMember,
  makeHouseholdTask,
  daysAgo,
} from "@/__tests__/concierge/_helpers/concierge-fixtures";

describe("computeHouseholdKpis", () => {
  it("computes completion rate, top contributor, and load distribution", () => {
    const ada = makeHouseholdMember({ id: "ada", firstName: "Ada", lastName: "L" });
    const grace = makeHouseholdMember({ id: "grace", firstName: "Grace", lastName: "H" });
    const tasks = [
      makeHouseholdTask({ id: "1", status: "completed", assignedTo: "ada" }),
      makeHouseholdTask({ id: "2", status: "completed", assignedTo: "ada" }),
      makeHouseholdTask({ id: "3", status: "pending", assignedTo: "ada", estimatedMinutes: 60 }),
      makeHouseholdTask({ id: "4", status: "pending", assignedTo: "grace", estimatedMinutes: 30 }),
      makeHouseholdTask({ id: "5", status: "in-progress", assignedTo: "grace", dueDate: daysAgo(1) }),
    ];

    const kpis = computeHouseholdKpis([ada, grace], tasks);

    expect(kpis.totalMembers).toBe(2);
    expect(kpis.activeTasks).toBe(3);
    expect(kpis.overdueTaskCount).toBe(1);
    // 2 completed of 5 total = 40%
    expect(kpis.taskCompletionRate).toBe(40);
    // Both members carry equal active count (ada 1, grace 2) — topContributor = grace
    expect(kpis.topContributor).toBe("Grace H");
    expect(kpis.memberLoadDistribution).toHaveLength(2);
    // Load balance score is bounded 0..100
    expect(kpis.loadBalanceScore).toBeGreaterThanOrEqual(0);
    expect(kpis.loadBalanceScore).toBeLessThanOrEqual(100);
  });

  it("returns 100% completion rate when no tasks exist", () => {
    const kpis = computeHouseholdKpis([makeHouseholdMember()], []);
    expect(kpis.taskCompletionRate).toBe(100);
    expect(kpis.activeTasks).toBe(0);
    expect(kpis.topContributor).toBe("Ada Lovelace");
  });
});