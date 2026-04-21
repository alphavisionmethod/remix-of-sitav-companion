#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — API Contract Alignment (BLOCK gate)
// Verifies every supabase.functions.invoke() target has an edge function
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "api-contract-alignment";
const issues: GateIssue[] = [];

function walk(dir: string): string[] {
  const r: string[] = [];
  try {
    for (const e of readdirSync(dir)) {
      const f = join(dir, e);
      if (statSync(f).isDirectory()) r.push(...walk(f));
      else if (/\.(tsx?|jsx?)$/.test(f)) r.push(f);
    }
  } catch { /* */ }
  return r;
}

const invokeRe = /functions\.invoke\(\s*["']([^"']+)["']/g;
const refs = new Map<string, string[]>();

for (const file of walk("src")) {
  const content = readFileSync(file, "utf-8");
  let m: RegExpExecArray | null;
  while ((m = invokeRe.exec(content)) !== null) {
    if (!refs.has(m[1])) refs.set(m[1], []);
    refs.get(m[1])!.push(file);
  }
}

// Check each edge function directory
const existingFns = new Set<string>();
if (existsSync("supabase/functions")) {
  for (const d of readdirSync("supabase/functions")) {
    if (!d.startsWith("_") && existsSync(join("supabase/functions", d, "index.ts"))) {
      existingFns.add(d);
    }
  }
}

let matched = 0;
const missing: string[] = [];

for (const [fn] of refs) {
  if (existingFns.has(fn)) matched++;
  else {
    missing.push(fn);
    issues.push({ severity: "error", area: "contract", message: `Frontend invokes "${fn}" but no edge function found` });
  }
}

// Also check for orphan edge functions (no frontend consumer)
const orphans: string[] = [];
for (const fn of existingFns) {
  if (!refs.has(fn)) orphans.push(fn);
}
if (orphans.length > 0) {
  issues.push({ severity: "warning", area: "orphan", message: `${orphans.length} edge functions have no frontend consumer` });
}

const ok = missing.length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${matched}/${refs.size} invocations matched, ${missing.length} missing, ${orphans.length} orphans`);
issues.slice(0, 8).forEach(i => console.error(`  [${i.severity}] ${i.message}`));
emitGateReport({ gate: GATE, ok, issues, extra: { total: refs.size, matched, missingCount: missing.length, orphanCount: orphans.length } });
process.exit(ok ? 0 : 1);