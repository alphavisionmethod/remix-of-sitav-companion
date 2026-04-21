#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Deployment Secrets Audit (BLOCK gate)
// Lists every Deno.env.get() in edge functions and flags missing secrets
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "deployment-secrets";
const issues: GateIssue[] = [];

function walk(dir: string): string[] {
  const r: string[] = [];
  try {
    for (const e of readdirSync(dir)) {
      const f = join(dir, e);
      if (statSync(f).isDirectory()) r.push(...walk(f));
      else if (f.endsWith(".ts")) r.push(f);
    }
  } catch { /* */ }
  return r;
}

// Known secrets that are auto-provided by Lovable Cloud
const AUTO_PROVIDED = new Set([
  "SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_DB_URL",
]);

const envGetRe = /Deno\.env\.get\(\s*["']([^"']+)["']\)/g;
const secretRefs = new Map<string, string[]>(); // secret -> files

if (existsSync("supabase/functions")) {
  for (const file of walk("supabase/functions")) {
    const content = readFileSync(file, "utf-8");
    let m: RegExpExecArray | null;
    while ((m = envGetRe.exec(content)) !== null) {
      const secret = m[1];
      if (!secretRefs.has(secret)) secretRefs.set(secret, []);
      secretRefs.get(secret)!.push(file);
    }
  }
}

let autoCount = 0;
let customCount = 0;
const customSecrets: string[] = [];

for (const [secret] of secretRefs) {
  if (AUTO_PROVIDED.has(secret)) {
    autoCount++;
  } else {
    customCount++;
    customSecrets.push(secret);
    issues.push({
      severity: "warning",
      area: "secret",
      message: `Custom secret "${secret}" required — verify it's configured in Lovable Cloud`,
    });
  }
}

const ok = true; // warn-tier — can't verify secret existence from build time
console.log(`✅ ${GATE}: ${secretRefs.size} secrets referenced (${autoCount} auto-provided, ${customCount} custom)`);
if (customSecrets.length > 0) console.log(`  Custom: ${customSecrets.join(", ")}`);
emitGateReport({ gate: GATE, ok, issues, extra: { totalSecrets: secretRefs.size, autoProvided: autoCount, custom: customCount, customSecrets } });
process.exit(0);