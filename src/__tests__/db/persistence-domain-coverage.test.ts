import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Persistence-critical domain coverage:
 * Reads generated/persistence-audit.json (produced by
 * scripts/db/generate/generate-persistence-audit.ts) and asserts
 * every required persistence domain has at least one backing
 * table and no required domain is missing.
 */
describe("Persistence domain coverage", () => {
  const auditPath = path.resolve(process.cwd(), "generated/persistence-audit.json");

  it("audit artifact exists", () => {
    expect(fs.existsSync(auditPath), `Run: npx tsx scripts/db/generate/generate-persistence-audit.ts`).toBe(true);
  });

  if (!fs.existsSync(auditPath)) return;

  const audit = JSON.parse(fs.readFileSync(auditPath, "utf-8")) as {
    summary: { totalDomains: number; covered: number; thin: number; missing: number };
    domains: Array<{ key: string; label: string; required: boolean; status: string; coverage: number }>;
  };

  it("has the expected number of persistence-critical domains", () => {
    expect(audit.summary.totalDomains).toBeGreaterThanOrEqual(9);
  });

  it("zero required domains are missing backing tables", () => {
    const missing = audit.domains
      .filter((d) => d.required && d.status === "missing")
      .map((d) => `${d.label} (${d.key})`);
    expect(
      missing,
      `Required persistence domains with 0 backing tables:\n${missing.join("\n")}`,
    ).toEqual([]);
  });

  it("every required domain has at least one backing table", () => {
    for (const d of audit.domains) {
      if (!d.required) continue;
      expect(d.coverage, `${d.label} has 0 backing tables`).toBeGreaterThan(0);
    }
  });
});
