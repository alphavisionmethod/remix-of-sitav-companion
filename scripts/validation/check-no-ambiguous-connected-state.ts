#!/usr/bin/env node
/* eslint-disable no-console */
// Greps connector UI surfaces for hard-coded 'Connected' strings not driven by ConnectorStateBadge.
import { execSync } from "node:child_process";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "no-ambiguous-connected-state";
const issues: GateIssue[] = [];

const SEARCH_DIRS = [
  "src/pages/admin/integrations",
  "src/components/admin/integrations",
  "src/pages/admin/CN01ConnectorRealityOverview.tsx",
  "src/pages/admin/CN05ConnectorHealthBoard.tsx",
];

const ALLOWED_PATTERNS = [
  /ConnectorStateBadge/,
  /\/\/ allow-connected-literal:/,
  /aria-label/i,
];

for (const dir of SEARCH_DIRS) {
  let out = "";
  try {
    out = execSync(
      `grep -rn '>Connected<\\|>Connected ' ${dir} 2>/dev/null || true`,
      { encoding: "utf-8" },
    );
  } catch {}
  const lines = out.split("\n").filter(Boolean);
  for (const line of lines) {
    if (ALLOWED_PATTERNS.some((rx) => rx.test(line))) continue;
    issues.push({
      severity: "error",
      area: "drift",
      message: `Hard-coded "Connected" outside ConnectorStateBadge: ${line.slice(0, 200)}`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} drift hits`);
process.exit(ok ? 0 : 1);
