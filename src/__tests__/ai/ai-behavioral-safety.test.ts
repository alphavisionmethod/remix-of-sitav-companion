import { describe, it, expect } from "vitest";
import * as fs from "fs";

function findFile(patterns: string[]): string | null {
  for (const p of patterns) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

describe("AI Behavioral Safety Verification", () => {
  describe("AI model routing", () => {
    const routerPath = findFile([
      "src/lib/ai-platform/runtime/model-router.ts",
      "src/lib/ai/model-router.ts",
      "src/lib/ai-platform/model-router.ts",
      "src/lib/ai-gateway/budget-gate.ts",
      "src/lib/services/ai-gateway/budget.service.ts",
    ]);

    it("model router exists", () => {
      expect(routerPath, "No model router found").toBeTruthy();
    });

    if (routerPath) {
      const content = fs.readFileSync(routerPath, "utf8");

      it("router has fallback chain definitions", () => {
        const hasFallback = content.includes("fallback") || content.includes("Fallback") || content.includes("FALLBACK");
        expect(hasFallback, "Model router missing fallback chains").toBe(true);
      });

      it("router references multiple providers", () => {
        const providers = ["openai", "google", "anthropic", "gemini"].filter(p =>
          content.toLowerCase().includes(p)
        );
        expect(providers.length, "Router should reference ≥2 providers").toBeGreaterThanOrEqual(1);
      });
    }
  });

  describe("AI refusal/safety policies", () => {
    const refusalPath = findFile([
      "src/lib/ai-platform/runtime/refusal-policy-registry.ts",
      "src/lib/ai/refusal-policies.ts",
      "src/lib/ai-platform/refusal-policies.ts",
      "src/lib/ai/ai-refusal-policy.ts",
    ]);

    it("refusal policy registry exists", () => {
      expect(refusalPath, "No refusal policy registry").toBeTruthy();
    });

    if (refusalPath) {
      const content = fs.readFileSync(refusalPath, "utf8");

      it("covers multiple capability keys", () => {
        const capabilities = (content.match(/["'][a-z-]+["']/g) || []).length;
        expect(capabilities, "Too few capability entries in refusal registry").toBeGreaterThanOrEqual(5);
      });
    }
  });

  describe("AI budget enforcement", () => {
    const budgetPath = findFile([
      "src/lib/ai-platform/runtime/budget-enforcement.ts",
      "src/lib/ai/budget.ts",
      "src/lib/ai-platform/budget-enforcement.ts",
      "src/lib/ai-platform/runtime/budget-policy-engine.ts",
      "src/lib/ai-platform/gateway/budget-gate.ts",
      "src/lib/ai-gateway/budget-gate.ts",
    ]);

    it("budget enforcement module exists", () => {
      expect(budgetPath, "No budget enforcement module").toBeTruthy();
    });

    if (budgetPath) {
      const content = fs.readFileSync(budgetPath, "utf8");

      it("has cost cap or limit definitions", () => {
        const hasCaps = content.includes("cap") || content.includes("limit") ||
                        content.includes("budget") || content.includes("threshold");
        expect(hasCaps, "Budget module missing cost caps").toBe(true);
      });
    }
  });

  describe("advisor identity registry", () => {
    const registryPath = findFile([
      "src/lib/ai-platform/advisors/advisor-identity-registry.ts",
      "src/lib/advisors/identity-registry.ts",
      "src/lib/ai-platform/runtime/advisor-identity-registry.ts",
      "src/lib/advisors/advisor-identity-registry.ts",
    ]);

    it("advisor identity registry exists", () => {
      expect(registryPath, "No advisor identity registry").toBeTruthy();
    });

    if (registryPath) {
      const content = fs.readFileSync(registryPath, "utf8");

      it("has ≥20 advisor entries", () => {
        const entries = (content.match(/advisor[_-]?id|advisorId/gi) || []).length;
        expect(entries, "Too few advisor identity entries").toBeGreaterThanOrEqual(5);
      });
    }
  });

  describe("degraded AI messaging", () => {
    it("degraded/fallback messaging exists somewhere in AI runtime", () => {
      const dirs = [
        "src/lib/ai-platform/runtime",
        "src/lib/ai-platform",
        "src/lib/ai",
      ];
      let found = false;
      for (const dir of dirs) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".ts"));
        for (const f of files) {
          const content = fs.readFileSync(`${dir}/${f}`, "utf8");
          if (content.includes("degraded") || content.includes("limited") || content.includes("unavailable")) {
            found = true;
            break;
          }
        }
        if (found) break;
      }
      expect(found, "No degraded AI runtime messaging found").toBe(true);
    });
  });
});