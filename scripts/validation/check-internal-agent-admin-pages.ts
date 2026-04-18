// SITA OS — Internal Agent Admin Pages Wiring (BLOCK gate)
//
// Asserts that the AI Runtime Hub exposes the Internal Agents + Councils
// modules and that the underlying board files exist.
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "internal-agent-admin-pages";
const issues: GateIssue[] = [];

const HUB = "src/pages/admin/ai-runtime/AIRuntimeHome.tsx";
const REQUIRED_FILES = [
  HUB,
  "src/pages/admin/ai-runtime/InternalAgentsBoard.tsx",
  "src/pages/admin/ai-runtime/CouncilsBoard.tsx",
];

for (const f of REQUIRED_FILES) {
  if (!existsSync(f)) {
    issues.push({ severity: "error", area: "files", message: `Missing required file: ${f}` });
  }
}

if (existsSync(HUB)) {
  const src = readFileSync(HUB, "utf8");
  if (!src.includes("InternalAgentsBoard")) {
    issues.push({
      severity: "error",
      area: "hub",
      message: "AIRuntimeHome does not import InternalAgentsBoard",
    });
  }
  if (!src.includes("CouncilsBoard")) {
    issues.push({
      severity: "error",
      area: "hub",
      message: "AIRuntimeHome does not import CouncilsBoard",
    });
  }
  if (!src.includes('id: "internal-agents"')) {
    issues.push({
      severity: "error",
      area: "hub",
      message: "AIRuntimeHome modules missing internal-agents tab",
    });
  }
  if (!src.includes('id: "councils"')) {
    issues.push({
      severity: "error",
      area: "hub",
      message: "AIRuntimeHome modules missing councils tab",
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
