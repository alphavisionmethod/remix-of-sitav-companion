#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report.js";

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

const migDir = "supabase/migrations";
const files = existsSync(migDir) ? readdirSync(migDir) : [];
const found = files
  .map((f) => readFileSync(join(migDir, f), "utf-8"))
  .find((c) => c.includes("internal_agent_policy_drafts") && c.includes("CREATE TABLE"));

if (!found) {
  issues.push({ severity: "error", area: "migration", message: "internal_agent_policy_drafts table migration missing" });
} else {
  for (const k of ["rls_policy", "secret_rotation", "pending_review", "ENABLE ROW LEVEL SECURITY", "has_role"]) {
    if (!found.includes(k)) issues.push({ severity: "error", area: "schema", message: `missing token: ${k}` });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
const path = emitGateReport({ gate: "internal-agent-policy-drafts-table", ok, issues });
console.log(`${ok ? "✅" : "❌"} internal-agent-policy-drafts-table → ${path}`);
process.exit(ok ? 0 : 1);
