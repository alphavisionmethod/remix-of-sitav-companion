// SITA OS — Phase 3 BLOCK gate: implementation suggestions pipeline wired
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "implementation-suggestions-pipeline";
const issues: GateIssue[] = [];

const REQUIRED_FILES = [
  "src/pages/admin/ai-runtime/SuggestionsBoard.tsx",
  "src/routes/AdminRoutes.tsx",
  "src/pages/admin/ai-runtime/AIRuntimeHome.tsx",
];
for (const f of REQUIRED_FILES) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "files", message: `missing: ${f}` });
}

const board = existsSync("src/pages/admin/ai-runtime/SuggestionsBoard.tsx")
  ? readFileSync("src/pages/admin/ai-runtime/SuggestionsBoard.tsx", "utf8")
  : "";
for (const tok of [
  "ai_implementation_suggestions",
  "summarize_implementation_suggestions",
  "record_implementation_suggestion_decision",
  "internal-agent-suggestion-generator",
]) {
  if (!board.includes(tok)) issues.push({ severity: "error", area: "wiring", message: `SuggestionsBoard missing: ${tok}` });
}
// must NOT direct-write to suggestions table
if (/from\(['"]ai_implementation_suggestions['"]\)\s*\.\s*(insert|update|upsert|delete)/.test(board)) {
  issues.push({ severity: "error", area: "safety", message: "SuggestionsBoard must not write directly — must call decision RPC" });
}

const routes = existsSync("src/routes/AdminRoutes.tsx") ? readFileSync("src/routes/AdminRoutes.tsx", "utf8") : "";
if (!routes.includes("/admin/ai-runtime/suggestions")) {
  issues.push({ severity: "error", area: "route", message: "/admin/ai-runtime/suggestions not registered" });
}
if (!/SuggestionsBoard.*audit\.view|audit\.view.*SuggestionsBoard/s.test(routes)) {
  issues.push({ severity: "error", area: "route", message: "SuggestionsBoard route must be gated by audit.view" });
}

const hub = existsSync("src/pages/admin/ai-runtime/AIRuntimeHome.tsx")
  ? readFileSync("src/pages/admin/ai-runtime/AIRuntimeHome.tsx", "utf8")
  : "";
if (!hub.includes('id: "suggestions"')) {
  issues.push({ severity: "error", area: "hub", message: "AIRuntimeHome missing suggestions module" });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
