// Phase 7 — BLOCK validator: tenant kill switches require >=20 char justification
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "tenant-kill-switch-justification";
const issues: GateIssue[] = [];
const all = readdirSync("supabase/migrations").filter(f => f.endsWith(".sql"))
  .map(f => readFileSync(join("supabase/migrations", f), "utf8")).join("\n");
if (!all.match(/justification\s+TEXT NOT NULL CHECK \(length\(justification\) >= 20\)/)) {
  issues.push({ severity: "error", area: "schema", message: "internal_agent_tenant_kill_switches missing 20-char justification CHECK" });
}
const FN = "supabase/functions/internal-agent-tenant-federation/index.ts";
if (existsSync(FN)) {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("justification.length < 20")) {
    issues.push({ severity: "error", area: "function", message: "federation BFF does not enforce 20-char justification" });
  }
}
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
