import { describe, it, expect } from "vitest";
import { getTruthBoundary, isDeterministicField, getDomainBoundaries, ALL_TRUTH_BOUNDARIES } from "../truth-boundaries";

describe("getTruthBoundary", () => {
  it("finds finance.balance rule", () => {
    const rule = getTruthBoundary("finance", "balance");
    expect(rule).toBeDefined();
    expect(rule!.neverFromLLM).toBe(true);
    expect(rule!.requiredSource).toBe("deterministic");
  });

  it("finds business.lead_state rule", () => {
    const rule = getTruthBoundary("business", "lead_state");
    expect(rule).toBeDefined();
    expect(rule!.requiredSource).toBe("canonical-record");
  });

  it("returns undefined for non-existent rule", () => {
    expect(getTruthBoundary("unknown", "unknown")).toBeUndefined();
  });
});

describe("isDeterministicField", () => {
  it("returns true for finance.balance", () => {
    expect(isDeterministicField("finance", "balance")).toBe(true);
  });

  it("returns true for trust.policy_decision", () => {
    expect(isDeterministicField("trust", "policy_decision")).toBe(true);
  });

  it("returns false for unregistered fields", () => {
    expect(isDeterministicField("random", "field")).toBe(false);
  });
});

describe("getDomainBoundaries", () => {
  it("returns all finance boundaries", () => {
    const boundaries = getDomainBoundaries("finance");
    expect(boundaries.length).toBeGreaterThan(5);
    expect(boundaries.every(b => b.domain === "finance")).toBe(true);
  });

  it("returns empty array for unknown domain", () => {
    expect(getDomainBoundaries("nonexistent")).toHaveLength(0);
  });
});

describe("ALL_TRUTH_BOUNDARIES", () => {
  it("contains rules from all four domains", () => {
    const domains = new Set(ALL_TRUTH_BOUNDARIES.map(r => r.domain));
    expect(domains).toContain("finance");
    expect(domains).toContain("business");
    expect(domains).toContain("concierge");
    expect(domains).toContain("trust");
  });
});
