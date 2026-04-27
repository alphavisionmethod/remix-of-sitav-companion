// ═══════════════════════════════════════════════════════════════
// Phase 7.4 — Concierge trust registry coverage
// Asserts the new concierge action keys exist with correct risk
// semantics: low-risk creates are pre-approved, deletes are
// medium+ask, and high-risk surfaces (bulk delete, automation
// activate) require approval.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { TRUST_ACTION_REGISTRY } from "@/platform/trust/registry/trust-action-registry";

describe("Phase 7.4 — concierge trust registry", () => {
  it("registers errand CRUD with the right risk tiers", () => {
    expect(TRUST_ACTION_REGISTRY["concierge.errand.create"].riskTier).toBe("low");
    expect(TRUST_ACTION_REGISTRY["concierge.errand.create"].defaultAuthorityLevel).toBe(
      "pre_approved",
    );
    expect(TRUST_ACTION_REGISTRY["concierge.errand.update"].riskTier).toBe("low");
    expect(TRUST_ACTION_REGISTRY["concierge.errand.delete"].riskTier).toBe("medium");
    expect(TRUST_ACTION_REGISTRY["concierge.errand.delete"].reversible).toBe(false);
  });

  it("treats `concierge.errand.bulk_delete` as high-risk + requires approval", () => {
    const a = TRUST_ACTION_REGISTRY["concierge.errand.bulk_delete"];
    expect(a).toBeDefined();
    expect(a.riskTier).toBe("high");
    expect(a.requireApproval).toBe(true);
    expect(a.reversible).toBe(false);
  });

  it("registers grocery item CRUD as low-risk pre-approved", () => {
    expect(TRUST_ACTION_REGISTRY["concierge.grocery_item.create"].riskTier).toBe("low");
    expect(TRUST_ACTION_REGISTRY["concierge.grocery_item.update"].riskTier).toBe("low");
    expect(TRUST_ACTION_REGISTRY["concierge.grocery_item.delete"].riskTier).toBe("low");
  });

  it("registers gift create/update as low-risk reversible", () => {
    expect(TRUST_ACTION_REGISTRY["concierge.gift.create"].reversible).toBe(true);
    expect(TRUST_ACTION_REGISTRY["concierge.gift.update"].reversible).toBe(true);
  });

  it("treats provider delete as medium-risk irreversible", () => {
    const a = TRUST_ACTION_REGISTRY["concierge.provider.delete"];
    expect(a.riskTier).toBe("medium");
    expect(a.reversible).toBe(false);
  });

  it("treats appointment cancel as medium-risk (third-party impact)", () => {
    const a = TRUST_ACTION_REGISTRY["concierge.appointment.cancel"];
    expect(a.riskTier).toBe("medium");
    expect(a.reversible).toBe(false);
  });

  it("treats `concierge.automation.activate` as high-risk + requires approval", () => {
    const a = TRUST_ACTION_REGISTRY["concierge.automation.activate"];
    expect(a.riskTier).toBe("high");
    expect(a.requireApproval).toBe(true);
    expect(a.reversible).toBe(true);
  });

  it("treats `concierge.automation.pause` as low-risk pre-approved", () => {
    const a = TRUST_ACTION_REGISTRY["concierge.automation.pause"];
    expect(a.riskTier).toBe("low");
    expect(a.requireApproval).toBe(false);
    expect(a.defaultAuthorityLevel).toBe("pre_approved");
  });

  it("registers document delete as medium-risk irreversible", () => {
    const a = TRUST_ACTION_REGISTRY["concierge.document.delete"];
    expect(a.riskTier).toBe("medium");
    expect(a.reversible).toBe(false);
  });

  it("uses canonical pillar=concierge for every Phase 7.4 key", () => {
    const keys = [
      "concierge.errand.create",
      "concierge.errand.update",
      "concierge.errand.delete",
      "concierge.errand.bulk_delete",
      "concierge.grocery_list.create",
      "concierge.grocery_item.create",
      "concierge.grocery_item.update",
      "concierge.grocery_item.delete",
      "concierge.gift.create",
      "concierge.gift.update",
      "concierge.provider.create",
      "concierge.provider.update",
      "concierge.provider.delete",
      "concierge.appointment.create",
      "concierge.appointment.update",
      "concierge.appointment.cancel",
      "concierge.automation.create",
      "concierge.automation.activate",
      "concierge.automation.pause",
      "concierge.automation.delete",
      "concierge.document.create",
      "concierge.document.delete",
      "concierge.recurring.create",
      "concierge.recurring.update",
    ] as const;
    for (const k of keys) {
      expect(TRUST_ACTION_REGISTRY[k].pillar).toBe("concierge");
    }
  });
});
