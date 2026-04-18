// Phase 6 — BLOCK validator: cross-council consensus tables exist
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const REPORT = "generated/internal-agent-consensus-tables-report.json";
const REQUIRED_TABLES = [
  "internal_agent_consensus_sessions",
  "internal_agent_consensus_votes",
];

function findInTypes(table: string): boolean {
  const types = readFileSync("src/integrations/supabase/types.ts", "utf-8");
  return types.includes(`${table}: {`);
}

const missing = REQUIRED_TABLES.filter((t) => !findInTypes(t));
const ok = missing.length === 0;

const report = {
  gate: "internal-agent-consensus-tables",
  level: "BLOCK",
  ok,
  required_tables: REQUIRED_TABLES,
  missing,
  generated_at: new Date().toISOString(),
};

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(REPORT, JSON.stringify(report, null, 2));

if (!ok) {
  console.error(`❌ BLOCK: missing consensus tables: ${missing.join(", ")}`);
  process.exit(1);
}
console.log("✅ Phase 6 consensus tables present.");
