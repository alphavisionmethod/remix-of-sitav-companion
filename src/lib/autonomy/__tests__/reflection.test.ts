import { describe, it, expect } from "vitest";
import { scoreReflection, type ReflectionInput } from "../reflection";

const base: ReflectionInput = {
  advisorId: "cfo-advisor",
  domain: "finance",
  actionKey: "cfo.draft_burn_review",
  status: "executed",
  ownerAction: "auto_executed",
  riskClass: "reversible_safe",
  confidence: 0.82,
  decision: "auto_execute",
  decisionReason: "within_l3_ceiling",
  policyWarnings: [],
  isClientFacing: false,
  draftOnly: true,
  financialImpactCents: 0,
};

describe("scoreReflection", () => {
  it("rewards a clean auto-executed cycle", () => {
    const s = scoreReflection(base);
    expect(s.outcomeQuality).toBeGreaterThanOrEqual(0.7);
    expect(s.executionFitness).toBeGreaterThanOrEqual(0.8);
    expect(s.shouldRepeat).toBe(true);
    expect(s.patternTags).toContain("risk:reversible_safe");
    expect(s.patternTags).toContain("owner:auto_executed");
    expect(s.patternTags).toContain("draft-only");
  });

  it("penalises owner rejection", () => {
    const s = scoreReflection({
      ...base,
      status: "rejected",
      ownerAction: "rejected",
      decision: "queue_for_approval",
    });
    expect(s.outcomeQuality).toBeLessThan(0.3);
    expect(s.shouldRepeat).toBe(false);
    expect(s.lessonLearned.toLowerCase()).toContain("reject");
  });

  it("severely penalises an L3 policy breach (irreversible auto-execute)", () => {
    const s = scoreReflection({
      ...base,
      riskClass: "irreversible",
      decision: "auto_execute",
      policyWarnings: ["Irreversible action"],
    });
    expect(s.executionFitness).toBeLessThanOrEqual(0.2);
    expect(s.patternTags).toContain("policy-breach");
  });

  it("rewards approved high-confidence plan", () => {
    const s = scoreReflection({
      ...base,
      ownerAction: "approved",
      decision: "queue_for_approval",
      confidence: 0.9,
    });
    expect(s.outcomeQuality).toBeGreaterThanOrEqual(0.8);
    expect(s.recommendationQuality).toBeGreaterThanOrEqual(0.9);
    expect(s.lessonLearned.toLowerCase()).toMatch(/approved|calibration/);
  });

  it("flags failures with the error message in the lesson", () => {
    const s = scoreReflection({
      ...base,
      status: "failed",
      ownerAction: "failed_no_owner",
      errorMessage: "rate_limit_exceeded",
    });
    expect(s.outcomeQuality).toBeLessThan(0.2);
    expect(s.lessonLearned).toContain("rate_limit_exceeded");
  });

  it("clamps scores to [0,1]", () => {
    const s = scoreReflection({
      ...base,
      policyWarnings: ["a", "b", "c", "d", "e", "f"],
      confidence: 1.5,
    });
    expect(s.executionFitness).toBeGreaterThanOrEqual(0);
    expect(s.executionFitness).toBeLessThanOrEqual(1);
    expect(s.recommendationQuality).toBeLessThanOrEqual(1);
  });
});