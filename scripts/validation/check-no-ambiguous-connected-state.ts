#!/usr/bin/env node
/* eslint-disable no-console */
// Greps connector UI surfaces for hard-coded 'Connected' strings not driven by ConnectorStateBadge.
// Honors `// allow-connected-literal:` annotations on the SAME or PREVIOUS line.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "no-ambiguous-connected-state";
const issues: GateIssue[] = [];

const SEARCH_DIRS = [
  "src/pages/admin/integrations",
  "src/components/admin/integrations",
  "src/pages/admin/CN01ConnectorRealityOverview.tsx",
  "src/pages/admin/CN05ConnectorHealthBoard.tsx",
];

const SAME_LINE_ALLOW = [
  /ConnectorStateBadge/,
  /\/\/ allow-connected-literal:/,
  /aria-label/i,
];

for (const target of SEARCH_DIRS) {
  let out = "";
  try {
    out = execSync(`grep -rHn '>Connected<\\|>Connected ' ${target} 2>/dev/null || true`, {
      encoding: "utf-8",
    });
  } catch {}
  const lines = out.split("\n").filter(Boolean);
  for (const line of lines) {
    if (SAME_LINE_ALLOW.some((rx) => rx.test(line))) continue;

    // Parse "file:lineNo:content"
    const m = /^([^:]+):(\d+):(.*)$/.exec(line);
    if (m) {
      const file = m[1];
      const lineNo = parseInt(m[2], 10);
      // Check the PREVIOUS line for an allow-comment
      try {
        const fileLines = readFileSync(file, "utf-8").split("\n");
        const prev = fileLines[lineNo - 2] ?? "";
        if (/\/\/ allow-connected-literal:|\{\/\* allow-connected-literal:/.test(prev)) continue;
      } catch {}
    }

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
