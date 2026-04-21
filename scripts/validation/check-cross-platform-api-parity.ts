#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Cross-Platform API Parity Check
// Verifies OS, Mobile, and Admin consume shared API contracts
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "cross-platform-api-parity";
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

function collectInvocations(dirs: string[]): Set<string> {
  const fns = new Set<string>();
  for (const dir of dirs) {
    for (const file of walk(dir)) {
      const content = readFileSync(file, "utf-8");
      let m: RegExpExecArray | null;
      while ((m = invokeRe.exec(content)) !== null) fns.add(m[1]);
    }
  }
  return fns;
}

const osFns = collectInvocations(["src/pages/business", "src/pages/finance", "src/pages/concierge", "src/pages/boardroom", "src/pages/investment"]);
const mobileFns = collectInvocations(["src/pages/mobile"]);
const adminFns = collectInvocations(["src/pages/admin"]);

// Check: shared capabilities should be used by mobile too
const sharedCapabilities = ["alert-ingest", "alert-route", "health-check", "ai-gateway"];
for (const cap of sharedCapabilities) {
  const usedByOS = osFns.has(cap);
  const usedByMobile = mobileFns.has(cap);
  const usedByAdmin = adminFns.has(cap);
  if (usedByOS && !usedByMobile) {
    issues.push({ severity: "warning", area: "parity", message: `"${cap}" used by OS but not Mobile` });
  }
  if (usedByAdmin && !usedByOS && !usedByMobile) {
    // Admin-only is fine
  }
}

// Check auth token consistency — all surfaces should use supabase client
const surfaces = { os: "src/pages/business", mobile: "src/pages/mobile", admin: "src/pages/admin" };
for (const [name, dir] of Object.entries(surfaces)) {
  const files = walk(dir);
  const usesSupabaseClient = files.some(f => readFileSync(f, "utf-8").includes("@/integrations/supabase/client"));
  if (!usesSupabaseClient && files.length > 0) {
    issues.push({ severity: "warning", area: "auth", message: `${name} surface doesn't import supabase client directly (may use hooks)` });
  }
}

const ok = true; // warn-only
console.log(`✅ ${GATE}: OS=${osFns.size} APIs, Mobile=${mobileFns.size} APIs, Admin=${adminFns.size} APIs`);
issues.forEach(i => console.error(`  [${i.severity}] ${i.message}`));
emitGateReport({ gate: GATE, ok, issues, extra: { osFnCount: osFns.size, mobileFnCount: mobileFns.size, adminFnCount: adminFns.size } });
process.exit(0);