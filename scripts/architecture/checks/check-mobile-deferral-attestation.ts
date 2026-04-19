#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 13 — Mobile deferral attestation validator.
// Confirms append-only mobile_deferral_attestations table exists and archive marker is intact.
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";

const issues: Array<{ severity: string; area: string; message: string }> = [];
const migDir = "supabase/migrations";
const sqlBlob = existsSync(migDir)
  ? readdirSync(migDir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n")
  : "";

if (!sqlBlob.includes("mobile_deferral_attestations")) {
  issues.push({ severity: "error", area: "schema", message: "mobile_deferral_attestations table not declared" });
}
if (!sqlBlob.includes("block_mobile_deferral_mutation")) {
  issues.push({ severity: "error", area: "append-only", message: "append-only trigger function missing" });
}
if (!sqlBlob.includes("mobile_deferral_no_update") || !sqlBlob.includes("mobile_deferral_no_delete")) {
  issues.push({ severity: "error", area: "append-only", message: "append-only triggers (no_update / no_delete) missing" });
}
if (!existsSync("archive/mobile/ARCHIVED.md")) {
  issues.push({ severity: "error", area: "archive", message: "archive/mobile/ARCHIVED.md sentinel missing" });
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
mkdirSync("generated", { recursive: true });
writeFileSync("generated/mobile-deferral-attestation-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "mobile-deferral-attestation", ok, errorCount, warningCount,
  posture: "archived", archivePath: "archive/mobile/", issues,
}, null, 2));
console.log(`${ok ? "✅" : "❌"} mobile-deferral-attestation: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
