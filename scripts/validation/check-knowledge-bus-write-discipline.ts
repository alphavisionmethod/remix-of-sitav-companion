#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 5 invariant: cross-agent learnings published to the knowledge bus
// must include a confidence score and a pattern tag, and may only be
// written via publish_agent_learning RPC (no direct INSERTs from app code).
import { execSync } from "node:child_process";
import { emitGateReport } from "./_lib/emit-gate-report";

const GATE = "knowledge-bus-write-discipline";
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

const FORBIDDEN_DIRECT = [
  ".from('internal_agent_knowledge_bus').insert",
  '.from("internal_agent_knowledge_bus").insert',
  ".from('internal_agent_knowledge_bus').update",
  '.from("internal_agent_knowledge_bus").update',
];

const ALLOW = [
  /supabase\/migrations\//,
  /scripts\/validation\//,
  /\.test\.tsx?$/,
];

const SCAN_DIRS = ["src/", "supabase/functions/"];

for (const term of FORBIDDEN_DIRECT) {
  for (const dir of SCAN_DIRS) {
    try {
      const out = execSync(
        `grep -rln ${JSON.stringify(term)} ${dir} --include="*.ts" --include="*.tsx" 2>/dev/null || true`,
        { encoding: "utf-8" },
      );
      out.split("\n").filter(Boolean).forEach((f) => {
        if (!ALLOW.some((rx) => rx.test(f))) {
          issues.push({ severity: "error", area: "direct-write", message: `${f}: "${term}"` });
        }
      });
    } catch { /* noop */ }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} undisciplined writer(s)`);
issues.slice(0, 10).forEach((v) => console.error(`   ${v.message}`));
process.exit(ok ? 0 : 1);
