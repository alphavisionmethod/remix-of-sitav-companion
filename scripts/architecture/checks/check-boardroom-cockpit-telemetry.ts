#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 10 — Advisor Boardroom 16-tab cockpit telemetry validator.
// Verifies the boardroom_cockpit_tab_views table contract is in place.
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";

const issues: Array<{ severity: string; area: string; message: string }> = [];
const migDir = "supabase/migrations";
const sqlBlob = existsSync(migDir)
  ? readdirSync(migDir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n")
  : "";

if (!sqlBlob.includes("boardroom_cockpit_tab_views")) {
  issues.push({ severity: "error", area: "schema", message: "boardroom_cockpit_tab_views table not declared" });
}
if (!sqlBlob.includes("users_insert_own_cockpit_tab_views")) {
  issues.push({ severity: "error", area: "rls", message: "owner-insert policy missing on cockpit tab views" });
}
if (!sqlBlob.includes("admins_read_all_cockpit_tab_views")) {
  issues.push({ severity: "error", area: "rls", message: "admin-read policy missing on cockpit tab views" });
}
if (!existsSync("supabase/functions/boardroom-cockpit-telemetry/index.ts")) {
  issues.push({ severity: "error", area: "edge-function", message: "boardroom-cockpit-telemetry edge function missing" });
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
mkdirSync("generated", { recursive: true });
writeFileSync("generated/boardroom-cockpit-telemetry-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "boardroom-cockpit-telemetry", ok, errorCount, warningCount, issues,
}, null, 2));
console.log(`${ok ? "✅" : "❌"} boardroom-cockpit-telemetry: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
