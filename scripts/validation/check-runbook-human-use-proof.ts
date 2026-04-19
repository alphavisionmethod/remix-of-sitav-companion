#!/usr/bin/env node
/* eslint-disable no-console */
// Real validator: cross-references RUNBOOK_REGISTRY with operator_drill_executions DB rows
// (or status-file fallback) and emits per-runbook coverage.
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { emitGateReport } from "./_lib/emit-gate-report";

interface RunbookRow { runbookId: string; title: string; severity: string; subsystem: string }
interface DrillRow { runbook_id: string | null; scenario: string; signoff_at: string | null }

function loadRunbookRegistry(): RunbookRow[] {
  const file = "src/lib/support/runbook-registry.ts";
  if (!existsSync(file)) return [];
  const src = readFileSync(file, "utf-8");
  const rows: RunbookRow[] = [];
  // Parse `runbookId: "RB-XXX", title: "...", ... severity: "...", ... subsystem: "..."`
  const rx = /runbookId:\s*"(RB-\d+)"[^}]*?title:\s*"([^"]+)"[^}]*?severity:\s*"([^"]+)"[^}]*?subsystem:\s*"([^"]+)"/gs;
  for (const m of src.matchAll(rx)) {
    rows.push({ runbookId: m[1], title: m[2], severity: m[3], subsystem: m[4] });
  }
  return rows;
}

function queryDrillsViaPsql(): DrillRow[] | null {
  if (!process.env.PGHOST) return null;
  try {
    const out = execSync(
      `psql -At -F '|' -c "SELECT COALESCE(runbook_id,''), scenario, COALESCE(signoff_at::text,'') FROM operator_drill_executions WHERE signoff_at IS NOT NULL AND signoff_at > now() - interval '90 days'"`,
      { encoding: "utf-8", timeout: 10_000 },
    );
    return out
      .trim()
      .split("\n")
      .filter((l) => l.length > 0)
      .map((l) => {
        const [rb, sc, sa] = l.split("|");
        return { runbook_id: rb || null, scenario: sc ?? "", signoff_at: sa || null };
      });
  } catch {
    return null;
  }
}

function loadDrillsFromStatusFile(): DrillRow[] {
  const file = "generated/hardware-and-operator-closure/operator-drill-executions.json";
  if (!existsSync(file)) return [];
  try {
    const j = JSON.parse(readFileSync(file, "utf-8")) as { rows?: DrillRow[] };
    return j.rows ?? [];
  } catch {
    return [];
  }
}

const runbooks = loadRunbookRegistry();
const drills = queryDrillsViaPsql() ?? loadDrillsFromStatusFile();
const drillSource = queryDrillsViaPsql() !== null ? "live-db" : (existsSync("generated/hardware-and-operator-closure/operator-drill-executions.json") ? "status-file" : "none");

const coverage = runbooks.map((rb) => {
  const matched = drills.filter((d) => d.runbook_id === rb.runbookId || d.scenario.toLowerCase().includes(rb.runbookId.toLowerCase()));
  return { runbookId: rb.runbookId, title: rb.title, severity: rb.severity, subsystem: rb.subsystem, executions: matched.length, latestSignoff: matched[0]?.signoff_at ?? null };
});

const covered = coverage.filter((c) => c.executions > 0).length;
const total = coverage.length;
const pct = total > 0 ? Math.round((covered / total) * 100) : 0;
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

if (total === 0) {
  issues.push({ severity: "warning", area: "registry", message: "No runbooks found in registry" });
} else if (covered === 0) {
  issues.push({ severity: "warning", area: "drills", message: `0/${total} runbooks have human-use evidence — pending-human-execution` });
} else if (pct < 50) {
  issues.push({ severity: "warning", area: "coverage", message: `Only ${pct}% runbook coverage (${covered}/${total}) — pending-human-execution` });
}

const classification = total === 0 ? "no-registry" : covered === 0 ? "pending-human-execution" : pct < 50 ? "partial-human-use" : pct < 100 ? "majority-human-use" : "full-human-use";
emitGateReport({ gate: "runbook-human-use-proof", ok: true, issues, extra: { totalRunbooks: total, coveredRunbooks: covered, coveragePct: pct, drillSource, classification, perRunbook: coverage } });
console.log(`${covered === total && total > 0 ? "✅" : "⚠"} runbook-human-use-proof: ${covered}/${total} (${pct}%) [${pct >= 50 ? "BLOCK" : "WARN-pending-human-execution"}] source=${drillSource}`);
process.exit(0);
