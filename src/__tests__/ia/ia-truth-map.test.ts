// ═══════════════════════════════════════════════════════════════
// IA Phase 8 — Cumulative Truth Map Test
// ───────────────────────────────────────────────────────────────
// Asserts that:
//   1. The generated route-and-navigation-truth-map.json exists.
//   2. Re-building it from live sources produces the same content
//      (no manual drift between the manifest and the snapshot).
//   3. Zero orphan routes remain.
//   4. Every redirect target either resolves to a manifest descriptor
//      route OR to another redirect target (no dangling redirects).
//
// Re-run the builder with:
//   npx tsx scripts/architecture/build-route-nav-truth-map.ts
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ALL_IA_DESCRIPTORS } from "@/platform/ia/module-ia-manifest";
import { USER_REDIRECTS } from "@/routes/redirects/user-redirect-map";

const TRUTH_JSON = "generated/route-and-navigation-truth-map.json";
const TRUTH_MD = "generated/audits/SITA_OS_ROUTE_AND_NAVIGATION_TRUTH_MAP.md";
const BUILDER = "scripts/architecture/build-route-nav-truth-map.ts";

describe("IA / Phase 8 — Truth Map", () => {
  it("builder script + both artifacts exist", () => {
    expect(fs.existsSync(BUILDER)).toBe(true);
    expect(fs.existsSync(TRUTH_JSON)).toBe(true);
    expect(fs.existsSync(TRUTH_MD)).toBe(true);
  });

  it("checked-in JSON matches a fresh rebuild (no drift)", () => {
    const before = fs.readFileSync(TRUTH_JSON, "utf8");
    execSync(`npx tsx ${BUILDER}`, { stdio: "pipe", timeout: 90_000 });
    const after = fs.readFileSync(TRUTH_JSON, "utf8");
    // Strip generatedAt — only the timestamp legitimately changes per build.
    const stripTs = (s: string) => s.replace(/"generatedAt":\s*"[^"]+"/, '"generatedAt":"_"');
    expect(stripTs(after)).toBe(stripTs(before));
  }, 120_000);

  it("zero orphan routes", () => {
    const truth = JSON.parse(fs.readFileSync(TRUTH_JSON, "utf8"));
    expect(truth.totals.orphanedRoutes, JSON.stringify(truth.orphanedRoutes, null, 2)).toBe(0);
  });

  it("totals.descriptors equals the live manifest length", () => {
    const truth = JSON.parse(fs.readFileSync(TRUTH_JSON, "utf8"));
    expect(truth.totals.descriptors).toBe(ALL_IA_DESCRIPTORS.length);
  });

  it("totals.redirects equals the live USER_REDIRECTS length", () => {
    const truth = JSON.parse(fs.readFileSync(TRUTH_JSON, "utf8"));
    expect(truth.totals.redirects).toBe(USER_REDIRECTS.length);
  });

  it("every redirect's `to` either lands on a manifest route OR another redirect's `from` OR a structural pillar root", () => {
    const norm = (p: string) => p.replace(/\/:[^/]+/g, "/:_");
    const manifestRoutes = new Set(
      ALL_IA_DESCRIPTORS.map((d) => d.route).filter((r): r is string => !!r).map(norm),
    );
    const redirectFroms = new Set(USER_REDIRECTS.map((r) => norm(r.from)));
    const STRUCTURAL = new Set(["/business", "/concierge", "/money", "/investment", "/files", "/desktop", "/boardroom"]);
    const dangling: string[] = [];
    for (const r of USER_REDIRECTS) {
      const t = norm(r.to);
      if (manifestRoutes.has(t)) continue;
      if (redirectFroms.has(t)) continue;
      if (STRUCTURAL.has(t)) continue;
      // Multi-segment routes whose target is anchored by a route family but
      // not in the IA manifest (e.g. /investment/* canonical app) are OK.
      if (/^\/(investment|files|boardroom|mobile|desktop)(\/|$)/.test(t)) continue;
      dangling.push(`${r.from} → ${r.to}`);
    }
    expect(dangling, `dangling redirects:\n${dangling.join("\n")}`).toEqual([]);
  });

  it("MD report includes one section per pillar", () => {
    const md = fs.readFileSync(TRUTH_MD, "utf8");
    expect(md).toContain("## Business");
    expect(md).toContain("## Concierge");
    expect(md).toContain("## Finance");
    expect(md).toContain("## Redirects");
    expect(md).toContain("## Orphaned Routes");
  });
});