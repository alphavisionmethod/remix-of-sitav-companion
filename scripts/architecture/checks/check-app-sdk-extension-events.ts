#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 14 — App SDK extension lifecycle event validator.
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";

const issues: Array<{ severity: string; area: string; message: string }> = [];
const migDir = "supabase/migrations";
const sqlBlob = existsSync(migDir)
  ? readdirSync(migDir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n")
  : "";

if (!sqlBlob.includes("app_sdk_extension_events")) {
  issues.push({ severity: "error", area: "schema", message: "app_sdk_extension_events table not declared" });
}
if (!sqlBlob.includes("admins_read_app_sdk_ext_events")) {
  issues.push({ severity: "error", area: "rls", message: "admin-read policy missing" });
}
if (!sqlBlob.includes("users_view_own_app_sdk_ext_events")) {
  issues.push({ severity: "error", area: "rls", message: "owner-read policy missing" });
}
if (!sqlBlob.includes("app_sdk_extensions")) {
  issues.push({ severity: "warning", area: "registry", message: "app_sdk_extensions registry not yet present (Phase 9 dependency)" });
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
mkdirSync("generated", { recursive: true });
writeFileSync("generated/app-sdk-extension-events-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "app-sdk-extension-events", ok, errorCount, warningCount,
  validEventTypes: ["installed","enabled","disabled","updated","removed","verified"], issues,
}, null, 2));
console.log(`${ok ? "✅" : "❌"} app-sdk-extension-events: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
