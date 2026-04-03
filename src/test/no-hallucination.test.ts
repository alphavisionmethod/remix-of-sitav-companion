import { describe, it, expect } from "vitest";
import {
  createConfidenceEnvelope,
  shouldDowngrade,
  classifyRisk,
  evaluateStaleness,
  getStaleSourceNames,
  shouldBlockOnStaleness,
  detectContradictions,
  createEmptyContradictionReport,
  buildCrossDomainDataPoints,
  evaluateRefusal,
  createCleanRefusal,
  buildGroundingReport,
  createEmptyGroundingReport,
  mergeGroundingReports,
  getTruthBoundary,
  isDeterministicField,
  getDomainBoundaries,
  getAdvisorContract,
  getOutputClassLabel,
  isActionBlocked,
} from "@/lib/no-hallucination";

// ── Helpers ───────────────────────────────────────────────

const freshStaleness = () => evaluateStaleness([
  { id: "s1", name: "Source1", domain: "finance", lastUpdated: new Date().toISOString() },
], {});

const emptyContradictions = () => createEmptyContradictionReport();

// ── Confidence Engine ─────────────────────────────────────

describe("Confidence Engine", () => {
  it("returns high score with perfect inputs", () => {
    const env = createConfidenceEnvelope({
      baseScore: 0.95,
      riskClass: "low",
      missingInputs: [],
      staleness: freshStaleness(),
      contradictions: emptyContradictions(),
      totalExpectedFields: 10,
      totalPresentFields: 10,
    });
    expect(env.score).toBeGreaterThanOrEqual(0.9);
    expect(env.isRefused).toBe(false);
    expect(env.reasons).toContain("All inputs present and fresh");
  });

  it("penalizes missing inputs by 0.08 each", () => {
    const env = createConfidenceEnvelope({
      baseScore: 0.95,
      riskClass: "low",
      missingInputs: ["a", "b", "c"],
      staleness: freshStaleness(),
      contradictions: emptyContradictions(),
      totalExpectedFields: 10,
      totalPresentFields: 10,
    });
    // 0.95 - 3*0.08 = 0.71
    expect(env.score).toBeCloseTo(0.71, 1);
  });

  it("penalizes stale sources", () => {
    const stale = evaluateStaleness([
      { id: "s1", name: "OldSource", domain: "finance", lastUpdated: "2020-01-01T00:00:00Z" },
    ], {});
    const env = createConfidenceEnvelope({
      baseScore: 0.95,
      riskClass: "low",
      missingInputs: [],
      staleness: stale,
      contradictions: emptyContradictions(),
      totalExpectedFields: 10,
      totalPresentFields: 10,
    });
    expect(env.score).toBeLessThan(0.95);
    expect(env.staleInputs).toContain("OldSource");
  });

  it("penalizes material contradictions and downgrades fields", () => {
    const contradictions = detectContradictions([
      { field: "balance", value: "$1000", source: "bank", domain: "finance" },
      { field: "balance", value: "$2000", source: "ledger", domain: "finance" },
    ]);
    const env = createConfidenceEnvelope({
      baseScore: 0.95,
      riskClass: "high",
      missingInputs: [],
      staleness: freshStaleness(),
      contradictions,
      totalExpectedFields: 10,
      totalPresentFields: 10,
    });
    expect(env.score).toBeLessThan(0.85);
    expect(env.downgradedFields).toContain("balance");
  });

  it("refuses critical-truth with low score", () => {
    const env = createConfidenceEnvelope({
      baseScore: 0.5,
      riskClass: "critical-truth",
      missingInputs: ["a", "b", "c"],
      staleness: freshStaleness(),
      contradictions: emptyContradictions(),
      totalExpectedFields: 10,
      totalPresentFields: 7,
    });
    expect(env.isRefused).toBe(true);
  });

  it("shouldDowngrade returns true for critical-truth below 0.8", () => {
    const env = createConfidenceEnvelope({
      baseScore: 0.75,
      riskClass: "critical-truth",
      missingInputs: [],
      staleness: freshStaleness(),
      contradictions: emptyContradictions(),
      totalExpectedFields: 10,
      totalPresentFields: 10,
    });
    expect(shouldDowngrade(env)).toBe(true);
  });

  it("classifyRisk maps finance+balance to critical-truth", () => {
    expect(classifyRisk("finance", "balance")).toBe("critical-truth");
    expect(classifyRisk("finance", "recommendation")).toBe("high");
    expect(classifyRisk("other", "summary")).toBe("medium");
    expect(classifyRisk("other", "chat")).toBe("low");
  });
});

// ── Staleness Engine ──────────────────────────────────────

