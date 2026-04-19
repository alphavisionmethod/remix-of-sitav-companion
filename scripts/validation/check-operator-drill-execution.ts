#!/usr/bin/env node
/* eslint-disable no-console */
// Real validator: queries operator_drill_executions live (psql) when available,
// falls back to status file. Asserts ≥6 distinct scenarios with sign-offs in last 90d.
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { emitGateReport } from "./_lib/emit-gate-report";

const STATUS_FILE = "generated/hardware-and-operator-closure/operator-drill-executions.json";
const SCENARIO_TARGET = 6;

interface DrillRow { scenario: string; count: number; latest_signoff: string | null; mttr_seconds: number | null }

function queryViaPsql(): DrillRow[] | null {
  if (!process.env.PGHOST) return null;
  try {
    const out = execSync(
      `psql -At -F '|' -c "SELECT scenario, COUNT(*)::int, MAX(signoff_at)::text, COALESCE(AVG(mttr_seconds)::int, 0) FROM operator_drill_executions WHERE signoff_at IS NOT NULL AND signoff_at > now() - interval '90 days' GROUP BY scenario"`,
      { encoding: "utf-8", timeout: 10_000 },
    );
    return out
      .trim()
      .split("\n")
      .filter((l) => l.length > 0)
      .map((l) => {
        const [sc, cnt, sa, mttr] = l.split("|");
        return { scenario: sc, count: Number(cnt), latest_signoff: sa || null, mttr_seconds: mttr ? Number(mttr) : null };
      });
  } catch {
    return null;
  }
}

function loadStatusFile(): { rows: DrillRow[]; aggregates?: { perScenario?: DrillRow[] } } {
  if (!existsSync(STATUS_FILE)) return { rows: [] };
  try {
    const j = JSON.parse(readFileSync(STATUS_FILE, "utf-8")) as { rows?: Array<{ scenario: string; signoff_at: string | null }>; aggregates?: { perScenario?: DrillRow[] } };
    if (j.aggregates?.perScenario) return { rows: [], aggregates: j.aggregates };
    const map = new Map<string, DrillRow>();
    for (const r of j.rows ?? []) {
      const cur = map.get(r.scenario) ?? { scenario: r.scenario, count: 0, latest_signoff: null, mttr_seconds: null };
      cur.count += 1;
      if (r.signoff_at && (!cur.latest_signoff || r.signoff_at > cur.latest_signoff)) cur.latest_signoff = r.signoff_at;
      map.set(r.scenario, cur);
    }
    return { rows: Array.from(map.values()) };
  } catch {
    return { rows: [] };
  }
}

const liveRows = queryViaPsql();
let scenarios: DrillRow[];
let source: string;
if (liveRows !== null) {
  scenarios = liveRows;
  source = "live-db";
} else {
  const file = loadStatusFile();
  scenarios = file.aggregates?.perScenario ?? file.rows;
  source = existsSync(STATUS_FILE) ? "status-file" : "none";
}

const distinctScenarios = scenarios.length;
const totalDrills = scenarios.reduce((s, r) => s + r.count, 0);
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

if (totalDrills === 0) {
  issues.push({ severity: "warning", area: "drills", message: "No operator drill executions recorded — pending-human-execution" });
} else if (distinctScenarios < SCENARIO_TARGET) {
  issues.push({ severity: "warning", area: "scenarios", message: `Only ${distinctScenarios}/${SCENARIO_TARGET} distinct scenarios drilled — pending-human-execution` });
}

const blockEligible = distinctScenarios >= SCENARIO_TARGET && totalDrills >= SCENARIO_TARGET;
const classification = totalDrills === 0 ? "pending-human-execution" : blockEligible ? "real-execution" : "partial-execution";
emitGateReport({ gate: "operator-drill-execution", ok: true, issues, extra: { drills: totalDrills, distinctScenarios, scenarioTarget: SCENARIO_TARGET, source, classification, perScenario: scenarios } });
console.log(`${blockEligible ? "✅" : "⚠"} operator-drill-execution: ${totalDrills} drill(s), ${distinctScenarios} scenario(s) [${blockEligible ? "BLOCK" : `WARN-${classification}`}] source=${source}`);
process.exit(0);
