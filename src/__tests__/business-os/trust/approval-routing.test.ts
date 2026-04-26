// ═══════════════════════════════════════════════════════════════
// Phase 4 — Approval routing for risky Business OS actions
//
// Asserts that the in-code Trust Action Registry agrees with the
// policy approval map for every BUSINESS pillar action whose
// declared `requireApproval` is true. This guards the invariant:
// "if an action is marked risky in the registry, the policy map
// must back it with a non-`none` approval tier."
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  TRUST_ACTION_REGISTRY,
  TRUST_ACTION_LIST,
} from "@/platform/trust";
import {
  APPROVAL_MAP,
  requiresApproval,
  getApprovalMapping,
} from "@/lib/policy/policy-approval-map";

describe("approval routing — registry ↔ policy coherence", () => {
  const businessActions = TRUST_ACTION_LIST.filter(
    (a) => a.pillar === "business",
  );

  it("registry contains the canonical Business OS actions", () => {
    expect(businessActions.length).toBeGreaterThan(20);
    const keys = businessActions.map((a) => a.key);
    // Spot-check the high-risk surfaces that MUST be routed through approval.
    expect(keys).toContain("business.crm.contact_delete");
    expect(keys).toContain("business.email.campaign_send");
    expect(keys).toContain("crm.merge.execute");
  });

  it("every business action with requireApproval=true is risk medium/high/critical", () => {
    const lowRiskApprovers = businessActions.filter(
      (a) => a.requireApproval && a.riskTier === "low",
    );
    expect(
      lowRiskApprovers,
      `low-risk action requesting approval is incoherent: ${lowRiskApprovers.map((a) => a.key).join(", ")}`,
    ).toEqual([]);
  });

  it("every irreversible business action is either high-risk or explicitly approved", () => {
    const incoherent = businessActions.filter(
      (a) => !a.reversible && a.riskTier === "low" && !a.requireApproval,
    );
    expect(
      incoherent,
      `irreversible+low-risk+no-approval is unsafe: ${incoherent.map((a) => a.key).join(", ")}`,
    ).toEqual([]);
  });

  it("policy approval map declares non-`none` tiers for business R3+", () => {
    // R3 = sensitive customer data writes; must at minimum self-confirm.
    const r3 = getApprovalMapping("business", "R3");
    expect(r3?.tier).not.toBe("none");
    expect(r3?.justificationRequired).toBe(true);
  });

  it("policy approval map only allows `none` for R0–R2 by domain", () => {
    const noneTiered = APPROVAL_MAP.filter((m) => m.tier === "none");
    for (const m of noneTiered) {
      expect(
        ["R0", "R1", "R2"],
        `${m.domain}/${m.riskClass} cannot be tier=none`,
      ).toContain(m.riskClass);
    }
  });

  it("requiresApproval helper agrees with the underlying mapping", () => {
    for (const m of APPROVAL_MAP) {
      expect(requiresApproval(m.domain, m.riskClass)).toBe(m.tier !== "none");
    }
  });

  it("registry exposes the same set as the immutable record (no drift)", () => {
    const recordKeys = Object.keys(TRUST_ACTION_REGISTRY).sort();
    const listKeys = TRUST_ACTION_LIST.map((a) => a.key).sort();
    expect(recordKeys).toEqual(listKeys);
  });
});