describe("Staleness Engine", () => {
  it("returns fresh when all sources are current", () => {
    const state = evaluateStaleness([
      { id: "s1", name: "A", domain: "finance", lastUpdated: new Date().toISOString() },
      { id: "s2", name: "B", domain: "business", lastUpdated: new Date().toISOString() },
    ]);
    expect(state.overallFreshness).toBe("fresh");
    expect(getStaleSourceNames(state)).toHaveLength(0);
    expect(shouldBlockOnStaleness(state)).toBe(false);
  });

  it("returns stale when minority of sources are old", () => {
    const state = evaluateStaleness([
      { id: "s1", name: "Fresh1", domain: "business", lastUpdated: new Date().toISOString() },
      { id: "s2", name: "Fresh2", domain: "business", lastUpdated: new Date().toISOString() },
      { id: "s3", name: "Old", domain: "finance", lastUpdated: "2020-01-01T00:00:00Z" },
    ]);
    expect(state.overallFreshness).toBe("stale");
    expect(getStaleSourceNames(state)).toContain("Old");
  });

  it("returns critical when half+ sources are stale", () => {
    const state = evaluateStaleness([
      { id: "s1", name: "Old1", domain: "finance", lastUpdated: "2020-01-01T00:00:00Z" },
      { id: "s2", name: "Old2", domain: "business", lastUpdated: "2020-01-01T00:00:00Z" },
    ]);
    expect(state.overallFreshness).toBe("critical");
    expect(shouldBlockOnStaleness(state)).toBe(true);
  });

  it("detects aging at 70% threshold", () => {
    // Finance threshold is 4h. 70% = 2.8h. Set source at 3h ago → aging
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const state = evaluateStaleness([
      { id: "s1", name: "Aging", domain: "finance", lastUpdated: threeHoursAgo },
    ]);
    // 3h < 4h so not stale, but 3h > 2.8h so aging
    expect(state.overallFreshness).toBe("aging");
  });
});

// ── Contradiction Engine ──────────────────────────────────

describe("Contradiction Engine", () => {
  it("returns empty when values match", () => {
    const report = detectContradictions([
      { field: "status", value: "active", source: "crm", domain: "business" },
      { field: "status", value: "active", source: "erp", domain: "business" },
    ]);
    expect(report.contradictions).toHaveLength(0);
    expect(report.recommendedDowngrade).toBeNull();
  });

  it("detects material contradiction on financial fields", () => {
    const report = detectContradictions([
      { field: "balance", value: "$1000", source: "bank", domain: "finance" },
      { field: "balance", value: "$5000", source: "ledger", domain: "finance" },
    ]);
    expect(report.contradictions).toHaveLength(1);
    expect(report.contradictions[0].severity).toBe("material");
    expect(report.recommendedDowngrade).toBeTruthy();
  });

  it("marks cross-domain contradictions as material", () => {
    const report = detectContradictions([
      { field: "revenue", value: "$100", source: "crm", domain: "business" },
      { field: "revenue", value: "$200", source: "accounting", domain: "finance" },
    ]);
    expect(report.contradictions[0].severity).toBe("material");
  });

  it("detects numeric divergence >10% as material", () => {
    const report = detectContradictions([
      { field: "count", value: "100", source: "a", domain: "business" },
      { field: "count", value: "120", source: "b", domain: "business" },
    ]);
    // 20% divergence
    expect(report.contradictions[0].severity).toBe("material");
  });

  it("buildCrossDomainDataPoints creates obligation data points", () => {
    const points = buildCrossDomainDataPoints({
      invoices: [
        { id: "1", status: "pending", amount: "$500" },
        { id: "2", status: "paid", amount: "$300" },
      ],
      cashFlow: { available: "$2000", outgoing: "$800" },
    });
    expect(points.length).toBeGreaterThanOrEqual(2);
    expect(points.some(p => p.field === "outstanding_obligations")).toBe(true);
    expect(points.some(p => p.field === "committed_outgoing")).toBe(true);
  });
});

// ── Refusal Engine ────────────────────────────────────────

describe("Refusal Engine", () => {
  const cleanConfidence = (): any => ({
    score: 0.95,
    riskClass: "low" as const,
    reasons: [],
    missingInputs: [],
    staleInputs: [],
    downgradedFields: [],
    isRefused: false,
  });

  it("createCleanRefusal is not refused", () => {
    const r = createCleanRefusal();
    expect(r.refused).toBe(false);
    expect(r.downgradeLevel).toBe("none");
  });

  it("refuses when confidence envelope is refused", () => {
    const r = evaluateRefusal({
      confidence: { ...cleanConfidence(), isRefused: true, score: 0.2, riskClass: "critical-truth" },
      staleness: freshStaleness(),
      contradictions: emptyContradictions(),
      requiredInputs: ["a"],
      presentInputs: ["a"],
      policyStateKnown: true,
    });
    expect(r.refused).toBe(true);
    expect(r.downgradeLevel).toBe("refuse");
  });

  it("refuses when >50% required inputs missing", () => {
    const r = evaluateRefusal({
      confidence: cleanConfidence(),
      staleness: freshStaleness(),
      contradictions: emptyContradictions(),
      requiredInputs: ["a", "b", "c", "d"],
      presentInputs: ["a"],
      policyStateKnown: true,
    });
    expect(r.refused).toBe(true);
    expect(r.reason).toContain("missing");
  });

  it("refuses when policy unknown for critical-truth", () => {
    const r = evaluateRefusal({
      confidence: { ...cleanConfidence(), riskClass: "critical-truth" },
      staleness: freshStaleness(),
      contradictions: emptyContradictions(),
      requiredInputs: [],
      presentInputs: [],
      policyStateKnown: false,
    });
    expect(r.refused).toBe(true);
    expect(r.reason).toContain("Policy state unknown");
  });

  it("downgrades to low-confidence on material contradictions", () => {
    const contradictions = detectContradictions([
      { field: "balance", value: "$100", source: "a", domain: "finance" },
      { field: "balance", value: "$999", source: "b", domain: "finance" },
    ]);
    const r = evaluateRefusal({
      confidence: cleanConfidence(),
      staleness: freshStaleness(),
      contradictions,
      requiredInputs: ["a"],
      presentInputs: ["a"],
      policyStateKnown: true,
    });
    expect(r.refused).toBe(false);
    expect(r.downgradeLevel).toBe("low-confidence");
  });

  it("downgrades to caveat on stale data", () => {
    const staleness = evaluateStaleness([
      { id: "s1", name: "Old", domain: "finance", lastUpdated: "2020-01-01T00:00:00Z" },
      { id: "s2", name: "Fresh", domain: "business", lastUpdated: new Date().toISOString() },
    ]);
    const r = evaluateRefusal({
      confidence: cleanConfidence(),
      staleness,
      contradictions: emptyContradictions(),
      requiredInputs: ["a"],
      presentInputs: ["a"],
      policyStateKnown: true,
    });
    expect(["caveat", "low-confidence"]).toContain(r.downgradeLevel);
  });
});

