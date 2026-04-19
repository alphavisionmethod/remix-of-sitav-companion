#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 15 — Chaos drill blast-radius classification validator.
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";

const issues: Array<{ severity: string; area: string; message: string }> = [];
const migDir = "supabase/migrations";
const sqlBlob = existsSync(migDir)
  ? readdirSync(migDir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n")
  : "";

if (!sqlBlob.includes("chaos_drill_results")) {
  issues.push({ severity: "error", area: "schema", message: "chaos_drill_results table not declared" });
}
if (!sqlBlob.includes("blast_radius TEXT NOT NULL DEFAULT 'isolated'")) {
  issues.push({ severity: "error", area: "contract", message: "blast_radius default 'isolated' missing — chaos drills must default to safe" });
}
if (!sqlBlob.includes("block_chaos_drill_mutation")) {
  issues.push({ severity: "error", area: "append-only", message: "append-only trigger function missing" });
}
if (!sqlBlob.includes("detection_seconds INTEGER") || !sqlBlob.includes("recovery_seconds INTEGER")) {
  issues.push({ severity: "error", area: "contract", message: "detection/recovery timing columns missing" });
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
mkdirSync("generated", { recursive: true });
writeFileSync("generated/chaos-drill-classification-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "chaos-drill-classification", ok, errorCount, warningCount,
  validBlastRadius: ["isolated","subsystem","regional","global"], issues,
}, null, 2));
console.log(`${ok ? "✅" : "❌"} chaos-drill-classification: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
