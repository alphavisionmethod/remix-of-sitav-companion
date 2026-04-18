#!/usr/bin/env node
/* eslint-disable no-console */
// Compliance evidence collector must use ONLY allowlisted parameterless collectors (no raw SQL).
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const F = "supabase/functions/compliance-evidence-collector/index.ts";
const ok = existsSync(F) && (() => {
  const src = readFileSync(F, "utf-8");
  const noRpc = !src.includes("execute_sql") && !src.includes("rpc(\"execute_sql\")");
  const hasAllowlist = src.includes("COLLECTORS:") || src.includes("const COLLECTORS");
  return noRpc && hasAllowlist;
})();
console.log(`${ok ? "✅" : "❌"} compliance-evidence-allowlisted`);
emitGateReport({
  gate: "compliance-evidence-allowlisted", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "compliance", message: "evidence collector missing allowlist or uses raw SQL" }],
});
process.exit(ok ? 0 : 1);
