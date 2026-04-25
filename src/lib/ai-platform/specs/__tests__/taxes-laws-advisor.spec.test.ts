// ═══════════════════════════════════════════════════════════════
// SITA OS — Taxes & Laws Advisor spec structural tests
// Verifies completeness, the L1-suggest ceiling, and the
// licensed-practice deference baked into the spec.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { TAXES_LAWS_ADVISOR_SPEC } from "../taxes-laws-advisor.spec";
import { validateAdvisorSpec } from "../spec-types";

describe("TAXES_LAWS_ADVISOR_SPEC", () => {
  it("passes validateAdvisorSpec with zero issues", () => {
    const issues = validateAdvisorSpec(TAXES_LAWS_ADVISOR_SPEC);
    expect(issues).toEqual([]);
  });

  it("targets the taxes-laws-advisor id", () => {
    expect(TAXES_LAWS_ADVISOR_SPEC.id).toBe("taxes-laws-advisor");
  });

  it("ceiling is L1-suggest (no autonomous filings, signatures, or final rulings)", () => {
    expect(TAXES_LAWS_ADVISOR_SPEC.currentAuthorityCeiling).toBe("L1-suggest");
  });

  it("declares all 6 automation levels (L0–L5)", () => {
    const levels = TAXES_LAWS_ADVISOR_SPEC.automationMatrix.map((m) => m.level).sort();
    expect(levels).toEqual(["L0", "L1", "L2", "L3", "L4", "L5"]);
  });

  it("escalates to CFO, CEO, Imports & Exports, Sales, and Tech advisors", () => {
    const targets = TAXES_LAWS_ADVISOR_SPEC.escalatesTo.map((e) => e.advisorId);
    expect(targets).toContain("cfo-advisor");
    expect(targets).toContain("ceo-advisor");
    expect(targets).toContain("imports-exports-advisor");
    expect(targets).toContain("sales-advisor");
    expect(targets).toContain("tech-advisor");
  });

  it("blocks filings, signatures, final rulings, and representation in disallowedAutonomousActions", () => {
    const joined = TAXES_LAWS_ADVISOR_SPEC.disallowedAutonomousActions
      .join(" | ")
      .toLowerCase();
    expect(joined).toMatch(/filing|file|return/);
    expect(joined).toMatch(/sign|contract|settlement|election/);
    expect(joined).toMatch(/ruling|advice|advise/);
    expect(joined).toMatch(/audit|dispute|proceeding|representing/);
  });

  it("flags every simulation scenario as nonAuthoritative (preparation only)", () => {
    for (const sc of TAXES_LAWS_ADVISOR_SPEC.simulation.scenarios) {
      expect(sc.nonAuthoritative).toBe(true);
    }
    const ids = TAXES_LAWS_ADVISOR_SPEC.simulation.scenarios.map((s) => s.id).sort();
    expect(ids).toEqual([
      "contract-issue-spot-scenario",
      "deadline-prep-window-scenario",
      "entity-structure-tradeoff-scenario",
      "jurisdiction-trigger-impact-scenario",
    ]);
  });

  it("issue-spot scenario emits numbered issues with severity and a counsel question", () => {
    const sc = TAXES_LAWS_ADVISOR_SPEC.simulation.scenarios.find(
      (s) => s.id === "contract-issue-spot-scenario"
    );
    const outputs = (sc?.outputs ?? []).join(" ").toLowerCase();
    expect(outputs).toMatch(/numbered/);
    expect(outputs).toMatch(/severity/);
    expect(outputs).toMatch(/counsel/);
  });

  it("trust rules require licensed-practice deference and per-jurisdiction handling", () => {
    const joined = TAXES_LAWS_ADVISOR_SPEC.trustRules.join(" | ").toLowerCase();
    expect(joined).toMatch(/licensed/);
    expect(joined).toMatch(/attorney|cpa|enrolled agent|qualified professional/);
    expect(joined).toMatch(/jurisdiction/);
    expect(joined).toMatch(/handoff|hand off|hand-off/);
  });

  it("registers in the global spec registry on import", async () => {
    await import("../taxes-laws-advisor.spec");
    const { getAdvisorSpec } = await import("../spec-registry");
    expect(getAdvisorSpec("taxes-laws-advisor")?.id).toBe("taxes-laws-advisor");
  });
});