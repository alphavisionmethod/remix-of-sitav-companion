import { describe, it, expect } from "vitest";
import { evaluateRefusal, createCleanRefusal } from "../refusal";
import type { ConfidenceEnvelope, StalenessState, ContradictionReport } from "../types";

const cleanConfidence: ConfidenceEnvelope = {
  score: 0.95, riskClass: "medium", reasons: [], missingInputs: [],
  staleInputs: [], downgradedFields: [], isRefused: false,
};
const freshStaleness: StalenessState = { sources: [], overallFreshness: "fresh" };
const noContradictions: ContradictionReport = { contradictions: [], recommendedDowngrade: null };

describe("evaluateRefusal", () => {
  it("does not refuse when everything is clean", () => {
    const result = evaluateRefusal({
      confidence: cleanConfidence, staleness: freshStaleness, contradictions: noContradictions,
      requiredInputs: ["a", "b"], presentInputs: ["a", "b"], policyStateKnown: true,
    });
    expect(result.refused).toBe(false);
    expect(result.downgradeLevel).not.toBe("refuse");
  });

  it("refuses when confidence isRefused is true", () => {
    const result = evaluateRefusal({
      confidence: { ...cleanConfidence, isRefused: true, score: 0.1 },
      staleness: freshStaleness, contradictions: noContradictions,
      requiredInputs: [], presentInputs: [], policyStateKnown: true,
    });
    expect(result.refused).toBe(true);
    expect(result.downgradeLevel).toBe("refuse");
  });

  it("refuses when >50% required inputs missing", () => {
    const result = evaluateRefusal({
      confidence: cleanConfidence, staleness: freshStaleness, contradictions: noContradictions,
      requiredInputs: ["a", "b", "c", "d"], presentInputs: ["a"], policyStateKnown: true,
    });
    expect(result.refused).toBe(true);
  });

  it("refuses when policy unknown for critical-truth", () => {
    const result = evaluateRefusal({
      confidence: { ...cleanConfidence, riskClass: "critical-truth" },
      staleness: freshStaleness, contradictions: noContradictions,
      requiredInputs: [], presentInputs: [], policyStateKnown: false,
    });
    expect(result.refused).toBe(true);
  });

  it("downgrades to low-confidence on material contradictions", () => {
    const result = evaluateRefusal({
      confidence: cleanConfidence, staleness: freshStaleness,
      contradictions: {
        contradictions: [{ field: "x", sourceA: "a", valueA: "1", sourceB: "b", valueB: "2", severity: "material" }],
        recommendedDowngrade: null,
      },
      requiredInputs: [], presentInputs: [], policyStateKnown: true,
    });
    expect(result.downgradeLevel).toBe("low-confidence");
  });

  it("adds caveat on stale data", () => {
    const result = evaluateRefusal({
      confidence: cleanConfidence,
      staleness: { sources: [], overallFreshness: "stale" },
      contradictions: noContradictions,
      requiredInputs: [], presentInputs: [], policyStateKnown: true,
    });
    expect(result.downgradeLevel).toBe("caveat");
  });
});

describe("createCleanRefusal", () => {
  it("returns a non-refused state", () => {
    const r = createCleanRefusal();
    expect(r.refused).toBe(false);
    expect(r.downgradeLevel).toBe("none");
  });
});
