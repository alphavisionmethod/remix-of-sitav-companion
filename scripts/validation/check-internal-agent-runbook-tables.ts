// Phase 6 — BLOCK validator: runbook bindings + executions tables exist
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const REPORT = "generated/internal-agent-runbook-tables-report.json";
const REQUIRED = ["internal_agent_runbook_bindings", "internal_agent_runbook_executions"];

const types = readFileSync("src/integrations/supabase/types.ts", "utf-8");
const missing = REQUIRED.filter((t) => !types.includes(`${t}: {`));
const ok = missing.length === 0;

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(REPORT, JSON.stringify({
  gate: "internal-agent-runbook-tables",
  level: "BLOCK",
  ok,
  required: REQUIRED,
  missing,
  generated_at: new Date().toISOString(),
}, null, 2));

if (!ok) {
  console.error(`❌ BLOCK: missing runbook tables: ${missing.join(", ")}`);
  process.exit(1);
}
console.log("✅ Phase 6 runbook tables present.");
