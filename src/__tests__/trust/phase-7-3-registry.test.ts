// ═══════════════════════════════════════════════════════════════
// Phase 7.3 — Autopilot + outreach registry coverage
// Asserts the new trust action keys exist with correct risk semantics.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { TRUST_ACTION_REGISTRY } from "@/platform/trust/registry/trust-action-registry";

describe("Phase 7.3 — autopilot + outreach trust registry", () => {
  it("registers `autopilot.playbook.activate` as high-risk + requires approval", () => {
    const a = TRUST_ACTION_REGISTRY["autopilot.playbook.activate"];
    expect(a).toBeDefined();
    expect(a.riskTier).toBe("high");
    expect(a.requireApproval).toBe(true);
    expect(a.reversible).toBe(true);
  });

  it("registers `autopilot.playbook.pause` as low-risk + pre-approved", () => {
    const a = TRUST_ACTION_REGISTRY["autopilot.playbook.pause"];
    expect(a).toBeDefined();
    expect(a.riskTier).toBe("low");
    expect(a.requireApproval).toBe(false);
    expect(a.defaultAuthorityLevel).toBe("pre_approved");
  });

  it("registers `appointment.reminder.send` as medium-risk (no gate, single recipient)", () => {
    const a = TRUST_ACTION_REGISTRY["appointment.reminder.send"];
    expect(a).toBeDefined();
    expect(a.riskTier).toBe("medium");
    expect(a.requireApproval).toBe(false);
  });

  it("registers `appointment.confirm` as low-risk + reversible", () => {
    const a = TRUST_ACTION_REGISTRY["appointment.confirm"];
    expect(a).toBeDefined();
    expect(a.riskTier).toBe("low");
    expect(a.reversible).toBe(true);
  });

  it("registers `appointment.recovery.send` as high-risk external outreach + requires approval", () => {
    const a = TRUST_ACTION_REGISTRY["appointment.recovery.send"];
    expect(a).toBeDefined();
    expect(a.riskTier).toBe("high");
    expect(a.requireApproval).toBe(true);
    expect(a.reversible).toBe(false);
  });

  it("uses canonical pillar=business for every Phase 7.3 key", () => {
    const keys = [
      "autopilot.playbook.activate",
      "autopilot.playbook.pause",
      "appointment.reminder.send",
      "appointment.confirm",
      "appointment.recovery.send",
    ] as const;
    for (const k of keys) {
      expect(TRUST_ACTION_REGISTRY[k].pillar).toBe("business");
    }
  });
});