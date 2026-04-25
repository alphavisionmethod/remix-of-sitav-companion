// ═══════════════════════════════════════════════════════════════
// SITA OS — Growth Advisor spec structural tests
// Verifies completeness, authority ceiling, and required scenarios.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { GROWTH_ADVISOR_SPEC } from "../growth-advisor.spec";
import { validateAdvisorSpec } from "../spec-types";

describe("GROWTH_ADVISOR_SPEC", () => {
  it("passes validateAdvisorSpec with zero issues", () => {
    const issues = validateAdvisorSpec(GROWTH_ADVISOR_SPEC);
    expect(issues).toEqual([]);
  });

  it("targets the growth-advisor id", () => {
    expect(GROWTH_ADVISOR_SPEC.id).toBe("growth-advisor");
  });

  it("ceiling is L2-recommend (no autonomous launches, no autonomous gate changes)", () => {
    expect(GROWTH_ADVISOR_SPEC.currentAuthorityCeiling).toBe("L2-recommend");
  });

  it("declares all 6 automation levels (L0–L5)", () => {
    const levels = GROWTH_ADVISOR_SPEC.automationMatrix.map((m) => m.level).sort();
    expect(levels).toEqual(["L0", "L1", "L2", "L3", "L4", "L5"]);
  });

  it("escalates to CFO for pricing/payback and to CEO for strategic shifts", () => {
    const targets = GROWTH_ADVISOR_SPEC.escalatesTo.map((e) => e.advisorId);
    expect(targets).toContain("cfo-advisor");
    expect(targets).toContain("ceo-advisor");
    expect(targets).toContain("marketing-advertising-advisor");
    expect(targets).toContain("sales-advisor");
    expect(targets).toContain("tech-advisor");
  });

  it("blocks pricing/gate changes, experiment launches, and lifecycle sends in disallowedAutonomousActions", () => {
    const joined = GROWTH_ADVISOR_SPEC.disallowedAutonomousActions
      .join(" | ")
      .toLowerCase();
    expect(joined).toMatch(/pricing|plan|gate|paywall|packaging/);
    expect(joined).toMatch(/experiment|a\/b|feature[- ]flag/);
    expect(joined).toMatch(/lifecycle|message|email|send/);
  });

  it("flags funnel-fix, retention-bet, and scaling-priority simulations as nonAuthoritative", () => {
    const fixSim = GROWTH_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "funnel-fix-impact-scenario"
    );
    const retentionSim = GROWTH_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "retention-bet-comparison-scenario"
    );
    const scalingSim = GROWTH_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "scaling-priority-tradeoff-scenario"
    );
    expect(fixSim?.nonAuthoritative).toBe(true);
    expect(retentionSim?.nonAuthoritative).toBe(true);
    expect(scalingSim?.nonAuthoritative).toBe(true);
  });

  it("declares activation-experiment-comparison as authoritative (hypothesis + kill criteria)", () => {
    const expSim = GROWTH_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "activation-experiment-comparison-scenario"
    );
    expect(expSim?.nonAuthoritative).toBe(false);
    const outputs = (expSim?.outputs ?? []).join(" ").toLowerCase();
    expect(outputs).toMatch(/hypothesis/);
    expect(outputs).toMatch(/kill/);
  });

  it("registers in the global spec registry on import", async () => {
    await import("../growth-advisor.spec");
    const { getAdvisorSpec } = await import("../spec-registry");
    expect(getAdvisorSpec("growth-advisor")?.id).toBe("growth-advisor");
  });
});
