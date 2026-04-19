#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 15 — Federation opt-in append-only validator.
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";

const issues: Array<{ severity: string; area: string; message: string }> = [];
const migDir = "supabase/migrations";
const sqlBlob = existsSync(migDir)
  ? readdirSync(migDir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n")
  : "";

if (!sqlBlob.includes("federation_optin_events")) {
  issues.push({ severity: "error", area: "schema", message: "federation_optin_events table not declared" });
}
if (!sqlBlob.includes("block_federation_optin_mutation")) {
  issues.push({ severity: "error", area: "append-only", message: "append-only trigger function missing" });
}
if (!sqlBlob.includes("federation_optin_no_update") || !sqlBlob.includes("federation_optin_no_delete")) {
  issues.push({ severity: "error", area: "append-only", message: "append-only triggers missing" });
}
if (!sqlBlob.includes("admins_insert_federation_optin")) {
  issues.push({ severity: "error", area: "rls", message: "admin-insert policy missing" });
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
mkdirSync("generated", { recursive: true });
writeFileSync("generated/federation-optin-append-only-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "federation-optin-append-only", ok, errorCount, warningCount, issues,
}, null, 2));
console.log(`${ok ? "✅" : "❌"} federation-optin-append-only: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
