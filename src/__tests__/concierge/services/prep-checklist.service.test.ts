import { describe, it, expect } from "vitest";
import { generateTripChecklist } from "@/lib/services/concierge-os/prep-checklist.service";
import { makeTripSummary } from "@/__tests__/concierge/_helpers/concierge-fixtures";

describe("generateTripChecklist", () => {
  it("returns a 6-item undone checklist tied to the trip id", () => {
    const trip = makeTripSummary({ id: "trip-x" });
    const list = generateTripChecklist(trip);
    expect(list.tripId).toBe("trip-x");
    expect(list.items).toHaveLength(6);
    expect(list.items.every((i) => i.completed === false)).toBe(true);
    expect(list.completionPercent).toBe(0);
  });
});