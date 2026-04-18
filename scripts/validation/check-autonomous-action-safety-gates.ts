// SITA OS — Autonomous Action Safety Gates (Phase 2 BLOCK gate)
// Asserts the canonical evaluate_action_safety_gates RPC exists in the
// committed migrations and includes all 7 gate evaluations.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "autonomous-action-safety-gates";
const issues: GateIssue[] = [];

const MIG_DIR = "supabase/migrations";
let foundRpc = false;
let rpcSource = "";
for (const f of readdirSync(MIG_DIR).sort()) {
  if (!f.endsWith(".sql")) continue;
  const sql = readFileSync(join(MIG_DIR, f), "utf8");
  if (sql.includes("evaluate_action_safety_gates")) {
    foundRpc = true;
    rpcSource += sql + "\n";
  }
}

if (!foundRpc) {
  issues.push({ severity: "error", area: "rpc", message: "evaluate_action_safety_gates RPC not found in any migration" });
  emitGateReport({ gate: GATE, ok: false, issues });
  process.exit(1);
}

const required: Array<{ token: string; gate: string }> = [
  { token: "internal_agent_action_whitelist", gate: "G1 whitelist" },
  { token: "precondition", gate: "G2 precondition evidence" },
  { token: "rollback_plan", gate: "G3 rollback plan" },
  { token: "rate_limit", gate: "G4 rate limit" },
  { token: "automation_kill_switches", gate: "G5 kill switch" },
  { token: "current_autonomy_level", gate: "G6 autonomy level" },
  { token: "approval_threshold", gate: "G7 approval threshold" },
];
for (const r of required) {
  if (!rpcSource.includes(r.token)) {
    issues.push({ severity: "error", area: "gate", message: `${r.gate} missing token ${r.token} in RPC body` });
  }
}

if (!rpcSource.includes("SECURITY DEFINER")) {
  issues.push({ severity: "error", area: "security", message: "RPC must be SECURITY DEFINER" });
}
if (!rpcSource.includes("has_role")) {
  issues.push({ severity: "error", area: "security", message: "RPC must enforce admin/has_role guard" });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues, extra: { gateChecks: required.length } });
process.exit(ok ? 0 : 1);
