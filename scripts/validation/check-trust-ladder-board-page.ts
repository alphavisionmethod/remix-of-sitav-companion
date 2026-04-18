#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const GATE = "trust-ladder-board-page";
const PAGE = "src/pages/admin/ai-runtime/TrustLadderBoard.tsx";
const ROUTES = "src/routes/AdminRoutes.tsx";
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

if (!existsSync(PAGE)) {
  issues.push({ severity: "error", area: "page", message: `${PAGE} missing` });
} else {
  const src = readFileSync(PAGE, "utf8");
  const checks = [
    { needle: "summarize_trust_ladder", area: "rpc", msg: "page must call summarize_trust_ladder RPC" },
    { needle: "internal-agent-trust-evaluator", area: "fn", msg: "page must invoke trust-evaluator edge function" },
    { needle: "Trust Ladder", area: "ui", msg: "page must render Trust Ladder heading" },
  ];
  for (const c of checks) if (!src.includes(c.needle)) issues.push({ severity: "error", area: c.area, message: c.msg });
}

if (existsSync(ROUTES)) {
  const r = readFileSync(ROUTES, "utf8");
  if (!r.includes("TrustLadderBoard")) {
    issues.push({ severity: "error", area: "route", message: "AdminRoutes must lazy-import TrustLadderBoard" });
  }
  if (!r.includes("/admin/ai-runtime/trust-ladder")) {
    issues.push({ severity: "error", area: "route", message: "AdminRoutes must register /admin/ai-runtime/trust-ladder" });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
process.exit(ok ? 0 : 1);
