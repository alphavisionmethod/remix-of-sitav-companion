// ═══════════════════════════════════════════════════════════════
// Phase 7.4 — `deriveConciergeEntityRef`
// Pure function. Verifies the action-key → entity_type mapping and
// related-id extraction the concierge proof trail relies on.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from "vitest";

// `useAuth` lives in a context module that pulls supabase. We don't need
// it for the pure-function tests — stub the module so the import graph
// doesn't try to wire up a real client.
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({}) },
}));

import { deriveConciergeEntityRef } from "@/hooks/use-concierge-data";

describe("deriveConciergeEntityRef (Phase 7.4)", () => {
  it("returns null for an unknown action key", () => {
    expect(deriveConciergeEntityRef("nonsense.foo.bar", { id: "x" })).toBeNull();
  });

  it("maps `concierge.errand.create` to entity_type=errand and lifts `id`", () => {
    expect(deriveConciergeEntityRef("concierge.errand.create", { id: "e1" })).toEqual({
      entity_type: "errand",
      entity_id: "e1",
    });
  });

  it("maps `concierge.gift.purchase` to entity_type=gift", () => {
    expect(
      deriveConciergeEntityRef("concierge.gift.purchase", { id: "g1" })?.entity_type,
    ).toBe("gift");
  });

  it("maps `concierge.appointment.cancel` to entity_type=appointment", () => {
    expect(
      deriveConciergeEntityRef("concierge.appointment.cancel", { id: "a1" })?.entity_type,
    ).toBe("appointment");
  });

  it("maps `concierge.recurring.update` to entity_type=recurring_obligation", () => {
    expect(
      deriveConciergeEntityRef("concierge.recurring.update", { id: "r1" })?.entity_type,
    ).toBe("recurring_obligation");
  });

  it("captures list_id under `related` for grocery items", () => {
    const ref = deriveConciergeEntityRef("concierge.grocery_item.create", {
      list_id: "l1",
      name: "Milk",
    });
    expect(ref).toEqual({
      entity_type: "grocery_item",
      related: { list_id: "l1" },
    });
  });

  it("captures bundle_id under `related` for errands", () => {
    const ref = deriveConciergeEntityRef("concierge.errand.create", {
      bundle_id: "b1",
      title: "Pharmacy run",
    });
    expect(ref).toEqual({
      entity_type: "errand",
      related: { bundle_id: "b1" },
    });
  });

  it("captures provider_id under `related` for appointments", () => {
    const ref = deriveConciergeEntityRef("concierge.appointment.create", {
      provider_id: "p1",
      title: "HVAC service",
      appointment_date: "2026-05-01",
    });
    expect(ref?.related).toEqual({ provider_id: "p1" });
  });

  it("falls back to entity_id when `id` is absent", () => {
    expect(
      deriveConciergeEntityRef("concierge.gift.update", { entity_id: "g9" }),
    ).toEqual({
      entity_type: "gift",
      entity_id: "g9",
    });
  });

  it("omits entity_id and related when neither is provided", () => {
    expect(
      deriveConciergeEntityRef("concierge.provider.create", { name: "Plumber" }),
    ).toEqual({ entity_type: "provider" });
  });

  it("prefers the longest matching prefix (grocery_item beats grocery_list)", () => {
    expect(
      deriveConciergeEntityRef("concierge.grocery_item.delete", { id: "i1" })
        ?.entity_type,
    ).toBe("grocery_item");
    expect(
      deriveConciergeEntityRef("concierge.grocery_list.create", { id: "l1" })
        ?.entity_type,
    ).toBe("grocery_list");
  });
});
