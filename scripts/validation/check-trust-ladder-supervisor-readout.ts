#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 5 invariant: the trust-ladder admin page must only render
// data from the canonical summarize_trust_ladder RPC. Inline queries
// against ladder tables from the page itself are forbidden — keeps a
// single supervisor-grade source of truth.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const GATE = "trust-ladder-supervisor-readout";
const PAGE = "src/pages/admin/ai-runtime/TrustLadderBoard.tsx";
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

if (!existsSync(PAGE)) {
  issues.push({ severity: "error", area: "page", message: "TrustLadderBoard page missing" });
} else {
  const src = readFileSync(PAGE, "utf8");
  const FORBIDDEN = [
    ".from('internal_agent_trust_ladder')",
    '.from("internal_agent_trust_ladder")',
    ".from('internal_agent_ladder_history')",
    '.from("internal_agent_ladder_history")',
    ".from('internal_agent_knowledge_bus')",
    '.from("internal_agent_knowledge_bus")',
  ];
  for (const f of FORBIDDEN) {
    if (src.includes(f)) {
      issues.push({ severity: "error", area: "inline-query", message: `Page must use summarize_trust_ladder RPC, not inline ${f}` });
    }
  }
  if (!src.includes("summarize_trust_ladder")) {
    issues.push({ severity: "error", area: "rpc", message: "Page must call summarize_trust_ladder RPC" });
  }
  // Must show human-approval ceiling somewhere
  if (!src.includes("human_approval_required_above_rung")) {
    issues.push({ severity: "warning", area: "ui", message: "Page should surface human-approval ceiling" });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
process.exit(ok ? 0 : 1);
