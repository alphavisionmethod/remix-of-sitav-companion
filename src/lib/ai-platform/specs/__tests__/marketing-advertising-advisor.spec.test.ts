// ═══════════════════════════════════════════════════════════════
// SITA OS — Marketing & Advertising Advisor spec structural tests
// Verifies completeness, authority ceiling, and required scenarios.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { MARKETING_ADVERTISING_ADVISOR_SPEC } from "../marketing-advertising-advisor.spec";
import { validateAdvisorSpec } from "../spec-types";

describe("MARKETING_ADVERTISING_ADVISOR_SPEC", () => {
  it("passes validateAdvisorSpec with zero issues", () => {
    const issues = validateAdvisorSpec(MARKETING_ADVERTISING_ADVISOR_SPEC);
    expect(issues).toEqual([]);
  });

  it("targets the marketing-advertising-advisor id", () => {
    expect(MARKETING_ADVERTISING_ADVISOR_SPEC.id).toBe("marketing-advertising-advisor");
  });

  it("ceiling is L3-draft (no live launches, no autonomous sends)", () => {
    expect(MARKETING_ADVERTISING_ADVISOR_SPEC.currentAuthorityCeiling).toBe("L3-draft");
  });

  it("declares all 6 automation levels (L0–L5)", () => {
    const levels = MARKETING_ADVERTISING_ADVISOR_SPEC.automationMatrix
      .map((m) => m.level)
      .sort();
    expect(levels).toEqual(["L0", "L1", "L2", "L3", "L4", "L5"]);
  });

  it("escalates to CFO for material spend and to CEO for strategic positioning", () => {
    const targets = MARKETING_ADVERTISING_ADVISOR_SPEC.escalatesTo.map((e) => e.advisorId);
    expect(targets).toContain("cfo-advisor");
    expect(targets).toContain("ceo-advisor");
    expect(targets).toContain("sales-advisor");
    expect(targets).toContain("growth-advisor");
  });

  it("blocks paid launches and external sends in disallowedAutonomousActions", () => {
    const joined = MARKETING_ADVERTISING_ADVISOR_SPEC.disallowedAutonomousActions
      .join(" | ")
      .toLowerCase();
    expect(joined).toMatch(/paid|campaign|launch/);
    expect(joined).toMatch(/email|message|send/);
    expect(joined).toMatch(/brand|asset|voice/);
  });

  it("flags channel-mix and envelope-sizing scenarios as nonAuthoritative", () => {
    const channelSim = MARKETING_ADVERTISING_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "channel-mix-reallocation-scenario"
    );
    const envelopeSim = MARKETING_ADVERTISING_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "campaign-envelope-sizing-scenario"
    );
    expect(channelSim?.nonAuthoritative).toBe(true);
    expect(envelopeSim?.nonAuthoritative).toBe(true);
  });

  it("declares ad-angle and positioning-frame simulations as authoritative drafts", () => {
    const angleSim = MARKETING_ADVERTISING_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "ad-angle-comparison-scenario"
    );
    const frameSim = MARKETING_ADVERTISING_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "positioning-frame-comparison-scenario"
    );
    expect(angleSim?.nonAuthoritative).toBe(false);
    expect(frameSim?.nonAuthoritative).toBe(false);
  });
});
