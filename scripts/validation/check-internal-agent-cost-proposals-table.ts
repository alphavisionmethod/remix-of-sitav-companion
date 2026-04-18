// Phase 6 — BLOCK validator: cost-proposal tables exist
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const REPORT = "generated/internal-agent-cost-proposals-table-report.json";
const REQUIRED = ["internal_agent_cost_proposals"];

const types = readFileSync("src/integrations/supabase/types.ts", "utf-8");
const missing = REQUIRED.filter((t) => !types.includes(`${t}: {`));
const ok = missing.length === 0;

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(REPORT, JSON.stringify({
  gate: "internal-agent-cost-proposals-table",
  level: "BLOCK",
  ok,
  required: REQUIRED,
  missing,
  generated_at: new Date().toISOString(),
}, null, 2));

if (!ok) {
  console.error(`❌ BLOCK: missing cost-proposal table: ${missing.join(", ")}`);
  process.exit(1);
}
console.log("✅ Phase 6 cost-proposal table present.");
