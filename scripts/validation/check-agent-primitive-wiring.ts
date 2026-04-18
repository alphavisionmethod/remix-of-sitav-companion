// SITA OS — Agent Primitive Wiring (Phase 2 BLOCK gate)
// Asserts the runtime loop wires the 3 priority agents to the constrained
// executor via signal→action bridges, and never bypasses the safety RPC.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "agent-primitive-wiring";
const issues: GateIssue[] = [];
const LOOP = "supabase/functions/internal-agent-loop/index.ts";

if (!existsSync(LOOP)) {
  issues.push({ severity: "error", area: "loop", message: "internal-agent-loop edge function missing" });
  emitGateReport({ gate: GATE, ok: false, issues });
  process.exit(1);
}
const src = readFileSync(LOOP, "utf8");

const requiredBridges = [
  { fn: "bridgeIncidentResponse", agent: "aw-incident-response", source: "incidents" },
  { fn: "bridgeSpendControl",     agent: "aw-ai-spend-control",  source: "ai_budget_alerts" },
  { fn: "bridgeSecurityMonitor",  agent: "aw-security-monitor",  source: "kill_switch_audit_log" },
];

for (const r of requiredBridges) {
  if (!src.includes(r.fn)) {
    issues.push({ severity: "error", area: "bridge", message: `missing bridge function ${r.fn}` });
  }
  if (!src.includes(r.agent)) {
    issues.push({ severity: "error", area: "bridge", message: `bridge does not reference agent ${r.agent}` });
  }
  if (!src.includes(r.source)) {
    issues.push({ severity: "error", area: "signal", message: `bridge missing real signal source ${r.source}` });
  }
}

if (!src.includes("internal-agent-execute-action")) {
  issues.push({ severity: "error", area: "executor", message: "loop must invoke the constrained executor (no in-loop action handlers)" });
}
if (!src.includes("runPriorityAgentBridges")) {
  issues.push({ severity: "error", area: "wiring", message: "scheduled tick must call runPriorityAgentBridges" });
}
if (!src.includes("council_escalations")) {
  issues.push({ severity: "error", area: "escalation", message: "bridges must escalate denials/anomalies via council_escalations" });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues, extra: { bridgeCount: requiredBridges.length } });
process.exit(ok ? 0 : 1);
