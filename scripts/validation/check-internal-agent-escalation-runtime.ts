// SITA OS — Internal Agent Escalation Runtime (BLOCK gate)
//
// Asserts that every agent's primary_escalation_target references a key
// present in src/lib/internal-agents/supervisors.ts (SUPERVISORS array).
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "internal-agent-escalation-runtime";
const issues: GateIssue[] = [];

const SUP_FILE = "src/lib/internal-agents/supervisors.ts";
const AGENTS_DIR = "src/lib/internal-agents/agents";

if (!existsSync(SUP_FILE)) {
  issues.push({ severity: "error", area: "supervisors", message: "supervisors.ts missing" });
  emitGateReport({ gate: GATE, ok: false, issues });
  process.exit(1);
}

const supSrc = readFileSync(SUP_FILE, "utf8");
const supKeys = new Set(
  Array.from(supSrc.matchAll(/supervisorId:\s*"([^"]+)"/g)).map((m) => m[1]),
);
if (supKeys.size === 0) {
  issues.push({
    severity: "error",
    area: "supervisors",
    message: "No supervisorId entries found",
  });
}

let unresolved = 0;
for (const f of readdirSync(AGENTS_DIR)) {
  if (!f.endsWith(".ts") || f === "index.ts") continue;
  const src = readFileSync(join(AGENTS_DIR, f), "utf8");
  // Each agent has escalationTargets: ["sup-xxx", "sup-yyy"]
  const targets = Array.from(src.matchAll(/escalationTargets:\s*\[([^\]]*)\]/g));
  for (const m of targets) {
    const ids = Array.from(m[1].matchAll(/"([^"]+)"/g)).map((x) => x[1]);
    for (const id of ids) {
      if (!supKeys.has(id)) {
        issues.push({
          severity: "error",
          area: f,
          message: `Unresolved escalation target: ${id}`,
        });
        unresolved += 1;
      }
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: { supervisors: supKeys.size, unresolved },
});
process.exit(ok ? 0 : 1);
