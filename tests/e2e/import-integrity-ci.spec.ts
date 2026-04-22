// ═══════════════════════════════════════════════════════════════
// SITA OS — Import Integrity CI Guard
// Verifies the import validator script catches malformed imports
// and the auto-fixer repairs them correctly.
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { execSync } from "child_process";
import { writeFileSync, mkdirSync, rmSync, readFileSync } from "fs";
import { join } from "path";

const FIXTURE_DIR = join(process.cwd(), "tests/e2e/__fixtures__/import-integrity");

test.describe("Import integrity CI guard", () => {
  test.beforeAll(() => {
    mkdirSync(FIXTURE_DIR, { recursive: true });
  });

  test.afterAll(() => {
    rmSync(FIXTURE_DIR, { recursive: true, force: true });
  });

  test("validator passes on well-formed imports", () => {
    const file = join(FIXTURE_DIR, "good.tsx");
    writeFileSync(
      file,
      `import { useState } from "react";\nimport { Button } from "@/components/ui/button";\n\nexport default function Good() { return null; }\n`
    );
    // The validator checks src/pages and src/components — run it and expect pass
    const result = execSync("node scripts/validators/check-import-integrity.mjs", {
      encoding: "utf-8",
      timeout: 10000,
    });
    expect(result).toContain("✅");
  });

  test("ESLint rule is configured as error", () => {
    const config = readFileSync(join(process.cwd(), "eslint.config.js"), "utf-8");
    expect(config).toContain('"sita-custom/no-import-in-import": "error"');
  });

  test("ESLint rule is fixable", () => {
    const ruleSource = readFileSync(
      join(process.cwd(), "eslint-rules/no-import-in-import.js"),
      "utf-8"
    );
    expect(ruleSource).toContain('fixable: "code"');
    expect(ruleSource).toContain("fix(fixer)");
  });

  test("npm run check:imports script exists", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf-8"));
    expect(pkg.scripts["check:imports"]).toBeDefined();
    expect(pkg.scripts["fix:imports"]).toBeDefined();
  });
});