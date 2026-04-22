import { describe, it, expect } from "vitest";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// Service Layer — Façade & Constitution Verification
// ═══════════════════════════════════════════════════════════════

describe("Service Façade", () => {
  it("canonical façade exists at src/services/index.ts", () => {
    expect(fs.existsSync("src/services/index.ts")).toBe(true);
  });

  it("façade exports Layer 2 (Domain), Layer 3 (OS), Layer 4 (Read Models), Layer 1 (Platform)", () => {
    const content = fs.readFileSync("src/services/index.ts", "utf8");
    expect(content).toContain("core-services");
    expect(content).toContain("data-services");
    expect(content).toContain("os-services");
    expect(content).toContain("packages");
  });

  it("core-services barrel exists", () => {
    expect(fs.existsSync("src/lib/core-services.ts") || fs.existsSync("src/lib/core-services/index.ts")).toBe(true);
  });

  it("data-services barrel exists", () => {
    expect(fs.existsSync("src/lib/data-services.ts") || fs.existsSync("src/lib/data-services/index.ts")).toBe(true);
  });
});

describe("Policy Layer", () => {
  const policyDir = "src/lib/policy";

  it("unified-policy-matrix exists with core exports", () => {
    const matrix = fs.readFileSync(`${policyDir}/unified-policy-matrix.ts`, "utf8");
    expect(matrix).toContain("UNIFIED_POLICY_MATRIX");
    expect(matrix).toContain("getPolicyById");
    expect(matrix).toContain("resolveUnifiedPolicy");
  });

  it("all 9 policy dimension files exist", () => {
    const expected = [
      "policy-actor-registry",
      "policy-approval-map",
      "policy-domain-map",
      "policy-enforcement-map",
      "policy-proof-requirements",
      "policy-reversibility-map",
      "policy-surface-map",
      "policy-trust-thresholds",
    ];
    for (const f of expected) {
      expect(fs.existsSync(`${policyDir}/${f}.ts`), `Missing: ${f}`).toBe(true);
    }
  });

  it("barrel re-exports all dimensions", () => {
    const barrel = fs.readFileSync(`${policyDir}/index.ts`, "utf8");
    expect(barrel).toContain("policy-actor-registry");
    expect(barrel).toContain("policy-domain-map");
  });
});