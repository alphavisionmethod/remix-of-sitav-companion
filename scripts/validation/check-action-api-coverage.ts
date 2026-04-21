#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Action-to-API Coverage Audit
// Scans frontend supabase.functions.invoke calls and verifies
// each referenced edge function exists on disk
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "action-api-coverage";
const issues: GateIssue[] = [];

function walk(dir: string): string[] {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) results.push(...walk(full));
      else if (/\.(tsx?|jsx?)$/.test(full)) results.push(full);
    }
  } catch { /* */ }
  return results;
}

// Collect all supabase.functions.invoke("name") references
const invokeRe = /functions\.invoke\(\s*["']([^"']+)["']/g;
const invocations = new Map<string, string[]>(); // fnName -> files

for (const file of walk("src")) {
  const content = readFileSync(file, "utf-8");
  let m: RegExpExecArray | null;
  while ((m = invokeRe.exec(content)) !== null) {
    const fnName = m[1];
    if (!invocations.has(fnName)) invocations.set(fnName, []);
    invocations.get(fnName)!.push(file);
  }
}

// Check each invoked function exists
let total = invocations.size;
let covered = 0;
const missing: string[] = [];

for (const [fnName, files] of invocations) {
  const fnDir = join("supabase/functions", fnName);
  if (existsSync(join(fnDir, "index.ts"))) {
    covered++;
  } else {
    missing.push(fnName);
    issues.push({
      severity: "warning",
      area: "missing-function",
      message: `"${fnName}" invoked in ${files[0]} but supabase/functions/${fnName}/index.ts not found`,
    });
  }
}

const ok = true; // warn-tier for now
console.log(`${missing.length === 0 ? "✅" : "⚠"} ${GATE}: ${covered}/${total} invoked functions exist on disk (${missing.length} missing)`);
issues.slice(0, 5).forEach(i => console.error(`  [${i.severity}] ${i.message}`));
emitGateReport({ gate: GATE, ok, issues, extra: { total, covered, missingCount: missing.length, missing } });
process.exit(0);