// Phase 6 — BLOCK validator: L3 hard ceiling enforced for cross-council actions
// Scans the migration to confirm CHECK constraints + RPC clamping logic exist.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";

const REPORT = "generated/cross-council-l3-ceiling-report.json";
const MIG_DIR = "supabase/migrations";

function findPhase6Migration(): string | null {
  const files = readdirSync(MIG_DIR).filter((f) => f.endsWith(".sql")).sort().reverse();
  for (const f of files) {
    const content = readFileSync(join(MIG_DIR, f), "utf-8");
    if (content.includes("internal_agent_consensus_sessions") &&
        content.includes("internal_agent_runbook_executions")) {
      return content;
    }
  }
  return null;
}

const mig = findPhase6Migration();
const findings: string[] = [];

if (!mig) {
  findings.push("Phase 6 migration not found");
} else {
  // Must clamp consensus to L3 in open_internal_agent_consensus
  if (!mig.includes("v_effective_level := 3") || !mig.match(/IF\s+p_proposed_autonomy_level\s*>\s*3/)) {
    findings.push("open_internal_agent_consensus is missing L3 clamp");
  }
  // Runbook executions must enforce L3 in CHECK + LEAST(...,3) in RPC
  if (!mig.includes("BETWEEN 0 AND 3")) {
    findings.push("Runbook tables missing BETWEEN 0 AND 3 CHECK constraint");
  }
  if (!mig.match(/LEAST\([^)]*,\s*3\)/)) {
    findings.push("record_internal_runbook_execution missing LEAST(...,3) clamp");
  }
  // Cost proposals must default to draft_pending_review
  if (!mig.includes("'draft_pending_review'  -- Hard rule")) {
    findings.push("propose_internal_cost_optimization missing 'never auto-applies' guard");
  }
}

const ok = findings.length === 0;
mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(REPORT, JSON.stringify({
  gate: "cross-council-l3-ceiling",
  level: "BLOCK",
  ok,
  findings,
  generated_at: new Date().toISOString(),
}, null, 2));

if (!ok) {
  console.error("❌ BLOCK: L3 ceiling enforcement issues:\n  - " + findings.join("\n  - "));
  process.exit(1);
}
console.log("✅ Phase 6 L3 hard ceiling enforced at DB layer.");
