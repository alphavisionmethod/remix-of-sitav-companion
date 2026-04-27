#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Continuity Handoff Validator (Phase 1: WARN-ONLY)
//
// Reads generated/audits/end-to-end-flow-continuity-baseline.json
// and reports — without failing — the following classes of gaps:
//
//   1. setLinkedContext entity types that no consume site accepts
//      (orphan handoffs).
//   2. Routes referenced as setLinkedContext targets that have no
//      consume site at the same route family (silent drops).
//   3. Pages importing demo fixtures from src/data/fixtures/mock-data
//      while not gating on `isDemo` / `isDemoMode`.
//
// Phase 10 will flip this validator to enforcing.
//
// Exit code:
//   0 — always (warn-only by design)
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();
const BASELINE = path.join(ROOT, "generated/audits/end-to-end-flow-continuity-baseline.json");

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

function main(): number {
  if (!fs.existsSync(BASELINE)) {
    console.error(`❌ Baseline not found at ${BASELINE}. Run scripts/architecture/emit-continuity-baseline.ts first.`);
    return 0; // warn-only, do not fail builds during Phase 1
  }

  const baseline: Baseline = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
  const warnings: string[] = [];

  // 1) Orphan entity types
  for (const orphan of baseline.summary.orphanEntityTypes) {
    const sites = baseline.setLinkedContextSites.filter((s) => s.entityType === orphan);
    for (const s of sites) {
      warnings.push(
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
    if (fam && !consumeFamilies.has(fam)) {
      warnings.push(
        `[silent-drop] ${s.file}:${s.line}  → target route family ${fam} has no consumeLinkedContext site.`,
      );
    }
  }

  // 3) Unguarded fixture leaks (production-mode demo data)
  for (const leak of baseline.fixtureLeaks.filter((l) => !l.guarded)) {
    warnings.push(
      `[fixture-leak] ${leak.file}:${leak.line}  imports ${leak.fixtureModule} without isDemo guard.`,
    );
  }

  if (warnings.length === 0) {
    console.log("✅ Continuity handoffs clean — no orphan handoffs, silent drops, or unguarded fixture leaks detected.");
    return 0;
  }

  console.log(`⚠️  Continuity handoff validator (warn-only) — ${warnings.length} finding(s):\n`);
  for (const w of warnings) console.log(`  ${w}`);
  console.log(`\nThis validator is warn-only in Phase 1. Phase 10 will flip it to enforcing.`);
  return 0;
}

process.exit(main());