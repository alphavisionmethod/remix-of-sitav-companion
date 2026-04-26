// ═══════════════════════════════════════════════════════════════
// Architecture Test — Canonical Domain Barrels
//
// Asserts that every canonical domain barrel (Phases 1–3) exposes
// real exports at runtime AND that the architecture guard script
// is itself green. Mirrors the in-process pattern used by
// src/__tests__/service-boundary-truth.test.ts.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import * as fs from "node:fs";

const SCRIPT = "scripts/architecture/audits/check-no-empty-domain-barrels.ts";

describe("Canonical domain barrels", () => {
  it("guard script exists on disk", () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
  });

  it("@/domains/business exposes ≥1 export", async () => {
    const mod = await import("@/domains/business");
    expect(Object.keys(mod).length).toBeGreaterThan(0);
  });

  it("@/domains/concierge exposes ≥1 export", async () => {
    const mod = await import("@/domains/concierge");
    expect(Object.keys(mod).length).toBeGreaterThan(0);
  });

  it("@/domains/finance exposes ≥1 export", async () => {
    const mod = await import("@/domains/finance");
    expect(Object.keys(mod).length).toBeGreaterThan(0);
  });

  it("@/domains/investment exposes ≥1 export", async () => {
    const mod = await import("@/domains/investment");
    expect(Object.keys(mod).length).toBeGreaterThan(0);
  });

  it("guard script exits 0 (no empty canonical barrels)", () => {
    let exitCode = 0;
    let output = "";
    try {
      output = execSync(`npx tsx ${SCRIPT}`, { stdio: "pipe", timeout: 60_000 }).toString();
    } catch (e: unknown) {
      const err = e as { status?: number; stdout?: Buffer; stderr?: Buffer };
      exitCode = err.status ?? 1;
      output = `${err.stdout?.toString() ?? ""}${err.stderr?.toString() ?? ""}`;
    }
    expect(exitCode, output.slice(0, 800)).toBe(0);
  }, 90_000);
});
