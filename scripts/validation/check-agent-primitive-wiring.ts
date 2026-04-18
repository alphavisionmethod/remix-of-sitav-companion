import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";
const GATE = "agent-primitive-wiring";
const issues: GateIssue[] = [];
const LOOP = "supabase/functions/internal-agent-loop/index.ts";
if (!existsSync(LOOP)) {
  issues.push({ severity: "error", area: "loop", message: "internal-agent-loop missing" });
  emitGateReport({ gate: GATE, ok: false, issues });
  process.exit(1);
}
const src = readFileSync(LOOP, "utf8");
const must = [
  "aw-incident-response",
  "aw-ai-spend-control",
  "aw-security-monitor",
  "internal-agent-execute-action",
];
for (const t of must) {
  if (!src.includes(t)) issues.push({ severity: "error", area: "wiring", message: `missing reference: ${t}` });
}
const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
