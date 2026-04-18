#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report.js";

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
const f = "supabase/functions/internal-agent-policy-architect/index.ts";

if (!existsSync(f)) {
  issues.push({ severity: "error", area: "function", message: "internal-agent-policy-architect/index.ts missing" });
} else {
  const c = readFileSync(f, "utf-8");
  for (const k of [
    "internal_agent_policy_drafts",
    "get_db_truth_snapshot",
    "summarize_policy_draft_health",
    "aw-policy-architect",
    "admin role required",
  ]) {
    if (!c.includes(k)) issues.push({ severity: "error", area: "wiring", message: `missing token: ${k}` });
  }
  // CRITICAL guard — must NEVER run raw DDL
  if (/\bsupabase\.rpc\(\s*['"]execute_sql/.test(c) || /CREATE\s+POLICY/.test(c.replace(/sql_preview[\s\S]*?,/g, ""))) {
    issues.push({ severity: "error", area: "safety", message: "function appears to apply DDL — must only DRAFT" });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
const path = emitGateReport({ gate: "internal-agent-policy-architect-function", ok, issues });
console.log(`${ok ? "✅" : "❌"} internal-agent-policy-architect-function → ${path}`);
process.exit(ok ? 0 : 1);
