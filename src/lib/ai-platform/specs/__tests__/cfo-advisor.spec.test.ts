// ═══════════════════════════════════════════════════════════════
// SITA OS — CFO Advisor spec structural tests
// Verifies completeness, authority ceiling, and required scenarios.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { CFO_ADVISOR_SPEC } from "../cfo-advisor.spec";
import { validateAdvisorSpec } from "../spec-types";

describe("CFO_ADVISOR_SPEC", () => {
  it("passes validateAdvisorSpec with zero issues", () => {
    const issues = validateAdvisorSpec(CFO_ADVISOR_SPEC);
    expect(issues).toEqual([]);
  });

  it("targets the cfo-advisor id", () => {
    expect(CFO_ADVISOR_SPEC.id).toBe("cfo-advisor");
  });

  it("ceiling is L2-recommend (no money movement, no autonomous sends)", () => {
    expect(CFO_ADVISOR_SPEC.currentAuthorityCeiling).toBe("L2-recommend");
  });

  it("declares all 6 automation levels (L0–L5)", () => {
    const levels = CFO_ADVISOR_SPEC.automationMatrix.map((m) => m.level).sort();
    expect(levels).toEqual(["L0", "L1", "L2", "L3", "L4", "L5"]);
  });

  it("escalates to Taxes & Laws for tax/legal interpretation", () => {
    const targets = CFO_ADVISOR_SPEC.escalatesTo.map((e) => e.advisorId);
    expect(targets).toContain("taxes-laws-advisor");
    expect(targets).toContain("ceo-advisor");
  });

  it("blocks money movement and tax filings in disallowedAutonomousActions", () => {
    const joined = CFO_ADVISOR_SPEC.disallowedAutonomousActions.join(" | ").toLowerCase();
    expect(joined).toMatch(/payment|transfer|payroll|money/);
    expect(joined).toMatch(/tax|filing|return|journal/);
  });

  it("declares the ad-spend-roi simulation as nonAuthoritative", () => {
    const sim = CFO_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "ad-spend-roi-scenario"
    );
    expect(sim).toBeDefined();
    expect(sim?.nonAuthoritative).toBe(true);
  });
});