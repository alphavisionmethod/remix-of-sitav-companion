#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 15 — DR drill execution evidence validator.
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";

const issues: Array<{ severity: string; area: string; message: string }> = [];
const migDir = "supabase/migrations";
const sqlBlob = existsSync(migDir)
  ? readdirSync(migDir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n")
  : "";

if (!sqlBlob.includes("dr_drill_executions")) {
  issues.push({ severity: "error", area: "schema", message: "dr_drill_executions table not declared" });
}
if (!sqlBlob.includes("rto_seconds INTEGER") || !sqlBlob.includes("rpo_seconds INTEGER")) {
  issues.push({ severity: "error", area: "contract", message: "rto/rpo timing columns missing" });
}
if (!sqlBlob.includes("block_dr_drill_mutation")) {
  issues.push({ severity: "error", area: "append-only", message: "append-only trigger function missing" });
}
if (!existsSync("supabase/functions/dr-drill-executor/index.ts")) {
  issues.push({ severity: "error", area: "edge-function", message: "dr-drill-executor edge function missing" });
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
mkdirSync("generated", { recursive: true });
writeFileSync("generated/dr-drill-evidence-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "dr-drill-evidence", ok, errorCount, warningCount,
  validKinds: ["region-failover","db-restore","edge-function-failover","storage-failover","full-stack"], issues,
}, null, 2));
console.log(`${ok ? "✅" : "❌"} dr-drill-evidence: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
