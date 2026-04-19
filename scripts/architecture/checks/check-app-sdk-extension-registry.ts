#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 9 partial: App SDK Extension Manager — verifies extension registry contract.
// The table app_sdk_extensions provides registration + lifecycle for plugin/widget extensions.
// This static check asserts the contract expectations (UNIQUE composite key, lifecycle states).
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";

const issues: Array<{ severity: string; area: string; message: string }> = [];

const migDir = "supabase/migrations";
const sqlBlob = existsSync(migDir)
  ? readdirSync(migDir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n")
  : "";

if (!sqlBlob.includes("app_sdk_extensions")) {
  issues.push({ severity: "error", area: "schema", message: "app_sdk_extensions table not declared in migrations" });
}
if (!sqlBlob.includes("UNIQUE (app_id, extension_kind, extension_id, version)")) {
  issues.push({ severity: "error", area: "schema", message: "missing unique composite key on extensions" });
}
if (!sqlBlob.includes("admins_write_app_sdk_extensions")) {
  issues.push({ severity: "error", area: "rls", message: "admin write policy missing on app_sdk_extensions" });
}
if (!sqlBlob.includes("auth_read_app_sdk_extensions")) {
  issues.push({ severity: "error", area: "rls", message: "authenticated read policy missing on app_sdk_extensions" });
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "app-sdk-extension-registry",
  ok,
  errorCount,
  warningCount,
  issues,
};
mkdirSync("generated", { recursive: true });
writeFileSync("generated/app-sdk-extension-registry-report.json", JSON.stringify(report, null, 2));
console.log(`${ok ? "✅" : "❌"} app-sdk-extension-registry: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
