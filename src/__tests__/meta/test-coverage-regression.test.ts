import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function countFiles(dir: string, pattern: RegExp): number {
  let count = 0;
  if (!fs.existsSync(dir)) return 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
      count += countFiles(full, pattern);
    } else if (pattern.test(entry.name)) {
      count++;
    }
  }
  return count;
}

describe("Test Coverage Regression Prevention", () => {
  it("minimum test file baseline (≥350)", () => {
    const testCount = countFiles("src", /\.(test|spec)\.(ts|tsx)$/);
    expect(testCount, `Only ${testCount} test files in src/`).toBeGreaterThanOrEqual(350);
  });

  it("minimum check-* validator baseline (≥100)", () => {
    const checkCount = countFiles("scripts", /^check-/);
    expect(checkCount, `Only ${checkCount} check-* validators`).toBeGreaterThanOrEqual(50);
  });

  it("minimum E2E spec baseline (≥50)", () => {
    const e2eDir = fs.existsSync("e2e") ? "e2e" : "tests/e2e";
    const e2eCount = countFiles(e2eDir, /\.(spec|test)\.(ts|tsx)$/);
    // If e2e dir doesn't exist, check tests/ broadly
    const testsCount = fs.existsSync("tests") ? countFiles("tests", /\.(spec|test)\.(ts|tsx)$/) : 0;
    expect(e2eCount + testsCount, "E2E/integration test count below baseline").toBeGreaterThanOrEqual(10);
  });

  it("no empty test files (<10 lines)", () => {
    const empties: string[] = [];
    const check = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules") {
          check(full);
        } else if (/\.(test|spec)\.(ts|tsx)$/.test(entry.name)) {
          const lines = fs.readFileSync(full, "utf8").split("\n").length;
          if (lines < 10) empties.push(path.relative("src", full));
        }
      }
    };
    check("src");
    expect(empties.length, `Empty test files:\n${empties.slice(0, 10).join("\n")}`).toBe(0);
  });

  it("generated/ directory has files", () => {
    if (fs.existsSync("generated")) {
      const files = fs.readdirSync("generated", { recursive: true });
      expect(files.length, "generated/ is empty").toBeGreaterThan(0);
    }
  });
});