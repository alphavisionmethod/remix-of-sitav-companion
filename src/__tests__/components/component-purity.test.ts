import { describe, it, expect } from "vitest";
import * as fs from "fs";
import { CANONICAL_PRIMITIVES, PURITY_RULES } from "@/platform/architecture/component-registry";

describe("Component Import Purity", () => {
  it("no canonical primitive imports domain logic or services", () => {
    const violations: string[] = [];
    const rules = PURITY_RULES.PRIMITIVE;

    for (const [name, filePath] of Object.entries(CANONICAL_PRIMITIVES)) {
      if (!fs.existsSync(filePath)) continue;
      const code = fs.readFileSync(filePath, "utf8");
      const importLines = code.split("\n").filter(l => l.includes("import ") || l.includes("from "));

      for (const line of importLines) {
        for (const rule of rules) {
          if (rule.test(line)) {
            violations.push(`${name} (${filePath}): "${line.trim()}" matches ${rule}`);
          }
        }
      }
    }
    expect(violations, `Purity violations:\n${violations.join("\n")}`).toHaveLength(0);
  });

  it("UI_LIB components do not import services or hooks", () => {
    const uiDir = "src/components/ui";
    if (!fs.existsSync(uiDir)) return;
    const rules = PURITY_RULES.UI_LIB;
    const violations: string[] = [];
    const files = fs.readdirSync(uiDir).filter(f => f.endsWith(".tsx"));

    for (const file of files) {
      const code = fs.readFileSync(`${uiDir}/${file}`, "utf8");
      const importLines = code.split("\n").filter(l => l.includes("import ") || l.includes("from "));
      for (const line of importLines) {
        for (const rule of rules) {
          if (rule.test(line)) {
            violations.push(`${file}: "${line.trim()}"`);
          }
        }
      }
    }
    // sidebar.tsx and toaster.tsx legitimately use hooks for their core functionality
    const allowedExceptions = ["sidebar.tsx", "toaster.tsx"];
    const realViolations = violations.filter(v => !allowedExceptions.some(e => v.startsWith(e)));
    expect(realViolations, `UI_LIB purity violations:\n${realViolations.join("\n")}`).toHaveLength(0);
  });
});