#!/usr/bin/env node
/* eslint-disable no-console */
// Economic-Trust-Future Closure — calm-mode default posture gate.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "calm-mode-default-posture";
const SHELL = "src/components/sita/ShellLayout.tsx";
const HOOK = "src/hooks/use-calm-mode.ts";
const issues: GateIssue[] = [];

if (!existsSync(SHELL)) {
  issues.push({ severity: "error", area: "shell", message: `${SHELL} missing` });
} else {
  const src = readFileSync(SHELL, "utf-8");
  if (!/useCalmMode/.test(src)) issues.push({ severity: "error", area: "wiring", message: "ShellLayout does not import useCalmMode" });
  if (!/calm-mode/.test(src)) issues.push({ severity: "error", area: "class", message: "ShellLayout does not apply calm-mode class" });
}
if (!existsSync(HOOK)) {
  issues.push({ severity: "error", area: "hook", message: `${HOOK} missing` });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
