#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 12 — Onboarding 29-screen branch telemetry validator.
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";

const issues: Array<{ severity: string; area: string; message: string }> = [];
const migDir = "supabase/migrations";
const sqlBlob = existsSync(migDir)
  ? readdirSync(migDir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n")
  : "";

if (!sqlBlob.includes("onboarding_branch_events")) {
  issues.push({ severity: "error", area: "schema", message: "onboarding_branch_events table not declared" });
}
if (!sqlBlob.includes("users_insert_own_onboarding_events")) {
  issues.push({ severity: "error", area: "rls", message: "owner-insert policy missing on onboarding events" });
}
if (!existsSync("supabase/functions/onboarding-branch-tracker/index.ts")) {
  issues.push({ severity: "error", area: "edge-function", message: "onboarding-branch-tracker edge function missing" });
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
mkdirSync("generated", { recursive: true });
writeFileSync("generated/onboarding-branch-telemetry-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "onboarding-branch-telemetry", ok, errorCount, warningCount,
  expectedScreens: 29, validBranches: ["quick","balanced","deep"], issues,
}, null, 2));
console.log(`${ok ? "✅" : "❌"} onboarding-branch-telemetry: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
