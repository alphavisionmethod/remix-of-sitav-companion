// SITA OS — Internal Agent Runtime Coverage (BLOCK gate)
//
// Asserts that the seeding migration covers every agent definition with a
// runtime_state row (the seeding migration inserts an `idle` row for any
// definition lacking one). Read-only filesystem check over the seed migration
// + agent registry — no DB connection required.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "internal-agent-runtime-coverage";
const issues: GateIssue[] = [];

const MIGRATIONS_DIR = "supabase/migrations";

let foundSeederMigration = false;
let foundRuntimeStateBackfill = false;

if (existsSync(MIGRATIONS_DIR)) {
  for (const f of readdirSync(MIGRATIONS_DIR)) {
    if (!f.endsWith(".sql")) continue;
    const src = readFileSync(join(MIGRATIONS_DIR, f), "utf8");
    if (src.includes("internal_agent_definitions") && src.includes("INSERT")) {
      foundSeederMigration = true;
    }
    if (
      src.includes("internal_agent_runtime_state") &&
      src.includes("INSERT") &&
      src.includes("LEFT JOIN")
    ) {
      foundRuntimeStateBackfill = true;
    }
  }
}

if (!foundSeederMigration) {
  issues.push({
    severity: "error",
    area: "seed",
    message: "No migration found that inserts into internal_agent_definitions",
  });
}
if (!foundRuntimeStateBackfill) {
  issues.push({
    severity: "error",
    area: "runtime-state",
    message:
      "No migration backfills internal_agent_runtime_state for definitions lacking a row",
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
