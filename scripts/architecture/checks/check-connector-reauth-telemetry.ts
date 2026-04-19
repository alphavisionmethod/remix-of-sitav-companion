#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 6: Connector Reauth UX — verifies tracker function + table contract.
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";

const FN = "supabase/functions/connector-reauth-tracker/index.ts";
const issues: Array<{ severity: string; area: string; message: string }> = [];

if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "edge-function", message: "connector-reauth-tracker function missing" });
} else {
  const src = readFileSync(FN, "utf8");
  for (const action of ["prompted", "resolved", "failed"]) {
    if (!src.includes(`"${action}"`)) {
      issues.push({ severity: "error", area: "actions", message: `missing handler for action: ${action}` });
    }
  }
  if (!src.includes("connector_reauth_events")) {
    issues.push({ severity: "error", area: "persistence", message: "tracker does not write to connector_reauth_events" });
  }
  if (!src.includes("user_id = userId") && !src.includes("user_id: userId")) {
    issues.push({ severity: "error", area: "scope", message: "tracker must scope writes to authenticated user" });
  }
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "connector-reauth-telemetry",
  ok,
  errorCount,
  warningCount,
  issues,
};
mkdirSync("generated", { recursive: true });
writeFileSync("generated/connector-reauth-telemetry-report.json", JSON.stringify(report, null, 2));
console.log(`${ok ? "✅" : "❌"} connector-reauth-telemetry: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
