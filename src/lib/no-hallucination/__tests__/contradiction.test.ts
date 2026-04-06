import { describe, it, expect } from "vitest";
import { detectContradictions, createEmptyContradictionReport, buildCrossDomainDataPoints } from "../contradiction";

describe("detectContradictions", () => {
  it("returns no contradictions when values match", () => {
    const report = detectContradictions([
      { field: "status", value: "active", source: "a", domain: "business" },
      { field: "status", value: "active", source: "b", domain: "business" },
    ]);
    expect(report.contradictions).toHaveLength(0);
  });

  it("detects conflicting values in same field", () => {
    const report = detectContradictions([
      { field: "balance", value: "$1000", source: "a", domain: "finance" },
      { field: "balance", value: "$2000", source: "b", domain: "finance" },
    ]);
    expect(report.contradictions).toHaveLength(1);
    expect(report.contradictions[0].severity).toBe("material");
  });

  it("classifies cross-domain contradictions as material", () => {
    const report = detectContradictions([
      { field: "status", value: "active", source: "a", domain: "business" },
      { field: "status", value: "inactive", source: "b", domain: "finance" },
    ]);
    expect(report.contradictions[0].severity).toBe("material");
  });

  it("classifies small numeric differences in same domain as minor", () => {
    const report = detectContradictions([
      { field: "count", value: "100", source: "a", domain: "business" },
      { field: "count", value: "102", source: "b", domain: "business" },
    ]);
    expect(report.contradictions[0].severity).toBe("minor");
  });

  it("classifies large numeric divergence as material", () => {
    const report = detectContradictions([
      { field: "count", value: "100", source: "a", domain: "business" },
      { field: "count", value: "200", source: "b", domain: "business" },
    ]);
    expect(report.contradictions[0].severity).toBe("material");
  });

  it("ignores empty values", () => {
    const report = detectContradictions([
      { field: "name", value: "Alice", source: "a", domain: "business" },
      { field: "name", value: "", source: "b", domain: "business" },
    ]);
    expect(report.contradictions).toHaveLength(0);
  });

  it("sets recommendedDowngrade when material contradictions exist", () => {
    const report = detectContradictions([
      { field: "balance", value: "$100", source: "a", domain: "finance" },
      { field: "balance", value: "$999", source: "b", domain: "finance" },
    ]);
    expect(report.recommendedDowngrade).toBeTruthy();
  });
});

describe("createEmptyContradictionReport", () => {
  it("returns empty report", () => {
    const r = createEmptyContradictionReport();
    expect(r.contradictions).toHaveLength(0);
    expect(r.recommendedDowngrade).toBeNull();
  });
});

describe("buildCrossDomainDataPoints", () => {
  it("builds data points from invoices and cash flow", () => {
    const points = buildCrossDomainDataPoints({
      invoices: [{ id: "1", status: "pending", amount: "$500" }],
      cashFlow: { available: "$10000", outgoing: "$600" },
    });
    expect(points.length).toBeGreaterThanOrEqual(2);
  });

  it("builds data points from leads", () => {
    const points = buildCrossDomainDataPoints({
      leads: [{ id: "1", status: "active", value: "$1000" }],
    });
    expect(points.some(p => p.field === "pipeline_value")).toBe(true);
  });
});
