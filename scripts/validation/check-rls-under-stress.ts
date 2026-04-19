#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: RLS Under Stress
// Reads generated/security-and-portability-closure/rls-stress-runs/*.json
// Required: ≥1 run in last 90 days that exercises:
//   - concurrent multi-tenant probe
//   - SECURITY DEFINER coverage check
//   - edge-condition policy bypass attempt
// BLOCK on any isolation breach. Honest WARN if zero runs.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const RUNS_DIR = "generated/security-and-portability-closure/rls-stress-runs";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
const runs: any[] = [];

if (!existsSync(RUNS_DIR)) {
  issues.push({
    severity: "warning",
    area: "evidence",
    message: "No rls-stress-runs/ directory — pending-execution. Run `npm run security:rls-stress`.",
  });
} else {
  const files = readdirSync(RUNS_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    issues.push({
      severity: "warning",
      area: "evidence",
      message: "rls-stress-runs/ empty — pending-execution",
    });
  } else {
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    let recentCount = 0;
    for (const f of files) {
      try {
        const run = JSON.parse(readFileSync(join(RUNS_DIR, f), "utf8"));
        runs.push(run);
        if (new Date(run.executedAt ?? 0).getTime() > cutoff) recentCount++;
        // Hard fail: any reported isolation breach blocks release.
        if (run.isolationBreach === true) {
          issues.push({
            severity: "error",
            area: f,
            message: `Isolation breach reported: ${run.breachDetail ?? "no detail"}`,
          });
        }
        // Required scenario coverage
        const scenarios: string[] = run.scenarios ?? [];
        const required = ["concurrent-multi-tenant", "security-definer-coverage", "edge-condition-bypass"];
        for (const r of required) {
          if (!scenarios.includes(r)) {
            issues.push({
              severity: "warning",
              area: f,
              message: `Run missing required scenario: ${r}`,
            });
          }
        }
      } catch (e) {
        issues.push({ severity: "warning", area: f, message: `Could not parse: ${(e as Error).message}` });
      }
    }
    if (recentCount === 0) {
      issues.push({
        severity: "warning",
        area: "freshness",
        message: "No RLS stress runs in last 90 days — re-execute (honest WARN-tier)",
      });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: "rls-under-stress",
  ok,
  issues,
  extra: { totalRuns: runs.length },
});
console.log(`[rls-under-stress] ${ok ? "PASS" : "FAIL"} (${runs.length} runs, ${issues.length} issues)`);
process.exit(ok ? 0 : 1);
