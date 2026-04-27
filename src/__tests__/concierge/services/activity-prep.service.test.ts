import { describe, it, expect } from "vitest";
import {
  buildActivityChecklist,
  getMockActivityChecklists,
} from "@/lib/services/concierge-os/activity-prep.service";

describe("activity-prep.service", () => {
  it("buildActivityChecklist creates undone items at 0% completion", () => {
    const c = buildActivityChecklist("Karate", ["Pack belt", "Bring water"]);
    expect(c.activityName).toBe("Karate");
    expect(c.items).toHaveLength(2);
    expect(c.items.every((i) => i.done === false)).toBe(true);
    expect(c.completionPct).toBe(0);
  });

  it("getMockActivityChecklists returns sane defaults", () => {
    const list = getMockActivityChecklists();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].items.length).toBeGreaterThan(0);
  });
});