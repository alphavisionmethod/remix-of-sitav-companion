import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  getExpiringItems,
  computeAdminLoad,
} from "@/lib/services/concierge-os/home-admin.service";
import { makeAdminTracker, fixedNow, daysAhead, daysAgo } from "@/__tests__/concierge/_helpers/concierge-fixtures";

describe("home-admin.service", () => {
  beforeAll(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(fixedNow())); });
  afterAll(() => vi.useRealTimers());

  it("getExpiringItems returns trackers expiring within window, sorted ascending", () => {
    const out = getExpiringItems([
      makeAdminTracker({ id: "later", expiresAt: daysAhead(60) }),
      makeAdminTracker({ id: "soon", expiresAt: daysAhead(5) }),
      makeAdminTracker({ id: "renewed", expiresAt: daysAhead(5), status: "renewed" }),
    ], 30);
    expect(out.map((t) => t.id)).toEqual(["soon"]);
  });

  it("getExpiringItems excludes already-renewed entries", () => {
    const out = getExpiringItems([
      makeAdminTracker({ id: "x", expiresAt: daysAhead(5), status: "renewed" }),
    ]);
    expect(out).toHaveLength(0);
  });

  it("computeAdminLoad counts active and expiring-soon trackers", () => {
    const load = computeAdminLoad([
      makeAdminTracker({ id: "a", status: "active", cost: 100 }),
      makeAdminTracker({ id: "b", status: "expiring-soon", cost: 200 }),
      makeAdminTracker({ id: "c", status: "expired", cost: 50 }),
    ]);
    expect(load.active).toBe(1);
    expect(load.expiringSoon).toBe(1);
    expect(load.totalAnnualCost).toBe(350);
  });

  it("returns zeros for an empty tracker set", () => {
    expect(computeAdminLoad([])).toEqual({ active: 0, expiringSoon: 0, totalAnnualCost: 0 });
    expect(getExpiringItems([], 30)).toHaveLength(0);
    void daysAgo;
  });
});