// ── Grounding Engine ──────────────────────────────────────

describe("Grounding Engine", () => {
  it("classifies verbatim vs derived fields", () => {
    const report = buildGroundingReport([
      { fieldName: "balance", value: 1000, sourceId: "s1", sourceName: "Bank", isVerbatim: true },
      { fieldName: "projection", value: 1200, sourceId: "s1", sourceName: "Bank", isVerbatim: false },
    ]);
    expect(report.verbatimFields).toContain("balance");
    expect(report.derivedFields).toContain("projection");
    expect(report.sources).toHaveLength(1);
  });

  it("detects ungrounded claims (no source)", () => {
    const report = buildGroundingReport([
      { fieldName: "mystery", value: 42, isVerbatim: true },
    ]);
    expect(report.ungroundedClaims).toContain("mystery");
  });

  it("mergeGroundingReports deduplicates sources", () => {
    const r1 = buildGroundingReport([
      { fieldName: "a", value: 1, sourceId: "s1", sourceName: "X", isVerbatim: true },
    ]);
    const r2 = buildGroundingReport([
      { fieldName: "b", value: 2, sourceId: "s1", sourceName: "X", isVerbatim: false },
    ]);
    const merged = mergeGroundingReports(r1, r2);
    expect(merged.sources).toHaveLength(1);
    expect(merged.sources[0].fieldsCited).toContain("a");
    expect(merged.sources[0].fieldsCited).toContain("b");
  });

  it("createEmptyGroundingReport is empty", () => {
    const r = createEmptyGroundingReport();
    expect(r.sources).toHaveLength(0);
    expect(r.ungroundedClaims).toHaveLength(0);
  });
});

// ── Truth Boundaries ──────────────────────────────────────

describe("Truth Boundaries", () => {
  it("finance balance is neverFromLLM", () => {
    const rule = getTruthBoundary("finance", "balance");
    expect(rule).toBeDefined();
    expect(rule!.neverFromLLM).toBe(true);
    expect(isDeterministicField("finance", "balance")).toBe(true);
  });

  it("unknown field returns undefined", () => {
    expect(getTruthBoundary("finance", "nonexistent")).toBeUndefined();
    expect(isDeterministicField("finance", "nonexistent")).toBe(false);
  });

  it("getDomainBoundaries returns correct count", () => {
    const finance = getDomainBoundaries("finance");
    expect(finance.length).toBe(10);
    const business = getDomainBoundaries("business");
    expect(business.length).toBe(8);
  });
});

// ── Advisor Contract ──────────────────────────────────────

describe("Advisor Contract", () => {
  it("returns correct config for known advisor", () => {
    const money = getAdvisorContract("money");
    expect(money.advisorId).toBe("money");
    expect(money.domain).toBe("finance");
    expect(money.confidenceThreshold).toBe(0.7);
  });

  it("falls back to general for unknown advisor", () => {
    const unknown = getAdvisorContract("nonexistent");
    expect(unknown.advisorId).toBe("general");
  });

  it("isActionBlocked blocks stale actions", () => {
    expect(isActionBlocked("money", "execute_payment", true)).toBe(true);
    expect(isActionBlocked("money", "execute_payment", false)).toBe(false);
    expect(isActionBlocked("money", "random_action", true)).toBe(false);
  });

  it("getOutputClassLabel maps all classes", () => {
    expect(getOutputClassLabel("observation")).toBe("Observation");
    expect(getOutputClassLabel("recommendation")).toBe("Recommendation");
    expect(getOutputClassLabel("draft")).toBe("Draft");
    expect(getOutputClassLabel("simulation")).toBe("Simulation");
    expect(getOutputClassLabel("approval-ready")).toBe("Approval Ready");
  });
});
