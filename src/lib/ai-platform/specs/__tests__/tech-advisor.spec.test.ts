// ═══════════════════════════════════════════════════════════════
// SITA OS — Tech Advisor spec structural tests
// Verifies completeness, authority ceiling, and required scenarios.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { TECH_ADVISOR_SPEC } from "../tech-advisor.spec";
import { validateAdvisorSpec } from "../spec-types";

describe("TECH_ADVISOR_SPEC", () => {
  it("passes validateAdvisorSpec with zero issues", () => {
    const issues = validateAdvisorSpec(TECH_ADVISOR_SPEC);
    expect(issues).toEqual([]);
  });

  it("targets the tech-advisor id", () => {
    expect(TECH_ADVISOR_SPEC.id).toBe("tech-advisor");
  });

  it("ceiling is L3-draft (no autonomous deploys, no autonomous infra changes)", () => {
    expect(TECH_ADVISOR_SPEC.currentAuthorityCeiling).toBe("L3-draft");
  });

  it("declares all 6 automation levels (L0–L5)", () => {
    const levels = TECH_ADVISOR_SPEC.automationMatrix.map((m) => m.level).sort();
    expect(levels).toEqual(["L0", "L1", "L2", "L3", "L4", "L5"]);
  });

  it("escalates to CFO for spend, CEO for platform shifts, Service for customer comms", () => {
    const targets = TECH_ADVISOR_SPEC.escalatesTo.map((e) => e.advisorId);
    expect(targets).toContain("cfo-advisor");
    expect(targets).toContain("ceo-advisor");
    expect(targets).toContain("customer-service-advisor");
    expect(targets).toContain("growth-advisor");
  });

  it("blocks deploys, breaking commits, and live infra changes in disallowedAutonomousActions", () => {
    const joined = TECH_ADVISOR_SPEC.disallowedAutonomousActions
      .join(" | ")
      .toLowerCase();
    expect(joined).toMatch(/deploy|infra|restart/);
    expect(joined).toMatch(/breaking|interface|api|schema/);
    expect(joined).toMatch(/dependency|feature flag|configuration/);
  });

  it("flags scaling, mitigation, and dependency-upgrade simulations as nonAuthoritative", () => {
    const scalingSim = TECH_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "scaling-option-comparison-scenario"
    );
    const mitigationSim = TECH_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "incident-mitigation-tradeoff-scenario"
    );
    const depSim = TECH_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "dependency-upgrade-order-scenario"
    );
    expect(scalingSim?.nonAuthoritative).toBe(true);
    expect(mitigationSim?.nonAuthoritative).toBe(true);
    expect(depSim?.nonAuthoritative).toBe(true);
  });

  it("declares migration-plan-simulation as authoritative (per-step blast radius + rollback)", () => {
    const migSim = TECH_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "migration-plan-simulation-scenario"
    );
    expect(migSim?.nonAuthoritative).toBe(false);
    const outputs = (migSim?.outputs ?? []).join(" ").toLowerCase();
    expect(outputs).toMatch(/blast/);
    expect(outputs).toMatch(/rollback/);
  });

  it("registers in the global spec registry on import", async () => {
    await import("../tech-advisor.spec");
    const { getAdvisorSpec } = await import("../spec-registry");
    expect(getAdvisorSpec("tech-advisor")?.id).toBe("tech-advisor");
  });
});
