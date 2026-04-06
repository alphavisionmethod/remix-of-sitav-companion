import { describe, it, expect } from "vitest";
import { createConfidenceEnvelope, shouldDowngrade, classifyRisk } from "../confidence";
import type { StalenessState, ContradictionReport } from "../types";

const freshStaleness: StalenessState = { sources: [], overallFreshness: "fresh" };
const emptyContradictions: ContradictionReport = { contradictions: [], recommendedDowngrade: null };

function makeEnvelope(overrides: Record<string, unknown> = {}) {
  return createConfidenceEnvelope({
    baseScore: 0.95,
    riskClass: "medium",
    missingInputs: [],
    staleness: freshStaleness,
    contradictions: emptyContradictions,
    totalExpectedFields: 10,
    totalPresentFields: 10,
    ...overrides,
  });
}

describe("createConfidenceEnvelope", () => {
  it("returns high confidence when all inputs present and fresh", () => {
    const env = makeEnvelope();
    expect(env.score).toBeGreaterThanOrEqual(0.85);
    expect(env.isRefused).toBe(false);
    expect(env.reasons).toContain("All inputs present and fresh");
  });

  it("penalizes missing inputs", () => {
    const env = makeEnvelope({ missingInputs: ["a", "b", "c"] });
    expect(env.score).toBeLessThan(0.95);
    expect(env.reasons.some((r: string) => r.includes("missing"))).toBe(true);
  });

  it("penalizes stale data sources", () => {
    const staleStaleness: StalenessState = {
      sources: [{ id: "s1", name: "Source1", lastUpdated: "", ageMs: 99999, threshold: 1000, isStale: true }],
      overallFreshness: "stale",
    };
    const env = makeEnvelope({ staleness: staleStaleness });
    expect(env.score).toBeLessThan(0.95);
    expect(env.staleInputs).toContain("Source1");
  });

  it("penalizes material contradictions", () => {
    const contradictions: ContradictionReport = {
      contradictions: [{ field: "balance", sourceA: "a", valueA: "100", sourceB: "b", valueB: "200", severity: "material" }],
      recommendedDowngrade: null,
    };
    const env = makeEnvelope({ contradictions });
    expect(env.score).toBeLessThan(0.95);
    expect(env.downgradedFields).toContain("balance");
  });

  it("clamps score between 0 and 1", () => {
    const env = makeEnvelope({ baseScore: -0.5 });
    expect(env.score).toBeGreaterThanOrEqual(0);
    const env2 = makeEnvelope({ baseScore: 1.5 });
    expect(env2.score).toBeLessThanOrEqual(1);
  });

  it("refuses critical-truth below 0.6", () => {
    const env = makeEnvelope({ baseScore: 0.5, riskClass: "critical-truth" });
    expect(env.isRefused).toBe(true);
  });

  it("refuses critical-truth with material contradictions", () => {
    const contradictions: ContradictionReport = {
      contradictions: [{ field: "price", sourceA: "a", valueA: "1", sourceB: "b", valueB: "2", severity: "material" }],
      recommendedDowngrade: null,
    };
    const env = makeEnvelope({ baseScore: 0.95, riskClass: "critical-truth", contradictions });
    expect(env.isRefused).toBe(true);
  });

  it("does not refuse low-risk even at low score", () => {
    const env = makeEnvelope({ baseScore: 0.1, riskClass: "low" });
    expect(env.isRefused).toBe(false);
  });

  it("penalizes incompleteness below 80%", () => {
    const env = makeEnvelope({ totalExpectedFields: 10, totalPresentFields: 5 });
    expect(env.score).toBeLessThan(0.95);
    expect(env.reasons.some((r: string) => r.includes("completeness"))).toBe(true);
  });
});

describe("shouldDowngrade", () => {
  it("returns true for refused envelopes", () => {
    const env = makeEnvelope({ baseScore: 0.1, riskClass: "critical-truth" });
    expect(shouldDowngrade(env)).toBe(true);
  });

  it("returns true for critical-truth below 0.8", () => {
    const env = makeEnvelope({ baseScore: 0.75, riskClass: "critical-truth" });
    expect(shouldDowngrade(env)).toBe(true);
  });

  it("returns false for high confidence medium risk", () => {
    const env = makeEnvelope({ baseScore: 0.95, riskClass: "medium" });
    expect(shouldDowngrade(env)).toBe(false);
  });
});

describe("classifyRisk", () => {
  it("returns critical-truth for finance+balance", () => {
    expect(classifyRisk("finance", "balance")).toBe("critical-truth");
  });

  it("returns high for finance+recommendation", () => {
    expect(classifyRisk("finance", "recommendation")).toBe("high");
  });

  it("returns medium for summary", () => {
    expect(classifyRisk("any", "summary")).toBe("medium");
  });

  it("returns low for unknown combos", () => {
    expect(classifyRisk("unknown", "unknown")).toBe("low");
  });
});
