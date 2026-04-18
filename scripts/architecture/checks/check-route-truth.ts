#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B2 — route truth check (warn-level).
// Verifies every <Route element={<X/>}/> resolves to a known import in the same file.

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
    else if (/\.(ts|tsx)$/.test(e)) acc.push(f);
  }
  return acc;
}

const routeFiles = walk("src").filter((f) =>
  /Routes?\.tsx$/.test(f) || /\/routes\//.test(f)
);

const ROUTE_RE = /<Route\s+[^>]*element=\{<(\w+)/g;
const IMPORT_NAME = /(?:import|const)\s+\{?\s*([\w,\s]+?)\s*\}?\s*(?:=\s*(?:lazy\(|require)|from)/g;

const issues: Array<{ file: string; element: string; reason: string }> = [];
let totalRoutes = 0;

for (const f of routeFiles) {
  const c = readFileSync(f, "utf-8");
  // Build set of names defined in file (imports + lazy + const)
  const defined = new Set<string>();
  for (const m of c.matchAll(/import\s+(?:\{([^}]+)\}|(\w+))/g)) {
    if (m[1]) m[1].split(",").forEach((n) => defined.add(n.trim().split(/\s+as\s+/).pop()!.trim()));
    if (m[2]) defined.add(m[2]);
  }
  for (const m of c.matchAll(/const\s+(\w+)\s*=\s*lazy/g)) defined.add(m[1]);

  let m;
  while ((m = ROUTE_RE.exec(c)) !== null) {
    totalRoutes++;
    if (!defined.has(m[1])) {
      issues.push({ file: relative(".", f), element: m[1], reason: "element not imported in route file" });
    }
  }
}

const ok = issues.length === 0;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "route-truth",
  totalRoutes,
  unresolvedCount: issues.length,
  level: "warn",
  ok,
  issues: issues.slice(0, 30),
};
writeFileSync(join(OUT, "route-truth.json"), JSON.stringify(report, null, 2));
console.log(`route-truth: ${totalRoutes} routes, ${issues.length} unresolved — ${ok ? "OK" : "WARN"}`);
process.exit(0);
