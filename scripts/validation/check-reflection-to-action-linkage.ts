// SITA OS — Phase 3 BLOCK gate: reflection rows must be tied to a real action intent.
// Asserts schema FK and RPC contract — no orphan reflections allowed by design.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "reflection-to-action-linkage";
const issues: GateIssue[] = [];

const MIG_DIR = "supabase/migrations";
let foundFK = false;
let foundNotNull = false;

if (existsSync(MIG_DIR)) {
  for (const f of readdirSync(MIG_DIR).filter((x) => x.endsWith(".sql"))) {
    const src = readFileSync(join(MIG_DIR, f), "utf8");
    if (/internal_agent_reflections/i.test(src)) {
      // FK to intents table
      if (/intent_id\s+uuid[^,]*references\s+(public\.)?internal_agent_action_intents/i.test(src)) {
        foundFK = true;
      }
      if (/intent_id\s+uuid\s+not\s+null/i.test(src)) {
        foundNotNull = true;
      }
    }
  }
}

if (!foundFK) {
  issues.push({
    severity: "error",
    area: "schema",
    message: "internal_agent_reflections.intent_id missing FK to internal_agent_action_intents",
  });
}
if (!foundNotNull) {
  issues.push({
    severity: "error",
    area: "schema",
    message: "internal_agent_reflections.intent_id must be NOT NULL (no orphan reflections)",
  });
}

// Reflection function must call the canonical RPC (which enforces the linkage)
const FN = "supabase/functions/internal-agent-reflect/index.ts";
if (existsSync(FN)) {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("record_internal_agent_reflection")) {
    issues.push({ severity: "error", area: "wiring", message: "reflect function must persist via record_internal_agent_reflection RPC" });
  }
  if (!src.includes("internal_agent_action_intents")) {
    issues.push({ severity: "error", area: "wiring", message: "reflect function must source intents from internal_agent_action_intents" });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
