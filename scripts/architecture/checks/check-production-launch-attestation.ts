#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 15 — Production launch attestation signature validator.
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";

const issues: Array<{ severity: string; area: string; message: string }> = [];
const migDir = "supabase/migrations";
const sqlBlob = existsSync(migDir)
  ? readdirSync(migDir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n")
  : "";

if (!sqlBlob.includes("production_launch_attestations")) {
  issues.push({ severity: "error", area: "schema", message: "production_launch_attestations table not declared" });
}
if (!sqlBlob.includes("evidence_hash TEXT NOT NULL") || !sqlBlob.includes("signature TEXT NOT NULL")) {
  issues.push({ severity: "error", area: "contract", message: "evidence_hash + signature required columns missing" });
}
if (!sqlBlob.includes("block_prod_launch_attestation_mutation")) {
  issues.push({ severity: "error", area: "append-only", message: "append-only trigger function missing" });
}
if (!sqlBlob.includes("prod_launch_att_no_update") || !sqlBlob.includes("prod_launch_att_no_delete")) {
  issues.push({ severity: "error", area: "append-only", message: "append-only triggers missing" });
}
if (!existsSync("supabase/functions/production-launch-attestor/index.ts")) {
  issues.push({ severity: "error", area: "edge-function", message: "production-launch-attestor edge function missing" });
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
mkdirSync("generated", { recursive: true });
writeFileSync("generated/production-launch-attestation-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "production-launch-attestation", ok, errorCount, warningCount,
  validPostures: ["green","yellow","red","deferred","archived"], issues,
}, null, 2));
console.log(`${ok ? "✅" : "❌"} production-launch-attestation: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
