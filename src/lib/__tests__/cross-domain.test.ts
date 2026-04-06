import { describe, it, expect } from "vitest";
import * as fs from "fs";

describe("CrossDomainEngine", () => {
  it("cross-domain file exists", () => {
    expect(fs.existsSync("src/lib/cross-domain.ts")).toBe(true);
  });

  it("exports insight types", () => {
    const content = fs.readFileSync("src/lib/cross-domain.ts", "utf-8");
    expect(content).toContain("CrossDomainInsight");
    expect(content).toContain("sourceDomain");
    expect(content).toContain("impactDomain");
  });
});
