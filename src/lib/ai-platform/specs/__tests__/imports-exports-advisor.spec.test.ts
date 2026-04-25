// ═══════════════════════════════════════════════════════════════
// SITA OS — Imports & Exports Advisor spec structural tests
// Verifies completeness, authority ceiling, and required scenarios.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { IMPORTS_EXPORTS_ADVISOR_SPEC } from "../imports-exports-advisor.spec";
import { validateAdvisorSpec } from "../spec-types";

describe("IMPORTS_EXPORTS_ADVISOR_SPEC", () => {
  it("passes validateAdvisorSpec with zero issues", () => {
    const issues = validateAdvisorSpec(IMPORTS_EXPORTS_ADVISOR_SPEC);
    expect(issues).toEqual([]);
  });

  it("targets the imports-exports-advisor id", () => {
    expect(IMPORTS_EXPORTS_ADVISOR_SPEC.id).toBe("imports-exports-advisor");
  });

  it("ceiling is L2-recommend (no autonomous filings, contracts, or shipment changes)", () => {
    expect(IMPORTS_EXPORTS_ADVISOR_SPEC.currentAuthorityCeiling).toBe("L2-recommend");
  });

  it("declares all 6 automation levels (L0–L5)", () => {
    const levels = IMPORTS_EXPORTS_ADVISOR_SPEC.automationMatrix.map((m) => m.level).sort();
    expect(levels).toEqual(["L0", "L1", "L2", "L3", "L4", "L5"]);
  });

  it("escalates to CFO for spend, Taxes & Laws for regulatory, CEO for strategy, Sales for deals, Tech for integrations", () => {
    const targets = IMPORTS_EXPORTS_ADVISOR_SPEC.escalatesTo.map((e) => e.advisorId);
    expect(targets).toContain("cfo-advisor");
    expect(targets).toContain("taxes-laws-advisor");
    expect(targets).toContain("ceo-advisor");
    expect(targets).toContain("sales-advisor");
    expect(targets).toContain("tech-advisor");
  });

  it("blocks customs filings, contract commits, and live shipment changes in disallowedAutonomousActions", () => {
    const joined = IMPORTS_EXPORTS_ADVISOR_SPEC.disallowedAutonomousActions
      .join(" | ")
      .toLowerCase();
    expect(joined).toMatch(/customs|declaration|regulatory/);
    expect(joined).toMatch(/supplier|contract|po|carrier/);
    expect(joined).toMatch(/shipment|reroute/);
    expect(joined).toMatch(/fx|hedge|prepayment/);
  });

  it("flags landed-cost, dual-source, and doc-gap simulations as nonAuthoritative", () => {
    const landed = IMPORTS_EXPORTS_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "landed-cost-comparison-scenario"
    );
    const dual = IMPORTS_EXPORTS_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "supplier-dual-source-scenario"
    );
    const doc = IMPORTS_EXPORTS_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "documentation-gap-impact-scenario"
    );
    expect(landed?.nonAuthoritative).toBe(true);
    expect(dual?.nonAuthoritative).toBe(true);
    expect(doc?.nonAuthoritative).toBe(true);
  });

  it("declares incoterm-tradeoff-scenario as authoritative (cost / control / risk axes)", () => {
    const inco = IMPORTS_EXPORTS_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "incoterm-tradeoff-scenario"
    );
    expect(inco?.nonAuthoritative).toBe(false);
    const outputs = (inco?.outputs ?? []).join(" ").toLowerCase();
    expect(outputs).toMatch(/cost/);
    expect(outputs).toMatch(/control/);
    expect(outputs).toMatch(/risk/);
  });

  it("registers in the global spec registry on import", async () => {
    await import("../imports-exports-advisor.spec");
    const { getAdvisorSpec } = await import("../spec-registry");
    expect(getAdvisorSpec("imports-exports-advisor")?.id).toBe("imports-exports-advisor");
  });
});