#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B3 — Transitive plane-boundary check (warn-level).
// Walks the import graph 2 hops deep to catch user → shared → admin chains
// and admin → shared → user leakage that direct-edge checks miss.

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

// Allowlist: presentational primitives that are plane-neutral despite living under /admin/
const SHARED_PRESENTATIONAL = [
  "src/components/sita/admin/", // Pure UI atoms: AdminPageHeader, TrustRibbon, StatusBadge, SafeModeBanner, QuickActionsDock
];

function planeOf(rel: string): Plane {
  if (SHARED_PRESENTATIONAL.some((p) => rel.startsWith(p))) return "shared";
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

const all = walk("src");
const directImports = new Map<string, string[]>();
for (const f of all) {
  let c; try { c = readFileSync(f, "utf-8"); } catch { continue; }
  const out: string[] = [];
  for (const m of c.matchAll(IMP)) {
    const r = resolve(f, m[1]);
    if (r) out.push(relative(".", r));
  }
  directImports.set(relative(".", f), out);
}

// Direct violations
const FORBIDDEN: Array<[Plane, Plane]> = [["user", "admin"], ["admin", "user"]];
const directViol: Array<{ from: string; to: string }> = [];
for (const [f, deps] of directImports) {
  const pf = planeOf(f);
  if (pf !== "user" && pf !== "admin") continue;
  for (const d of deps) {
    const pt = planeOf(d);
    if (FORBIDDEN.some(([a, b]) => a === pf && b === pt)) {
      directViol.push({ from: f, to: d });
    }
  }
}

// Transitive (1 hop through shared)
const transViol: Array<{ from: string; via: string; to: string }> = [];
for (const [f, deps] of directImports) {
  const pf = planeOf(f);
  if (pf !== "user" && pf !== "admin") continue;
  for (const mid of deps) {
    if (planeOf(mid) !== "shared") continue;
    const midDeps = directImports.get(mid) || [];
    for (const leaf of midDeps) {
      const pl = planeOf(leaf);
      if (FORBIDDEN.some(([a, b]) => a === pf && b === pl)) {
        transViol.push({ from: f, via: mid, to: leaf });
        break;
      }
    }
  }
}

const dedupedTrans = transViol.filter((v, i, a) =>
  a.findIndex((x) => x.from === v.from && x.to === v.to) === i
);

// Phase B6 — ratchet down. Current 12; budget tightened to 20 to prevent
// transitive leakage growth. Stays warn-level until full graph isolation.
const TRANS_BUDGET = 20;
const ok = dedupedTrans.length <= TRANS_BUDGET;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "plane-transitive",
  directViolationCount: directViol.length,
  transitiveViolationCount: dedupedTrans.length,
  transitiveBudget: TRANS_BUDGET,
  level: "warn",
  ok,
  directSample: directViol.slice(0, 20),
  transitiveSample: dedupedTrans.slice(0, 30),
  sharedPresentationalAllowlist: SHARED_PRESENTATIONAL,
};
writeFileSync(join(OUT, "plane-transitive.json"), JSON.stringify(report, null, 2));
console.log(`plane-transitive: direct=${directViol.length}, transitive=${dedupedTrans.length} (budget ${TRANS_BUDGET}) — ${ok ? "OK" : "WARN"}`);
process.exit(0);
