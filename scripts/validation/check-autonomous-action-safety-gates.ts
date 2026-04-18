import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";
const GATE = "autonomous-action-safety-gates";
const issues: GateIssue[] = [];
// Verify migration contains the canonical RPC + 7 gates
const migDir = "supabase/migrations";
import { readdirSync } from "node:fs";
const files = existsSync(migDir) ? readdirSync(migDir).filter((f) => f.endsWith(".sql")) : [];
const concat = files.map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n");
const requiredGates = [
  "CREATE OR REPLACE FUNCTION public.evaluate_action_safety_gates",
  "'gate','whitelist'",
  "'gate','precondition'",
  "'gate','rollback_plan'",
  "'gate','receipt_required'",
  "'gate','rate_limit'",
  "'gate','kill_switch'",
  "'gate','autonomy'",
  "'gate','approval_threshold'",
];
for (const g of requiredGates) {
  if (!concat.includes(g)) issues.push({ severity: "error", area: "rpc", message: `missing: ${g}` });
}
const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
