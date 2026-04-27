import { describe, it, expect } from "vitest";
import { assignResponsibilities } from "@/lib/services/concierge-os/responsibilities.service";
import { makeHouseholdTask } from "@/__tests__/concierge/_helpers/concierge-fixtures";

describe("assignResponsibilities", () => {
  it("groups tasks by assignedTo and sums total minutes", () => {
    const out = assignResponsibilities(
      [
        makeHouseholdTask({ id: "t1", assignedTo: "m-1", estimatedMinutes: 30 }),
        makeHouseholdTask({ id: "t2", assignedTo: "m-1", estimatedMinutes: 45 }),
        makeHouseholdTask({ id: "t3", assignedTo: "m-2", estimatedMinutes: 15 }),
      ],
      { "m-1": "Ada", "m-2": "Bob" },
    );
    const ada = out.find((a) => a.memberId === "m-1");
    const bob = out.find((a) => a.memberId === "m-2");
    expect(ada?.totalMinutes).toBe(75);
    expect(bob?.totalMinutes).toBe(15);
    expect(ada?.memberName).toBe("Ada");
  });

  it("collects unassigned tasks under a stable bucket", () => {
    const out = assignResponsibilities(
      [makeHouseholdTask({ id: "x", assignedTo: undefined, estimatedMinutes: 10 })],
      {},
    );
    expect(out[0].memberId).toBe("unassigned");
    expect(out[0].memberName).toBe("unassigned");
    expect(out[0].totalMinutes).toBe(10);
  });

  it("uses a 30-minute default when estimatedMinutes is missing", () => {
    const out = assignResponsibilities(
      [makeHouseholdTask({ id: "x", assignedTo: "m-1", estimatedMinutes: undefined as never })],
      { "m-1": "Ada" },
    );
    expect(out[0].totalMinutes).toBe(30);
  });
});