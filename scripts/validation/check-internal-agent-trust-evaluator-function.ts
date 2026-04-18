#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const GATE = "internal-agent-trust-evaluator-function";
const FUNC = "supabase/functions/internal-agent-trust-evaluator/index.ts";
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

if (!existsSync(FUNC)) {
  issues.push({ severity: "error", area: "filesystem", message: `${FUNC} missing` });
} else {
  const src = readFileSync(FUNC, "utf8");
  const required = [
    { needle: "evaluate_internal_agent_ladder", area: "rpc", msg: "must call evaluate_internal_agent_ladder RPC" },
    { needle: "publish_agent_learning", area: "rpc", msg: "must call publish_agent_learning RPC" },
    { needle: "internal_agent_reflections", area: "input", msg: "must read internal_agent_reflections" },
    { needle: "has_role", area: "auth", msg: "must enforce admin role via has_role" },
    { needle: "supabase.auth.getUser", area: "auth", msg: "must validate JWT via getUser" },
    { needle: "SERVICE_ROLE", area: "service-role", msg: "must run with service-role for trusted writes" },
  ];
  for (const r of required) {
    if (!src.includes(r.needle)) issues.push({ severity: "error", area: r.area, message: r.msg });
  }
  // Forbid direct DDL or rung self-promotion shortcut
  if (/\bALTER\s+TABLE\b|\bDROP\s+TABLE\b|\bCREATE\s+POLICY\b/i.test(src)) {
    issues.push({ severity: "error", area: "ddl", message: "edge function must not execute DDL" });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
process.exit(ok ? 0 : 1);
