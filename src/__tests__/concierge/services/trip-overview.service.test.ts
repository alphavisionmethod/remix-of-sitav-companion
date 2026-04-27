import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { buildTripDashboard } from "@/lib/services/concierge-os/trip-overview.service";
import { makeTripSummary, fixedNow, daysAgo, daysAhead } from "@/__tests__/concierge/_helpers/concierge-fixtures";

describe("buildTripDashboard", () => {
  beforeAll(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(fixedNow())); });
  afterAll(() => vi.useRealTimers());

  it("partitions trips into upcoming, active, past", () => {
    const dash = buildTripDashboard([
      makeTripSummary({ id: "future", startDate: daysAhead(10), endDate: daysAhead(15) }),
      makeTripSummary({ id: "now", startDate: daysAgo(1), endDate: daysAhead(2) }),
      makeTripSummary({ id: "past", startDate: daysAgo(30), endDate: daysAgo(20) }),
    ]);
    expect(dash.upcoming.map((t) => t.id)).toEqual(["future"]);
    expect(dash.active.map((t) => t.id)).toEqual(["now"]);
    expect(dash.past.map((t) => t.id)).toEqual(["past"]);
  });

  it("sums total budget and spend across trips", () => {
    const dash = buildTripDashboard([
      makeTripSummary({ id: "a", totalBudgetCents: 100_000, totalSpentCents: 30_000 }),
      makeTripSummary({ id: "b", totalBudgetCents: 200_000, totalSpentCents: 50_000 }),
    ]);
    expect(dash.totalBudgetCents).toBe(300_000);
    expect(dash.totalSpentCents).toBe(80_000);
  });
});