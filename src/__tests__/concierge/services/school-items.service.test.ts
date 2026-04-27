import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  getUpcomingSchoolItems,
  groupByChild,
} from "@/lib/services/concierge-os/school-items.service";
import { fixedNow, daysAhead } from "@/__tests__/concierge/_helpers/concierge-fixtures";

const makeSchool = (overrides: Record<string, unknown> = {}) => ({
  id: "s1",
  childId: "c-1",
  type: "homework",
  title: "Math worksheet",
  dueDate: daysAhead(2),
  completed: false,
  ...overrides,
}) as never;

describe("school-items.service", () => {
  beforeAll(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(fixedNow())); });
  afterAll(() => vi.useRealTimers());

  it("returns only upcoming, uncompleted items within window, sorted ascending", () => {
    const items = [
      makeSchool({ id: "a", dueDate: daysAhead(10) }),
      makeSchool({ id: "b", dueDate: daysAhead(1) }),
      makeSchool({ id: "c", dueDate: daysAhead(2), completed: true }),
    ];
    const out = getUpcomingSchoolItems(items, 7);
    expect(out.map((i) => i.id)).toEqual(["b"]);
  });

  it("groupByChild groups items by childId", () => {
    const out = groupByChild([
      makeSchool({ id: "a", childId: "c-1" }),
      makeSchool({ id: "b", childId: "c-2" }),
      makeSchool({ id: "c", childId: "c-1" }),
    ]);
    expect(out["c-1"]).toHaveLength(2);
    expect(out["c-2"]).toHaveLength(1);
  });
});