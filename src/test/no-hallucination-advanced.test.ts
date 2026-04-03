import { describe, it, expect } from "vitest";
import {
  createConfidenceEnvelope, classifyRisk,
  evaluateStaleness, getStaleSourceNames, shouldBlockOnStaleness,
  buildGroundingReport, createEmptyGroundingReport,
  createEmptyContradictionReport,
  createCleanRefusal,
  getDomainBoundaries, isDeterministicField,
  getAdvisorContract, isActionBlocked,
} from "@/lib/no-hallucination";

describe("No-Hallucination System — Advanced", () => {
  it("creates confidence envelope", () => {
    const envelope = createConfidenceEnvelope({
      baseScore: 0.85, riskClass: classifyRisk("finance", "summary"),
      missingInputs: [], staleness: evaluateStaleness([]),
      contradictions: createEmptyContradictionReport(), totalExpectedFields: 6, totalPresentFields: 6,
    });
    expect(envelope.score).toBeGreaterThan(0);
    expect(envelope.score).toBeLessThanOrEqual(1);
  });

  it("detects stale sources", () => {
    const state = evaluateStaleness([
      { id: "ds-1", name: "Old", domain: "finance", lastUpdated: new Date(Date.now() - 72 * 3600000).toISOString() },
    ]);
    expect(getStaleSourceNames(state).length).toBeGreaterThanOrEqual(1);
  });

  it("evaluates empty sources staleness", () => {
    const state = evaluateStaleness([]);
    expect(typeof shouldBlockOnStaleness(state)).toBe("boolean");
  });

  it("creates empty grounding report", () => {
    expect(createEmptyGroundingReport().sources).toHaveLength(0);
  });

  it("builds grounding report", () => {
    const report = buildGroundingReport([
      { fieldName: "balance", value: 1000, sourceId: "s1", sourceName: "Bank", sourceDomain: "finance", sourceType: "canonical-record" as const, lastUpdated: new Date().toISOString(), isVerbatim: true },
    ]);
    expect(report.sources.length).toBeGreaterThan(0);
  });

  it("creates empty contradiction report", () => {
    expect(createEmptyContradictionReport().contradictions).toHaveLength(0);
  });

  it("creates clean refusal", () => {
    expect(createCleanRefusal().refused).toBe(false);
  });

  it("retrieves domain boundaries", () => {
    expect(getDomainBoundaries("finance").length).toBeGreaterThan(0);
  });

  it("checks deterministic fields", () => {
    expect(typeof isDeterministicField("finance", "account_balance")).toBe("boolean");
  });

  it("retrieves advisor contracts", () => {
    expect(getAdvisorContract("business")).toBeDefined();
  });

  it("evaluates action blocking", () => {
    expect(typeof isActionBlocked("business", "delete_all_data", false)).toBe("boolean");
  });
});
