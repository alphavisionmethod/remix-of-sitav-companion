#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Continuity Handoff Validator (Phase 10: ENFORCING)
//
// Reads generated/audits/end-to-end-flow-continuity-baseline.json
// and reports the following classes of gaps:
//
//   1. setLinkedContext entity types that no consume site accepts
//      (orphan handoffs).
//   2. Routes referenced as setLinkedContext targets that have no
//      consume site at the same route family (silent drops).
//   3. Pages importing demo fixtures from src/data/fixtures/mock-data
//      while not gating on `isDemo` / `isDemoMode`.
//
// Phase 10 — flipped to enforcing. To temporarily relax during a
// known migration window, export CONTINUITY_HANDOFFS_ENFORCE=false.
//
// Exit code:
//   0 — clean OR enforcement disabled OR only warn-tier findings
//   1 — enforcing mode + at least one orphan-handoff or silent-drop
//       finding present (fixture leaks remain warn-tier — already
//       tracked by the dedicated demo-data validator).
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();
const BASELINE = path.join(ROOT, "generated/audits/end-to-end-flow-continuity-baseline.json");
const ENFORCE = (process.env.CONTINUITY_HANDOFFS_ENFORCE ?? "true").toLowerCase() !== "false";

interface Baseline {
  setLinkedContextSites: Array<{
    file: string; line: number; entityType: string | null;
    targetRoute: string | null; snippet: string;
  }>;
  consumeLinkedContextSites: Array<{
    file: string; line: number; acceptedEntityTypes: string[];
  }>;
  fixtureLeaks: Array<{ file: string; line: number; fixtureModule: string; guarded: boolean }>;
  summary: { orphanEntityTypes: string[]; fixtureLeakUnguarded: number };
}

function routeFamily(route: string | null): string | null {
  if (!route) return null;
  const segs = route.split("/").filter(Boolean);
  if (segs.length === 0) return null;
  return `/${segs[0]}`;
}

function fileToRouteFamily(file: string): string | null {
  if (file.includes("/modules/business/")) return "/business";
  if (file.includes("/modules/finance/")) return "/money";
  if (file.includes("/modules/concierge/")) return "/concierge";
  if (file.includes("/modules/health/")) return "/health";
  return null;
}

// Phase 10 — top-level cross-app routes that are owned by a module
// even though their URL does not begin with the module's prefix.
// Each entry maps "/<route-family>" → owning module family so the
// silent-drop check considers them satisfied as long as the owning
// module has at least one consume site.
const CROSS_MODULE_ROUTE_OWNERSHIP: Record<string, string> = {
  "/recovered-value": "/business",
  "/lead-recovery": "/business",
};

function main(): number {
  if (!fs.existsSync(BASELINE)) {
    console.error(`❌ Baseline not found at ${BASELINE}. Run scripts/architecture/emit-continuity-baseline.ts first.`);
    return ENFORCE ? 1 : 0;
  }

  const baseline: Baseline = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
  const blocking: string[] = [];
  const advisory: string[] = [];

  // 1) Orphan entity types
  for (const orphan of baseline.summary.orphanEntityTypes) {
    const sites = baseline.setLinkedContextSites.filter((s) => s.entityType === orphan);
    for (const s of sites) {
      blocking.push(
        `[orphan-handoff] ${s.file}:${s.line}  setLinkedContext({ entityType: "${orphan}" }) → ${s.targetRoute ?? "(no nav target)"} — no consume site accepts "${orphan}".`,
      );
    }
  }

  // 2) Silent drops: setLinkedContext targets a route family with no consume site there.
  const consumeFamilies = new Set(
    baseline.consumeLinkedContextSites
      .map((c) => fileToRouteFamily(c.file))
      .filter((f): f is string => !!f),
  );
  for (const s of baseline.setLinkedContextSites) {
    const fam = routeFamily(s.targetRoute);
    if (!fam) continue;
    const ownerFam = CROSS_MODULE_ROUTE_OWNERSHIP[fam] ?? fam;
    if (!consumeFamilies.has(ownerFam)) {
      blocking.push(
        `[silent-drop] ${s.file}:${s.line}  → target route family ${fam} has no consumeLinkedContext site.`,
      );
    }
  }

  // 3) Unguarded fixture leaks (production-mode demo data) — warn-tier:
  //    a dedicated demo-data validator owns enforcement of this class.
  for (const leak of baseline.fixtureLeaks.filter((l) => !l.guarded)) {
    advisory.push(
      `[fixture-leak] ${leak.file}:${leak.line}  imports ${leak.fixtureModule} without isDemo guard.`,
    );
  }

  if (blocking.length === 0 && advisory.length === 0) {
    console.log("✅ Continuity handoffs clean — no orphan handoffs, silent drops, or unguarded fixture leaks detected.");
    return 0;
  }

  if (blocking.length > 0) {
    console.log(
      `${ENFORCE ? "❌" : "⚠️ "} Continuity handoff validator — ${blocking.length} blocking finding(s):\n`,
    );
    for (const w of blocking) console.log(`  ${w}`);
  }
  if (advisory.length > 0) {
    console.log(`\nℹ️  ${advisory.length} advisory finding(s) (fixture leaks):`);
    for (const w of advisory.slice(0, 25)) console.log(`  ${w}`);
    if (advisory.length > 25) console.log(`  …and ${advisory.length - 25} more.`);
  }
  if (!ENFORCE) {
    console.log(`\nCONTINUITY_HANDOFFS_ENFORCE=false — exiting 0 despite findings.`);
    return 0;
  }
  return blocking.length > 0 ? 1 : 0;
}

process.exit(main());