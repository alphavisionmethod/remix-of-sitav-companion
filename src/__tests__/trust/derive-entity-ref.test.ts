// ═══════════════════════════════════════════════════════════════
// Phase 7.2 — `deriveEntityRef`
// Pure function. Verifies the action-key → entity_type mapping and
// related-id extraction the CRM proof trail relies on.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { deriveEntityRef } from "@/modules/business/hooks/use-crm-data";

describe("deriveEntityRef (Phase 7.2)", () => {
  it("returns null for an unknown action key", () => {
    expect(deriveEntityRef("nonsense.foo.bar", { id: "x" })).toBeNull();
  });

  it("maps `crm.contact.create` to entity_type=contact and lifts `id`", () => {
    expect(deriveEntityRef("crm.contact.create", { id: "c1" })).toEqual({
      entity_type: "contact",
      entity_id: "c1",
    });
  });

  it("maps the legacy `business.crm.contact_delete` key to entity_type=contact", () => {
    expect(deriveEntityRef("business.crm.contact_delete", { id: "c9" })).toEqual({
      entity_type: "contact",
      entity_id: "c9",
    });
  });

  it("maps both `crm.opportunity.*` and `crm.deal.*` to entity_type=deal", () => {
    expect(deriveEntityRef("crm.opportunity.update", { id: "o1" })?.entity_type).toBe("deal");
    expect(deriveEntityRef("crm.deal.stage_change", { id: "o2" })?.entity_type).toBe("deal");
  });

  it("captures contact_id / company_id / opportunity_id under `related`", () => {
    const ref = deriveEntityRef("crm.communication.log", {
      contact_id: "c1",
      company_id: "co1",
      opportunity_id: "o1",
    });
    expect(ref).toEqual({
      entity_type: "communication",
      related: {
        contact_id: "c1",
        company_id: "co1",
        opportunity_id: "o1",
      },
    });
  });

  it("captures merge winner_id / loser_id under `related`", () => {
    const ref = deriveEntityRef("crm.merge.execute", {
      winner_id: "w1",
      loser_id: "l1",
    });
    expect(ref).toEqual({
      entity_type: "merge",
      related: { winner_id: "w1", loser_id: "l1" },
    });
  });

  it("falls back to entity_id when `id` is absent", () => {
    expect(deriveEntityRef("crm.task.update", { entity_id: "t1" })).toEqual({
      entity_type: "task",
      entity_id: "t1",
    });
  });

  it("omits entity_id and related when neither is provided", () => {
    expect(deriveEntityRef("crm.tag.create", { name: "Lead" })).toEqual({
      entity_type: "tag",
    });
  });

  it("prefers the longest matching prefix", () => {
    // `crm.contact_company_link` must beat `crm.contact` even though both
    // are prefix-compatible with the action key.
    expect(deriveEntityRef("crm.contact_company_link.create", { id: "l1" })?.entity_type).toBe(
      "link",
    );
  });
});