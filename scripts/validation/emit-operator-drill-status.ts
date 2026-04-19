#!/usr/bin/env node
/* eslint-disable no-console */
// Emitter: queries operator_drill_executions via PG env vars (graceful fallback),
// emits generated/hardware-and-operator-closure/operator-drill-executions.json
// with per-scenario count, MTTR/MTTD averages, latest sign-off timestamps.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const OUT_FILE = "generated/hardware-and-operator-closure/operator-drill-executions.json";
const OUT_DIR = "generated/hardware-and-operator-closure";

interface AggregateRow { scenario: string; count: number; latest_signoff: string | null; avg_mttr_seconds: number | null; avg_mttd_seconds: number | null }

function tryPsql(): { rows: Array<Record<string, string>>; aggregates: AggregateRow[] } | null {
  if (!process.env.PGHOST) return null;
  try {
    const aggOut = execSync(
      `psql -At -F '|' -c "SELECT scenario, COUNT(*)::int, MAX(signoff_at)::text, COALESCE(AVG(mttr_seconds)::int, 0), COALESCE(AVG(mttd_seconds)::int, 0) FROM operator_drill_executions WHERE signoff_at IS NOT NULL GROUP BY scenario"`,
      { encoding: "utf-8", timeout: 10_000 },
    );
    const aggregates: AggregateRow[] = aggOut
      .trim()
      .split("\n")
      .filter((l) => l.length > 0)
      .map((l) => {
        const [sc, cnt, sa, mttr, mttd] = l.split("|");
        return { scenario: sc, count: Number(cnt), latest_signoff: sa || null, avg_mttr_seconds: mttr ? Number(mttr) : null, avg_mttd_seconds: mttd ? Number(mttd) : null };
      });
    const rowsOut = execSync(
      `psql -At -F '|' -c "SELECT scenario, COALESCE(runbook_id,''), COALESCE(signoff_at::text,''), COALESCE(operator_id::text,'') FROM operator_drill_executions WHERE signoff_at IS NOT NULL ORDER BY signoff_at DESC LIMIT 100"`,
      { encoding: "utf-8", timeout: 10_000 },
    );
    const rows = rowsOut
      .trim()
      .split("\n")
      .filter((l) => l.length > 0)
      .map((l) => {
        const [scenario, runbook_id, signoff_at, operator_id] = l.split("|");
        return { scenario, runbook_id, signoff_at, operator_id };
      });
    return { rows, aggregates };
  } catch (e) {
    console.warn(`[emit-operator-drill-status] psql query failed: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}

const live = tryPsql();
const payload = {
  generatedAt: new Date().toISOString(),
  source: live !== null ? "live-db" : "no-db-access",
  rows: live?.rows ?? [],
  aggregates: { perScenario: live?.aggregates ?? [] },
  totals: {
    distinctScenarios: live?.aggregates.length ?? 0,
    totalDrills: live?.aggregates.reduce((s, r) => s + r.count, 0) ?? 0,
  },
};

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2));
console.log(`✓ emit-operator-drill-status: wrote ${OUT_FILE} (source=${payload.source}, scenarios=${payload.totals.distinctScenarios}, drills=${payload.totals.totalDrills})`);
process.exit(0);
