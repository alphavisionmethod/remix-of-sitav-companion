// ═══════════════════════════════════════════════════════════════
// SITA OS — CEO Advisor spec structural tests
// Verifies completeness, the L2-recommend ceiling, the apex
// synthesis posture (empty escalatesTo, populated synthesizesFrom),
// the cross-function tradeoff bias, and the operator-decides
// authority boundary baked into the spec.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { CEO_ADVISOR_SPEC } from "../ceo-advisor.spec";
import { validateAdvisorSpec } from "../spec-types";

describe("CEO_ADVISOR_SPEC", () => {
  it("passes validateAdvisorSpec with zero issues", () => {
    const issues = validateAdvisorSpec(CEO_ADVISOR_SPEC);
    expect(issues).toEqual([]);
  });

  it("targets the ceo-advisor id", () => {
    expect(CEO_ADVISOR_SPEC.id).toBe("ceo-advisor");
  });

  it("ceiling is L2-recommend (no autonomous strategic commits)", () => {
    expect(CEO_ADVISOR_SPEC.currentAuthorityCeiling).toBe("L2-recommend");
  });

  it("declares all 6 automation levels (L0–L5)", () => {
    const levels = CEO_ADVISOR_SPEC.automationMatrix.map((m) => m.level).sort();
    expect(levels).toEqual(["L0", "L1", "L2", "L3", "L4", "L5"]);
  });

  it("escalatesTo is empty (CEO is the apex synthesis advisor)", () => {
    expect(CEO_ADVISOR_SPEC.escalatesTo).toEqual([]);
  });

  it("synthesizesFrom lists all 8 other Business System advisors", () => {
    const from = [...(CEO_ADVISOR_SPEC.synthesizesFrom ?? [])].sort();
    expect(from).toEqual(
      [
        "cfo-advisor",
        "customer-service-advisor",
        "growth-advisor",
        "imports-exports-advisor",
        "marketing-advertising-advisor",
        "sales-advisor",
        "taxes-laws-advisor",
        "tech-advisor",
      ].sort()
    );
  });

  it("blocks strategic commits, external sends, function-level execution, and authority override", () => {
    const joined = CEO_ADVISOR_SPEC.disallowedAutonomousActions
      .join(" | ")
      .toLowerCase();
    expect(joined).toMatch(/strategic|market|pricing|org change/);
    expect(joined).toMatch(/external|stakeholder|investor|board|customer|press/);
    expect(joined).toMatch(/function-level|filing|signing|posting|paying|deploying/);
    expect(joined).toMatch(/override|authority/);
  });

  it("flags only the stress-test scenario as nonAuthoritative; framing scenarios are authoritative synthesis", () => {
    const map = new Map(
      CEO_ADVISOR_SPEC.simulation.scenarios.map((s) => [s.id, s.nonAuthoritative] as const)
    );
    expect(map.get("binding-constraint-detection-scenario")).toBe(false);
    expect(map.get("tradeoff-framing-scenario")).toBe(false);
    expect(map.get("advisor-conflict-triage-scenario")).toBe(false);
    expect(map.get("executive-stress-test-scenario")).toBe(true);
    const ids = [...map.keys()].sort();
    expect(ids).toEqual([
      "advisor-conflict-triage-scenario",
      "binding-constraint-detection-scenario",
      "executive-stress-test-scenario",
      "tradeoff-framing-scenario",
    ]);
  });

  it("tradeoff scenario emits cross-function impact, reversibility, and owning-advisor handoffs", () => {
    const sc = CEO_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "tradeoff-framing-scenario"
    );
    const outputs = (sc?.outputs ?? []).join(" ").toLowerCase();
    expect(outputs).toMatch(/crossfunctionimpact|cross-function/);
    expect(outputs).toMatch(/reversibility/);
    expect(outputs).toMatch(/owningadvisor|owning-advisor/);
    expect(outputs).toMatch(/operatordecisionrequired|operator-decision/);
  });

  it("conflict triage scenario routes the decision to the operator (never silently picks a side)", () => {
    const sc = CEO_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "advisor-conflict-triage-scenario"
    );
    const outputs = (sc?.outputs ?? []).join(" ").toLowerCase();
    expect(outputs).toMatch(/advisora/);
    expect(outputs).toMatch(/advisorb/);
    expect(outputs).toMatch(/operatordecisionrequired/);
    expect(outputs).toMatch(/owningadvisor/);
  });

  it("trust rules require operator-decides, owning-advisor handoff, and authority deference", () => {
    const joined = CEO_ADVISOR_SPEC.trustRules.join(" | ").toLowerCase();
    expect(joined).toMatch(/operator/);
    expect(joined).toMatch(/owning advisor|owning-advisor/);
    expect(joined).toMatch(/binding constraint/);
    expect(joined).toMatch(/recommend|recommendation/);
    expect(joined).toMatch(/never overrides|authority/);
  });

  it("registers in the global spec registry on import", async () => {
    await import("../ceo-advisor.spec");
    const { getAdvisorSpec } = await import("../spec-registry");
    expect(getAdvisorSpec("ceo-advisor")?.id).toBe("ceo-advisor");
  });
});
