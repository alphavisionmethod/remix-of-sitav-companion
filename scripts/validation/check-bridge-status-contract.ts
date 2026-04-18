// SITA OS — Phase 2 regression gate
// Asserts the loop bridges check the literal status strings the canonical
// executor returns. Prevents silent telemetry drift between
// internal-agent-execute-action and internal-agent-loop bridges.
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "bridge-status-contract";
const issues: GateIssue[] = [];

const EXEC = "supabase/functions/internal-agent-execute-action/index.ts";
const LOOP = "supabase/functions/internal-agent-loop/index.ts";

for (const f of [EXEC, LOOP]) {
  if (!existsSync(f)) {
    issues.push({ severity: "error", area: "file", message: `missing: ${f}` });
  }
}

if (issues.length === 0) {
  const execSrc = readFileSync(EXEC, "utf8");
  const loopSrc = readFileSync(LOOP, "utf8");

  // Canonical statuses the executor returns to bridge callers via jsonResponse({ status: ... }).
  // Extracted from the success path (line ~440) and approval/denied paths.
  const REQUIRED_EXECUTOR_STATUSES = ["executed", "failed", "denied", "approval_pending"];
  for (const s of REQUIRED_EXECUTOR_STATUSES) {
    // Look for the literal inside a return jsonResponse(...) status field.
    const re = new RegExp(`status:\\s*"${s}"`);
    const succeededFork = /status:\s*succeeded\s*\?\s*"executed"\s*:\s*"failed"/;
    if (!re.test(execSrc) && !(s === "executed" || s === "failed" ? succeededFork.test(execSrc) : false)) {
      issues.push({
        severity: "error",
        area: "executor-contract",
        message: `executor never returns status="${s}" — bridge telemetry will silently miscount`,
      });
    }
  }

  // Forbid the historical typo that caused approvalsQueued to always be 0.
  // The bridges ride the executor's "approval_pending" channel, never the legacy "queued_for_approval".
  if (/r\.status\s*===\s*"queued_for_approval"/.test(loopSrc)) {
    issues.push({
      severity: "error",
      area: "regression",
      message: 'forbidden literal r.status === "queued_for_approval" found in loop — must use canonical "approval_pending"',
    });
  }

  // Each bridge that calls callExecuteAction(...) must check approval_pending
  // (not the historical typo) and executed. Scope the audit to the
  // bridge* functions that consume callExecuteAction results.
  const bridgeBlocks = [...loopSrc.matchAll(/async function bridge[A-Z][A-Za-z]*\(supabase: any\): Promise<BridgeResult>\s*\{([\s\S]*?)^\}/gm)];
  let bridgesUsingExecutor = 0;
  for (const block of bridgeBlocks) {
    const body = block[1];
    if (!/callExecuteAction\s*\(/.test(body)) continue;
    bridgesUsingExecutor++;
    if (!/r\.status\s*===\s*"approval_pending"/.test(body)) {
      issues.push({
        severity: "error",
        area: "bridge-status-contract",
        message: `bridge ${block[0].slice(0, 80).split("(")[0]} calls callExecuteAction but does not check r.status === "approval_pending"`,
      });
    }
    if (!/r\.status\s*===\s*"executed"/.test(body)) {
      issues.push({
        severity: "error",
        area: "bridge-status-contract",
        message: `bridge ${block[0].slice(0, 80).split("(")[0]} calls callExecuteAction but does not check r.status === "executed"`,
      });
    }
  }
  if (bridgesUsingExecutor === 0) {
    issues.push({
      severity: "error",
      area: "bridge",
      message: "no executor-consuming bridge functions found — loop is unwired from the canonical executor",
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
