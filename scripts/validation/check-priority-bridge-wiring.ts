// Phase 2 BLOCK gate: priority bridges (3 agents) wired into runtime loop
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "priority-bridge-wiring";
const issues: GateIssue[] = [];
const LOOP = "supabase/functions/internal-agent-loop/index.ts";

if (!existsSync(LOOP)) {
  issues.push({ severity: "error", area: "loop", message: "internal-agent-loop function missing" });
} else {
  const src = readFileSync(LOOP, "utf8");

  // Bridge entry point must exist
  if (!src.includes("runPriorityAgentBridges")) {
    issues.push({ severity: "error", area: "bridges", message: "runPriorityAgentBridges entry point not found in loop" });
  }

  // Each priority agent must invoke the constrained executor with its expected action class
  const bridges: Array<[string, string[]]> = [
    ["aw-incident-response", ["clear_stale_lock", "list_stale_locked_workflow_runs"]],
    ["aw-ai-spend-control", ["disable_unhealthy_connector", "list_unhealthy_connector_accounts"]],
    ["aw-security-monitor", ["list_unescalated_security_events", "council_escalations"]],
  ];

  for (const [agent, requiredTokens] of bridges) {
    if (!src.includes(agent)) {
      issues.push({ severity: "error", area: "bridges", message: `bridge for ${agent} not wired` });
      continue;
    }
    for (const token of requiredTokens) {
      if (!src.includes(token)) {
        issues.push({ severity: "error", area: "bridges", message: `bridge ${agent} missing token: ${token}` });
      }
    }
  }

  // Bridges MUST go through the safety brain — never bypass to direct mutations
  if (!src.includes("internal-agent-execute-action")) {
    issues.push({ severity: "error", area: "safety", message: "bridges must invoke internal-agent-execute-action; safety pipeline bypass detected" });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
