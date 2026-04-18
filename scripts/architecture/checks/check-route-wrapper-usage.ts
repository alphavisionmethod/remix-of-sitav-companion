#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B2 — route-wrapper usage check (warn-level).
// Flags page files that are pure re-export shims so they stay declared/intentional.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });

function walk(d: string, acc: string[] = []): string[] {
  if (!existsSync(d)) return acc;
  for (const e of readdirSync(d)) {
    const f = join(d, e);
    let s; try { s = statSync(f); } catch { continue; }
    if (s.isDirectory()) walk(f, acc);
    else if (/\.tsx?$/.test(e)) acc.push(f);
  }
  return acc;
}

const KNOWN_WRAPPERS = new Set([
  "src/app/index.ts",
  "src/pages/admin/cloud/AdminRBACConsole.tsx",
  "src/pages/admin/verification/V01SurfaceInventoryBoard.tsx",
  "src/pages/admin/verification/V02InteractionCoverageBoard.tsx",
  "src/pages/admin/verification/V03P0JourneyBoard.tsx",
  "src/pages/admin/verification/V04ModeVerificationBoard.tsx",
  "src/pages/admin/verification/V06EvidenceExplorer.tsx",
  "src/pages/admin/verification/V07LaunchBlockerBoard.tsx",
  "src/pages/admin/GeneratedTruthDashboard.tsx",
  "src/pages/admin/LaunchHonestyBoard.tsx",
  "src/pages/admin/LaunchReadinessBoard.tsx",
  "src/pages/admin/TeamManagement.tsx",
  "src/pages/admin/UserManagement.tsx",
  "src/pages/admin/modules/MCKnowledgeBase.tsx",
  "src/pages/admin/modules/MCSupport.tsx",
  "src/pages/admin/reality-audit/LaunchHonestyBoard.tsx",
]);

const wrappers: string[] = [];
const undeclared: string[] = [];
for (const f of walk("src/pages").concat(walk("src/app"))) {
  let c; try { c = readFileSync(f, "utf-8"); } catch { continue; }
  if (c.length < 800 && /export\s+(?:\{|default).*from\s+["']/.test(c)) {
    const rel = relative(".", f);
    wrappers.push(rel);
    if (!KNOWN_WRAPPERS.has(rel)) undeclared.push(rel);
  }
}

const ok = undeclared.length === 0;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "route-wrapper-usage",
  wrapperCount: wrappers.length,
  undeclaredCount: undeclared.length,
  knownWrapperCount: KNOWN_WRAPPERS.size,
  level: "warn",
  ok,
  undeclared,
  wrappers,
};
writeFileSync(join(OUT, "route-wrapper-usage.json"), JSON.stringify(report, null, 2));
console.log(`route-wrapper-usage: ${wrappers.length} wrappers, ${undeclared.length} undeclared — ${ok ? "OK" : "WARN"}`);
process.exit(0);
