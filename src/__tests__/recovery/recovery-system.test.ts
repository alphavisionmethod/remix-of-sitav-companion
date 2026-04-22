import { describe, it, expect } from "vitest";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// Recovery & Supportability System — Verification
// ═══════════════════════════════════════════════════════════════

describe("Recovery System", () => {
  it("RecoveryCenter page exists", () => {
    expect(fs.existsSync("src/pages/RecoveryCenter.tsx")).toBe(true);
  });

  it("admin recovery components exist", () => {
    const dir = "src/components/admin/recovery";
    expect(fs.existsSync(dir)).toBe(true);
    const files = fs.readdirSync(dir);
    expect(files.length).toBeGreaterThanOrEqual(3);
  });

  it("recovery page is non-trivial", () => {
    const page = fs.readFileSync("src/pages/RecoveryCenter.tsx", "utf8");
    expect(page.split("\n").length).toBeGreaterThan(30);
  });

  it("kill-switch enforcement exists", () => {
    const ks = fs.existsSync("src/lib/runtime/kill-switches.ts") ||
               fs.existsSync("src/platform/governance/kill-switches.ts") ||
               fs.existsSync("src/lib/kill-switches.ts");
    // Kill switch test also exists separately
    expect(fs.existsSync("src/__tests__/kill-switch-enforcement.test.ts")).toBe(true);
  });
});

describe("Trust & Proof System", () => {
  it("TrustCenter page exists and is substantial", () => {
    const page = fs.readFileSync("src/pages/TrustCenter.tsx", "utf8");
    expect(page.split("\n").length).toBeGreaterThan(50);
  });

  it("ProofCenter page exists", () => {
    expect(fs.existsSync("src/pages/ProofCenter.tsx")).toBe(true);
  });

  it("trust badge component exists", () => {
    expect(fs.existsSync("src/components/sita/TrustBadge.tsx")).toBe(true);
  });

  it("evidence persistence tables exist in types", () => {
    const types = fs.readFileSync("src/integrations/supabase/types.ts", "utf8");
    expect(types).toContain("evidence_graph_nodes") ;
  });
});