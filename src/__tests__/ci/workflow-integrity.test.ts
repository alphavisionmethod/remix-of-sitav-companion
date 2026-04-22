import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const WORKFLOWS_DIR = ".github/workflows";

describe("CI Workflow Integrity", () => {
  const hasWorkflows = fs.existsSync(WORKFLOWS_DIR);

  it("workflows directory exists", () => {
    expect(hasWorkflows, ".github/workflows/ missing").toBe(true);
  });

  if (hasWorkflows) {
    const ymlFiles = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith(".yml") || f.endsWith(".yaml"));

    it("workflow files exist", () => {
      expect(ymlFiles.length).toBeGreaterThan(0);
    });

    for (const yf of ymlFiles) {
      describe(`[${yf}]`, () => {
        const content = fs.readFileSync(path.join(WORKFLOWS_DIR, yf), "utf8");

        it("is valid YAML (basic structure check)", () => {
          // Check for basic YAML structure: must have 'on:' trigger and jobs or name
          const hasBasicStructure = (content.includes("on:") || content.includes("'on':")) &&
                                    (content.includes("jobs:") || content.includes("name:") || content.includes("runs-on:"));
          expect(hasBasicStructure, `${yf} missing basic YAML workflow structure`).toBe(true);
        });

        it("is not empty", () => {
          expect(content.trim().length).toBeGreaterThan(10);
        });
      });
    }

    it("no workflow references Node < 20", () => {
      const oldNode: string[] = [];
      for (const yf of ymlFiles) {
        const content = fs.readFileSync(path.join(WORKFLOWS_DIR, yf), "utf8");
        if (content.match(/node-version:\s*['"]?(1[0-8]|19)\b/)) {
          oldNode.push(yf);
        }
      }
      expect(oldNode.length, `Old Node versions in: ${oldNode.join(", ")}`).toBe(0);
    });
  }
});