// ═══════════════════════════════════════════════════════════════
// SITA OS — Customer Service Advisor spec structural tests
// Verifies completeness, authority ceiling, and required scenarios.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { CUSTOMER_SERVICE_ADVISOR_SPEC } from "../customer-service-advisor.spec";
import { validateAdvisorSpec } from "../spec-types";

describe("CUSTOMER_SERVICE_ADVISOR_SPEC", () => {
  it("passes validateAdvisorSpec with zero issues", () => {
    const issues = validateAdvisorSpec(CUSTOMER_SERVICE_ADVISOR_SPEC);
    expect(issues).toEqual([]);
  });

  it("targets the customer-service-advisor id", () => {
    expect(CUSTOMER_SERVICE_ADVISOR_SPEC.id).toBe("customer-service-advisor");
  });

  it("ceiling is L3-draft (no autonomous external sends or refunds)", () => {
    expect(CUSTOMER_SERVICE_ADVISOR_SPEC.currentAuthorityCeiling).toBe("L3-draft");
  });

  it("declares all 6 automation levels (L0–L5)", () => {
    const levels = CUSTOMER_SERVICE_ADVISOR_SPEC.automationMatrix.map((m) => m.level).sort();
    expect(levels).toEqual(["L0", "L1", "L2", "L3", "L4", "L5"]);
  });

  it("escalates to CFO for refunds and to Tech for clusters", () => {
    const targets = CUSTOMER_SERVICE_ADVISOR_SPEC.escalatesTo.map((e) => e.advisorId);
    expect(targets).toContain("cfo-advisor");
    expect(targets).toContain("tech-advisor");
  });

  it("blocks refunds and external sends in disallowedAutonomousActions", () => {
    const joined = CUSTOMER_SERVICE_ADVISOR_SPEC.disallowedAutonomousActions.join(" | ").toLowerCase();
    expect(joined).toMatch(/refund/);
    expect(joined).toMatch(/external/);
  });

  it("declares the refund-vs-goodwill simulation as nonAuthoritative", () => {
    const sim = CUSTOMER_SERVICE_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "refund-vs-goodwill-framing"
    );
    expect(sim).toBeDefined();
    expect(sim?.nonAuthoritative).toBe(true);
  });
});
