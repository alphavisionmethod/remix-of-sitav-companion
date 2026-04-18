// SITA OS — Internal Agent Seed Integrity (BLOCK gate)
//
// Asserts that the seed migration is present and that:
//   - it inserts into internal_agent_definitions with a spec_hash column
//   - it uses ON CONFLICT (agent_id) DO UPDATE so re-runs are idempotent
//   - it backfills internal_agent_runtime_state
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "internal-agent-seed-integrity";
const issues: GateIssue[] = [];

const MIGRATIONS_DIR = "supabase/migrations";

let hasInsert = false;
let hasSpecHash = false;
let hasIdempotent = false;
let hasRuntimeBackfill = false;
let migrationFile = "";

if (existsSync(MIGRATIONS_DIR)) {
  for (const f of readdirSync(MIGRATIONS_DIR)) {
    if (!f.endsWith(".sql")) continue;
    const src = readFileSync(join(MIGRATIONS_DIR, f), "utf8");
    if (src.includes("internal_agent_definitions") && src.includes("INSERT INTO")) {
      hasInsert = true;
      migrationFile = f;
      if (src.includes("spec_hash")) hasSpecHash = true;
      if (src.includes("ON CONFLICT") && src.includes("DO UPDATE")) hasIdempotent = true;
      if (src.includes("internal_agent_runtime_state")) hasRuntimeBackfill = true;
    }
  }
}

if (!hasInsert) {
  issues.push({ severity: "error", area: "seed", message: "No seed migration inserts agents" });
}
if (!hasSpecHash) {
  issues.push({
    severity: "error",
    area: "schema",
    message: "Seed migration does not write spec_hash for content-versioning",
  });
}
if (!hasIdempotent) {
  issues.push({
    severity: "error",
    area: "idempotency",
    message: "Seed migration is not idempotent (missing ON CONFLICT … DO UPDATE)",
  });
}
if (!hasRuntimeBackfill) {
  issues.push({
    severity: "error",
    area: "runtime-state",
    message: "Seed migration does not backfill internal_agent_runtime_state",
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues, extra: { migrationFile } });
process.exit(ok ? 0 : 1);
