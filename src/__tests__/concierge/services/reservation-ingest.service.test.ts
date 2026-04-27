import { describe, it, expect } from "vitest";
import { ingestReservationFromEmail } from "@/lib/services/concierge-os/reservation-ingest.service";

describe("ingestReservationFromEmail", () => {
  it("parses provider, confirmation, location and cost into cents", () => {
    const r = ingestReservationFromEmail({
      type: "flight",
      provider: "United",
      confirmation: "AB12CD",
      location: "JFK→SFO",
      cost: "450",
    });
    expect(r.type).toBe("flight");
    expect(r.provider).toBe("United");
    expect(r.confirmationNumber).toBe("AB12CD");
    expect(r.costCents).toBe(45_000);
    expect(r.status).toBe("confirmed");
  });

  it("falls back to safe defaults for missing fields", () => {
    const r = ingestReservationFromEmail({});
    expect(r.type).toBe("hotel");
    expect(r.provider).toBe("Unknown");
    expect(r.confirmationNumber).toBe("PENDING");
    expect(r.costCents).toBe(0);
  });
});