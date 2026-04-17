// ═══════════════════════════════════════════════════════════════
// Manifest Truth Test (Checklist 24.11)
// Asserts MANIFEST_REGISTRY entries are well-formed and that every
// CI_GATE_REGISTRY script path exists on disk.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import { MANIFEST_REGISTRY } from "@/lib/truth-manifests/manifest-registry";
import { CI_GATE_REGISTRY } from "@/lib/ci/ci-gate-registry";

describe("Manifest Truth", () => {
  it("MANIFEST_REGISTRY has unique IDs", () => {
    const ids = MANIFEST_REGISTRY.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("MANIFEST_REGISTRY has unique paths", () => {
    const paths = MANIFEST_REGISTRY.map((m) => m.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("every entry has a non-empty owner, sourceInputs, and consumers", () => {
    for (const m of MANIFEST_REGISTRY) {
      expect(m.owner, `Missing owner: ${m.id}`).toBeTruthy();
      expect(m.sourceInputs.length, `Missing sourceInputs: ${m.id}`).toBeGreaterThan(0);
      expect(Array.isArray(m.consumers), `Bad consumers: ${m.id}`).toBe(true);
    }
  });

  it("every authoritative entry has a validator script declared", () => {
    const missing = MANIFEST_REGISTRY
      .filter((m) => m.authority === "authoritative" && !m.validator)
      .map((m) => m.id);
    expect(missing, `Authoritative entries without validators: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("every CI_GATE_REGISTRY script path exists on disk", () => {
    const missing: string[] = [];
    for (const gate of CI_GATE_REGISTRY) {
      if (!fs.existsSync(gate.script)) missing.push(`${gate.id} → ${gate.script}`);
    }
    expect(missing, `Missing CI gate scripts: ${missing.slice(0, 5).join(", ")}`).toHaveLength(0);
  });

  it("every blocker gate has an owner", () => {
    const missing = CI_GATE_REGISTRY
      .filter((g) => g.severity === "blocker" && !g.owner)
      .map((g) => g.id);
    expect(missing).toHaveLength(0);
  });
});
