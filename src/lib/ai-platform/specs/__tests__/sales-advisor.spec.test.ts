import { describe, it, expect } from "vitest";
import { SALES_ADVISOR_SPEC } from "../sales-advisor.spec";
import { getAdvisorSpec, validateAdvisorSpec } from "../index";

describe("Sales Advisor spec (Phase 1)", () => {
  it("is registered in the spec registry under the canonical id", () => {
    const fromRegistry = getAdvisorSpec("sales-advisor");
    expect(fromRegistry).toBeDefined();
    expect(fromRegistry?.id).toBe("sales-advisor");
    expect(fromRegistry).toBe(SALES_ADVISOR_SPEC);
  });

  it("passes the strict 23-section completeness gate with zero issues", () => {
    const issues = validateAdvisorSpec(SALES_ADVISOR_SPEC);
    expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
  });

  it("declares the L3-draft authority ceiling matching the runtime registry", () => {
    expect(SALES_ADVISOR_SPEC.currentAuthorityCeiling).toBe("L3-draft");
  });

  it("defines all six automation levels L0..L5 with non-empty canDo and mustNotDo", () => {
    const levels = SALES_ADVISOR_SPEC.automationMatrix.map((e) => e.level).sort();
    expect(levels).toEqual(["L0", "L1", "L2", "L3", "L4", "L5"]);
    for (const entry of SALES_ADVISOR_SPEC.automationMatrix) {
      expect(entry.canDo.length).toBeGreaterThan(0);
      expect(entry.mustNotDo.length).toBeGreaterThan(0);
    }
  });

  it("declares the four required simulation scenarios with documented outputs", () => {
    const ids = SALES_ADVISOR_SPEC.simulation.scenarios.map((s) => s.id).sort();
    expect(ids).toEqual([
      "follow-up-cadence-comparison",
      "message-angle-comparison",
      "pricing-positioning-comparison",
      "qualification-framework-comparison",
    ]);
    const pricing = SALES_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "pricing-positioning-comparison",
    );
    expect(pricing?.nonAuthoritative).toBe(true);
  });

  it("escalates to CFO, Taxes, Tech, and CEO advisors", () => {
    const targets = SALES_ADVISOR_SPEC.escalatesTo.map((e) => e.advisorId).sort();
    expect(targets).toEqual([
      "ceo-advisor",
      "cfo-advisor",
      "taxes-laws-advisor",
      "tech-advisor",
    ]);
  });

  it("forbids autonomous external sends and pricing/stage mutations", () => {
    const joined = SALES_ADVISOR_SPEC.disallowedAutonomousActions.join(" | ").toLowerCase();
    expect(joined).toMatch(/external|email|message/);
    expect(joined).toMatch(/pricing|stage|deal/);
  });
});