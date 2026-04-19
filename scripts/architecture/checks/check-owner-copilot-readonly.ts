#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 15 — Owner Copilot read-only session validator.
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";

const issues: Array<{ severity: string; area: string; message: string }> = [];
const migDir = "supabase/migrations";
const sqlBlob = existsSync(migDir)
  ? readdirSync(migDir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n")
  : "";

if (!sqlBlob.includes("owner_copilot_sessions")) {
  issues.push({ severity: "error", area: "schema", message: "owner_copilot_sessions table not declared" });
}
if (!sqlBlob.includes("read_only_verified BOOLEAN NOT NULL DEFAULT true")) {
  issues.push({ severity: "error", area: "contract", message: "read_only_verified default missing — copilot must default read-only" });
}
if (!sqlBlob.includes("users_view_own_copilot_sessions") || !sqlBlob.includes("admins_read_all_copilot_sessions")) {
  issues.push({ severity: "error", area: "rls", message: "owner+admin read policies missing on copilot sessions" });
}
if (!existsSync("supabase/functions/owner-copilot-session-tracker/index.ts")) {
  issues.push({ severity: "error", area: "edge-function", message: "owner-copilot-session-tracker missing" });
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
mkdirSync("generated", { recursive: true });
writeFileSync("generated/owner-copilot-readonly-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "owner-copilot-readonly", ok, errorCount, warningCount, issues,
}, null, 2));
console.log(`${ok ? "✅" : "❌"} owner-copilot-readonly: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
