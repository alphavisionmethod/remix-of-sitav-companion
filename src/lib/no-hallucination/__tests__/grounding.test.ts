import { describe, it, expect } from "vitest";
import { buildGroundingReport, createEmptyGroundingReport, mergeGroundingReports } from "../grounding";

describe("buildGroundingReport", () => {
  it("classifies verbatim fields correctly", () => {
    const report = buildGroundingReport([
      { fieldName: "balance", value: 1000, sourceId: "s1", sourceName: "Bank", isVerbatim: true },
    ]);
    expect(report.verbatimFields).toContain("balance");
    expect(report.derivedFields).toHaveLength(0);
  });

  it("classifies derived fields correctly", () => {
    const report = buildGroundingReport([
      { fieldName: "netWorth", value: 5000, sourceId: "s1", sourceName: "Calc", isVerbatim: false },
    ]);
    expect(report.derivedFields).toContain("netWorth");
  });

  it("tracks ungrounded claims when source missing", () => {
    const report = buildGroundingReport([
      { fieldName: "estimate", value: 999, isVerbatim: false },
    ]);
    expect(report.ungroundedClaims).toContain("estimate");
    expect(report.sources).toHaveLength(0);
  });

  it("detects ambiguities for null/empty values", () => {
    const report = buildGroundingReport([
      { fieldName: "status", value: null, sourceId: "s1", sourceName: "CRM", isVerbatim: true },
      { fieldName: "name", value: "", sourceId: "s1", sourceName: "CRM", isVerbatim: true },
    ]);
    expect(report.ambiguities).toHaveLength(2);
  });

  it("deduplicates fields per source", () => {
    const report = buildGroundingReport([
      { fieldName: "a", value: 1, sourceId: "s1", sourceName: "X", isVerbatim: true },
      { fieldName: "a", value: 1, sourceId: "s1", sourceName: "X", isVerbatim: true },
    ]);
    expect(report.sources[0].fieldsCited).toHaveLength(1);
  });

  it("tracks multiple sources", () => {
    const report = buildGroundingReport([
      { fieldName: "a", value: 1, sourceId: "s1", sourceName: "X", isVerbatim: true },
      { fieldName: "b", value: 2, sourceId: "s2", sourceName: "Y", isVerbatim: true },
    ]);
    expect(report.sources).toHaveLength(2);
  });
});

describe("createEmptyGroundingReport", () => {
  it("returns empty arrays", () => {
    const r = createEmptyGroundingReport();
    expect(r.sources).toHaveLength(0);
    expect(r.ungroundedClaims).toHaveLength(0);
  });
});

describe("mergeGroundingReports", () => {
  it("merges sources and deduplicates", () => {
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
    expect(merged.verbatimFields).toContain("a");
    expect(merged.derivedFields).toContain("b");
  });
});
