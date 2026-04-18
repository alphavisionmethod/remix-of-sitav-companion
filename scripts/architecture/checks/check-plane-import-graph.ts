#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B2 — plane-boundary direct-edge check (warn-level).
// Counts forbidden user↔admin direct imports. Warn if > 5 (current baseline).

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });

function walk(d: string, acc: string[] = []): string[] {
  if (!existsSync(d)) return acc;
  for (const e of readdirSync(d)) {
    const f = join(d, e);
    let s; try { s = statSync(f); } catch { continue; }
    if (s.isDirectory()) {
      if (e === "node_modules" || e === ".git") continue;
      walk(f, acc);
    } else if (/\.(ts|tsx)$/.test(e)) acc.push(f);
  }
  return acc;
}

type Plane = "user" | "admin" | "shell" | "backend" | "core" | "shared";
function planeOf(rel: string): Plane {
  if (rel.startsWith("src/admin/") || rel.includes("/admin/")) return "admin";
  if (rel.startsWith("src/app/") || (rel.startsWith("src/pages/") && !rel.includes("/admin/"))) return "user";
  if (rel.startsWith("src/shell-runtime/") || rel.startsWith("src/layouts/")) return "shell";
  return "shared";
}

const IMP = /(?:import|export)\s+(?:[\s\S]*?\sfrom\s+)?["']([^"']+)["']/g;
function resolve(from: string, spec: string): string | null {
  if (!spec.startsWith("@/") && !spec.startsWith(".")) return null;
  const t = spec.startsWith("@/") ? "src/" + spec.slice(2) : join(from, "..", spec);
  for (const ext of [".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    if (existsSync(t + ext)) return t + ext;
  }
  return existsSync(t) ? t : null;
}

const violations: Array<{ from: string; to: string; spec: string }> = [];
for (const f of walk("src")) {
  const rel = relative(".", f);
  const pf = planeOf(rel);
  if (pf !== "user" && pf !== "admin") continue;
  let c; try { c = readFileSync(f, "utf-8"); } catch { continue; }
  let m;
  while ((m = IMP.exec(c)) !== null) {
    const r = resolve(f, m[1]);
    if (!r) continue;
    const pt = planeOf(relative(".", r));
    if ((pf === "user" && pt === "admin") || (pf === "admin" && pt === "user")) {
      violations.push({ from: rel, to: relative(".", r), spec: m[1] });
    }
  }
}

const BASELINE = 5;
const ok = violations.length <= BASELINE;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "plane-import-graph",
  directViolationCount: violations.length,
  baseline: BASELINE,
  level: "warn",
  ok,
  violations: violations.slice(0, 50),
};
writeFileSync(join(OUT, "plane-import-graph.json"), JSON.stringify(report, null, 2));
console.log(`plane-import-graph: ${violations.length} direct user↔admin violations (baseline ${BASELINE}) — ${ok ? "OK" : "WARN"}`);
process.exit(0);
