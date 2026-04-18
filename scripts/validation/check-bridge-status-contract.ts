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

  // Canonical statuses returned by the executor in jsonResponse({ status: ... })
  const execStatuses = new Set<string>();
  for (const m of execSrc.matchAll(/jsonResponse\(\s*{\s*status:\s*"([a-z_]+)"/g)) {
    execStatuses.add(m[1]);
  }
  // Required canonical statuses that bridges depend on
  for (const required of ["approval_pending", "executed"]) {
    if (!execStatuses.has(required)) {
      issues.push({
        severity: "error",
        area: "executor-contract",
        message: `executor never returns status="${required}" — bridge telemetry will silently miscount`,
      });
    }
  }

  // Every r.status === "..." check in the loop must reference a real executor status
  const checks = [...loopSrc.matchAll(/r\.status\s*===\s*"([a-z_]+)"/g)].map((m) => m[1]);
  if (checks.length === 0) {
    issues.push({ severity: "error", area: "bridge", message: "no r.status checks found in loop bridges" });
  }
  for (const c of checks) {
    if (!execStatuses.has(c)) {
      issues.push({
        severity: "error",
        area: "bridge-status-mismatch",
        message: `loop checks r.status === "${c}" but executor never returns it (valid: ${[...execStatuses].join(", ")})`,
      });
    }
  }

  // Forbid the historical typo that caused approvalsQueued to always be 0
  if (loopSrc.includes('"queued_for_approval"')) {
    issues.push({
      severity: "error",
      area: "regression",
      message: 'forbidden literal "queued_for_approval" found in loop — must use canonical "approval_pending"',
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
