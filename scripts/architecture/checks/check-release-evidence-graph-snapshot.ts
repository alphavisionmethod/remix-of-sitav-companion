#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 14 — Release Aggregator evidence-graph snapshot validator.
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";

const issues: Array<{ severity: string; area: string; message: string }> = [];
const migDir = "supabase/migrations";
const sqlBlob = existsSync(migDir)
  ? readdirSync(migDir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n")
  : "";

if (!sqlBlob.includes("release_evidence_graph_snapshots")) {
  issues.push({ severity: "error", area: "schema", message: "release_evidence_graph_snapshots table not declared" });
}
if (!sqlBlob.includes("block_release_evidence_graph_mutation")) {
  issues.push({ severity: "error", area: "append-only", message: "append-only trigger function missing" });
}
if (!existsSync("supabase/functions/release-evidence-graph-snapshot/index.ts")) {
  issues.push({ severity: "error", area: "edge-function", message: "release-evidence-graph-snapshot edge function missing" });
}
if (!existsSync("scripts/architecture/checks/check-os-release-readiness.ts")) {
  issues.push({ severity: "warning", area: "aggregator", message: "master aggregator script missing" });
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
mkdirSync("generated", { recursive: true });
writeFileSync("generated/release-evidence-graph-snapshot-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "release-evidence-graph-snapshot", ok, errorCount, warningCount, issues,
}, null, 2));
console.log(`${ok ? "✅" : "❌"} release-evidence-graph-snapshot: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
