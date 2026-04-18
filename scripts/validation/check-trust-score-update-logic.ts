// SITA OS — Phase 3 BLOCK gate: trust score updates flow only via canonical EWMA RPC.
// Asserts no edge function or page directly UPDATEs internal_agent_runtime_state.trust_score
// outside of the record_internal_agent_reflection RPC (which runs the EWMA roll).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "trust-score-update-logic";
const issues: GateIssue[] = [];

const ALLOWED_RPC = "record_internal_agent_reflection";

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|sql)$/.test(e)) out.push(p);
  }
  return out;
}

const candidates = [
  ...walk("src"),
  ...walk("supabase/functions"),
];

const SUSPECT_PATTERNS: RegExp[] = [
  /from\(['"]internal_agent_runtime_state['"]\)\s*\.\s*update\([^)]*trust_score/s,
  /update\s+internal_agent_runtime_state\s+set[^;]*trust_score\s*=/i,
];

for (const f of candidates) {
  // Reflection RPC body itself is allowed; skip migration files that DEFINE the RPC.
  if (/migrations\//.test(f) || f.endsWith("/internal-agent-reflect/index.ts")) continue;
  let src = "";
  try { src = readFileSync(f, "utf8"); } catch { continue; }
  for (const re of SUSPECT_PATTERNS) {
    if (re.test(src)) {
      issues.push({
        severity: "error",
        area: "trust-score",
        message: `${f}: direct trust_score mutation detected — must flow through ${ALLOWED_RPC} EWMA RPC`,
      });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
