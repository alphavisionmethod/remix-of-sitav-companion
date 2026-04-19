// AI Workforce Phase 4 — BLOCK gate
// Asserts Security Council DB substrate is real: tables, indexes, RPCs, RLS.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "security-council-runtime";
const issues: GateIssue[] = [];

const REQUIRED_TABLES = ["security_council_findings", "kill_switch_recommendations", "secret_rotation_triggers"];
const REQUIRED_RPCS = [
  "record_security_finding",
  "propose_kill_switch_recommendation",
  "trigger_anomaly_secret_rotation",
  "summarize_security_council",
];

function readAllMigrations(): string {
  const dir = "supabase/migrations";
  let blob = "";
  try {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isFile() && f.endsWith(".sql")) blob += "\n" + readFileSync(p, "utf-8");
    }
  } catch {
    // ignore
  }
  return blob;
}

const sql = readAllMigrations();

for (const t of REQUIRED_TABLES) {
  if (!new RegExp(`create\\s+table[^;]*public\\.${t}\\b`, "i").test(sql)) {
    issues.push({ severity: "error", area: "tables", message: `Missing table public.${t}` });
  }
  if (!new RegExp(`alter\\s+table[^;]*public\\.${t}[^;]*enable\\s+row\\s+level\\s+security`, "i").test(sql)) {
    issues.push({ severity: "error", area: "rls", message: `RLS not enabled on public.${t}` });
  }
}

for (const r of REQUIRED_RPCS) {
  if (!new RegExp(`create\\s+or\\s+replace\\s+function\\s+public\\.${r}\\b`, "i").test(sql)) {
    issues.push({ severity: "error", area: "rpc", message: `Missing RPC public.${r}` });
  }
}

// Source-signal idempotency on findings
if (!/security_council_findings[\s\S]*?unique[\s\S]*?source_signal_ref/i.test(sql)) {
  issues.push({
    severity: "warning",
    area: "idempotency",
    message: "security_council_findings should have UNIQUE on source_signal_ref for dedup",
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.filter((i) => i.severity === "error").length} errors`);
process.exit(ok ? 0 : 1);
