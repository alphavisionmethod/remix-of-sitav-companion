// Phase 6 — BLOCK validator: cost optimizer never auto-applies
// Scans codebase to ensure no surface mutates ai_capability_routing / ai_routing_policies
// based on internal_agent_cost_proposals state.
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";

const REPORT = "generated/cost-proposals-never-auto-apply-report.json";
const ROOTS = ["src", "supabase/functions"];
const VIOLATIONS: Array<{ file: string; line: number; snippet: string }> = [];

const FORBIDDEN_PATTERNS = [
  // any code that reads a cost proposal and then writes routing/budget tables in the same flow
  /from\(\s*["']internal_agent_cost_proposals["']\s*\)[\s\S]{0,2000}from\(\s*["'](ai_capability_routing|ai_routing_policies|ai_workforce_budget_classes)["']\s*\)\.(update|upsert|insert)/g,
];

function walk(dir: string) {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) walk(full);
    else if ([".ts", ".tsx", ".js"].includes(extname(name))) check(full);
  }
}

function check(file: string) {
  // skip the validator file itself and the admin board (which only updates the proposal row, never routing)
  if (file.includes("check-cost-proposals-never-auto-apply")) return;
  const content = readFileSync(file, "utf-8");
  for (const pat of FORBIDDEN_PATTERNS) {
    let m: RegExpExecArray | null;
    pat.lastIndex = 0;
    while ((m = pat.exec(content)) !== null) {
      const upto = content.slice(0, m.index).split("\n");
      VIOLATIONS.push({ file, line: upto.length, snippet: m[0].slice(0, 140) + "..." });
    }
  }
}

for (const r of ROOTS) walk(r);

const ok = VIOLATIONS.length === 0;
mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(REPORT, JSON.stringify({
  gate: "cost-proposals-never-auto-apply",
  level: "BLOCK",
  ok,
  violations: VIOLATIONS,
  generated_at: new Date().toISOString(),
}, null, 2));

if (!ok) {
  console.error(`❌ BLOCK: ${VIOLATIONS.length} violation(s) — cost proposals must never auto-apply`);
  for (const v of VIOLATIONS) console.error(`  ${v.file}:${v.line}`);
  process.exit(1);
}
console.log("✅ Cost proposals never auto-apply.");
