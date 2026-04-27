import { describe, it, expect } from "vitest";
import {
  buildPrepChecklist,
  ingestReservation,
  assessTripReadiness,
} from "@/lib/services/concierge-os/travel-continuity.service";
import { makeTripSummary } from "@/__tests__/concierge/_helpers/concierge-fixtures";

describe("travel-continuity.service", () => {
  it("buildPrepChecklist seeds a 6-item checklist with 0% completion", () => {
    const trip = makeTripSummary();
    const list = buildPrepChecklist(trip);
    expect(list.tripId).toBe(trip.id);
    expect(list.items).toHaveLength(6);
    expect(list.completionPercent).toBe(0);
  });

  it("ingestReservation defaults to a confirmed hotel record", () => {
    const r = ingestReservation({ provider: "Marriott", confirmation: "X1Y2", location: "NYC", cost: "200" });
    expect(r.type).toBe("hotel");
    expect(r.status).toBe("confirmed");
    expect(r.costCents).toBe(20_000);
  });

  it("assessTripReadiness flags critical blockers when documents/reservations are pending", () => {
    const trip = makeTripSummary();
    const list = buildPrepChecklist(trip);
    const out = assessTripReadiness(trip, list);
    expect(out.readinessScore).toBe(0);
    expect(out.blockers.length).toBeGreaterThan(0);
    expect(out.recommendations.length).toBeGreaterThan(0);
  });

  it("assessTripReadiness reports zero blockers when all critical items completed", () => {
    const trip = makeTripSummary();
    const list = buildPrepChecklist(trip);
    const completed = {
      ...list,
      items: list.items.map((i) =>
        i.category === "documents" || i.category === "reservations"
          ? { ...i, completed: true }
          : i,
      ),
    };
    const out = assessTripReadiness(trip, completed);
    expect(out.blockers).toHaveLength(0);
  });
});