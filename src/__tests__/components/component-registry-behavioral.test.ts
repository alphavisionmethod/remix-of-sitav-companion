import { describe, it, expect } from "vitest";
import * as fs from "fs";
import { CANONICAL_PRIMITIVES, PURITY_RULES, VALID_SUFFIXES } from "@/platform/architecture/component-registry";

describe("Component Registry Behavioral Verification", () => {
  it("every CANONICAL_PRIMITIVES entry resolves to a file on disk", () => {
    const missing: string[] = [];
    for (const [name, filePath] of Object.entries(CANONICAL_PRIMITIVES)) {
      if (!fs.existsSync(filePath)) {
        missing.push(`${name}: ${filePath}`);
      }
    }
    expect(missing, `Missing primitives: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("PURITY_RULES has entries for all classifications", () => {
    const expected = ["PRIMITIVE", "DOMAIN", "SURFACE", "PRIVATE_HELPER", "DEPRECATED_WRAPPER", "UI_LIB"];
    for (const cls of expected) {
      expect(PURITY_RULES).toHaveProperty(cls);
    }
  });

  it("VALID_SUFFIXES is non-empty and has no duplicates", () => {
    expect(VALID_SUFFIXES.length).toBeGreaterThan(20);
    expect(new Set(VALID_SUFFIXES).size).toBe(VALID_SUFFIXES.length);
  });

  it("PRIMITIVE purity rules forbid service/engine/hook imports", () => {
    const rules = PURITY_RULES.PRIMITIVE;
    expect(rules.length).toBeGreaterThan(0);
    const ruleStrs = rules.map(r => r.source);
    expect(ruleStrs.some(r => r.includes("services"))).toBe(true);
    expect(ruleStrs.some(r => r.includes("hooks"))).toBe(true);
  });
});