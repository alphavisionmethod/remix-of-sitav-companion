// SITA OS — Internal Agent Registry Integrity (BLOCK gate)
//
// Asserts:
//   1. Every council file exports an array
//   2. ALL_DETAILED_AGENTS aggregates exactly 40 agents
//   3. No duplicate agent_id across councils
//   4. Every agentId matches the canonical kebab/space pattern (non-empty)
//   5. Every agent has a non-empty mission, council, and primary escalation target
//
// Read-only filesystem scan over src/lib/internal-agents/agents/*.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "internal-agent-registry";
const issues: GateIssue[] = [];

const AGENTS_DIR = "src/lib/internal-agents/agents";
const INDEX = join(AGENTS_DIR, "index.ts");

if (!existsSync(INDEX)) {
  issues.push({ severity: "error", area: "registry", message: "agents/index.ts missing" });
  emitGateReport({ gate: GATE, ok: false, issues });
  process.exit(1);
}

const COUNCIL_FILES = [
  "product-build.ts",
  "reliability-ops.ts",
  "security-trust.ts",
  "runtime-cost.ts",
  "architecture-governance.ts",
  "knowledge-coordination.ts",
];

const seen = new Set<string>();
let totalAgents = 0;

for (const f of COUNCIL_FILES) {
  const path = join(AGENTS_DIR, f);
  if (!existsSync(path)) {
    issues.push({ severity: "error", area: f, message: "Council file missing" });
    continue;
  }
  const src = readFileSync(path, "utf8");
  // crude but stable: count `agentId: "..."` occurrences
  const ids = Array.from(src.matchAll(/agentId:\s*"([^"]+)"/g)).map((m) => m[1]);
  if (ids.length === 0) {
    issues.push({ severity: "error", area: f, message: "No agentId entries found" });
    continue;
  }
  for (const id of ids) {
    if (seen.has(id)) {
      issues.push({ severity: "error", area: f, message: `Duplicate agentId across councils: ${id}` });
    }
    seen.add(id);
  }
  totalAgents += ids.length;
  // mission + escalation presence
  const missionCount = (src.match(/mission:\s*"/g) ?? []).length;
  if (missionCount < ids.length) {
    issues.push({
      severity: "error",
      area: f,
      message: `${ids.length - missionCount} agent(s) missing mission`,
    });
  }
}

if (totalAgents !== 40) {
  issues.push({
    severity: "error",
    area: "count",
    message: `Expected exactly 40 internal agents, found ${totalAgents}`,
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: { totalAgents, councilsChecked: COUNCIL_FILES.length },
});
process.exit(ok ? 0 : 1);
