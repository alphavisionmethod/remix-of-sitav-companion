// Phase 6 — BLOCK validator: self-healer only runs whitelisted runbooks
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const REPORT = "generated/self-healer-safe-catalogue-report.json";
const FN_PATH = "supabase/functions/internal-agent-self-healer/index.ts";

const findings: string[] = [];
let content = "";
try {
  content = readFileSync(FN_PATH, "utf-8");
} catch {
  findings.push("Self-healer function missing");
}

if (content) {
  if (!content.includes("SAFE_RUNBOOKS")) findings.push("SAFE_RUNBOOKS catalogue missing");
  if (!content.includes("runbook_not_in_safe_catalogue")) findings.push("Catalogue rejection branch missing");
  if (!content.match(/Math\.min\(.*requested_autonomy_level.*,\s*3\)/)) {
    findings.push("L3 clamp not enforced in self-healer");
  }
  // Forbid raw SQL execution
  if (content.includes("execute_sql") || content.match(/\.rpc\(\s*["']execute_/)) {
    findings.push("Self-healer must not call execute_sql or arbitrary DDL RPCs");
  }
}

const ok = findings.length === 0;
mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(REPORT, JSON.stringify({
  gate: "self-healer-safe-catalogue",
  level: "BLOCK",
  ok,
  findings,
  generated_at: new Date().toISOString(),
}, null, 2));

if (!ok) {
  console.error("❌ BLOCK: self-healer safety:\n  - " + findings.join("\n  - "));
  process.exit(1);
}
console.log("✅ Self-healer locked to safe runbook catalogue.");
