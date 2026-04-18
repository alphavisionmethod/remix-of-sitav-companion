#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 5 invariant: no surface (edge fn, hook, page, service) may
// promote an internal agent's autonomy rung without going through
// evaluate_internal_agent_ladder. Direct UPDATE of current_rung is
// forbidden outside of the SECURITY DEFINER RPC.
import { execSync } from "node:child_process";
import { emitGateReport } from "./_lib/emit-gate-report";

const GATE = "trust-ladder-never-self-promote";
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

const FORBIDDEN = [
  // Direct mutation of the ladder table outside the RPC
  ".from('internal_agent_trust_ladder').update",
  '.from("internal_agent_trust_ladder").update',
  ".from('internal_agent_trust_ladder').upsert",
  '.from("internal_agent_trust_ladder").upsert',
  ".from('internal_agent_trust_ladder').insert",
  '.from("internal_agent_trust_ladder").insert',
];

// Allow the canonical RPC + the migration that creates it
const ALLOW = [
  /supabase\/migrations\//,
  /scripts\/validation\//,
  /\.test\.tsx?$/,
];

const SCAN_DIRS = ["src/", "supabase/functions/"];

for (const term of FORBIDDEN) {
  for (const dir of SCAN_DIRS) {
    try {
      const out = execSync(
        `grep -rln ${JSON.stringify(term)} ${dir} --include="*.ts" --include="*.tsx" 2>/dev/null || true`,
        { encoding: "utf-8" },
      );
      out.split("\n").filter(Boolean).forEach((f) => {
        if (!ALLOW.some((rx) => rx.test(f))) {
          issues.push({ severity: "error", area: "self-promote", message: `${f}: "${term}"` });
        }
      });
    } catch { /* noop */ }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} risky surface(s)`);
issues.slice(0, 10).forEach((v) => console.error(`   ${v.message}`));
process.exit(ok ? 0 : 1);
