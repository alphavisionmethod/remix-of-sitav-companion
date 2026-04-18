// SITA OS — Admin AI Runtime Drilldown Completeness (BLOCK gate)
//
// Asserts that InternalAgentsBoard imports the canonical drilldown panel
// (real receipts/budget/health) AND the nightly proof badge.
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "admin-ai-runtime-drilldowns";
const issues: GateIssue[] = [];

const BOARD = "src/pages/admin/ai-runtime/InternalAgentsBoard.tsx";
const PANEL = "src/components/admin/ai-runtime/AIRuntimeDrilldownPanel.tsx";
const DATA = "src/lib/internal-agents/runtime/agent-drilldown-data.ts";

for (const f of [BOARD, PANEL, DATA]) {
  if (!existsSync(f)) {
    issues.push({ severity: "error", area: "files", message: `Missing required file: ${f}` });
  }
}

if (existsSync(BOARD)) {
  const src = readFileSync(BOARD, "utf8");
  if (!src.includes("AIRuntimeDrilldownPanel")) {
    issues.push({
      severity: "error",
      area: "drilldown",
      message: "InternalAgentsBoard does not mount AIRuntimeDrilldownPanel",
    });
  }
  if (!src.includes("NightlyProofBadge")) {
    issues.push({
      severity: "error",
      area: "proof",
      message: "InternalAgentsBoard does not display NightlyProofBadge",
    });
  }
}

if (existsSync(PANEL)) {
  const src = readFileSync(PANEL, "utf8");
  for (const tab of ["actions", "budget", "health"]) {
    if (!src.includes(`value="${tab}"`)) {
      issues.push({
        severity: "error",
        area: "tabs",
        message: `Drilldown panel missing required tab: ${tab}`,
      });
    }
  }
}

if (existsSync(DATA)) {
  const src = readFileSync(DATA, "utf8");
  for (const table of [
    "internal_agent_actions",
    "ai_workforce_invocations",
    "ai_usage_ledger",
    "ai_workforce_budget_classes",
    "ai_fallback_events",
    "ai_provider_health",
  ]) {
    if (!src.includes(table)) {
      issues.push({
        severity: "error",
        area: "data",
        message: `Drilldown data loader does not query: ${table}`,
      });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
