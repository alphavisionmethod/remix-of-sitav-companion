// Phase 3 BLOCK gate: Reflection Board page is registered and wired
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "reflection-board-page";
const issues: GateIssue[] = [];
const PAGE = "src/pages/admin/ai-runtime/ReflectionBoard.tsx";
const ROUTES = "src/routes/AdminRoutes.tsx";

if (!existsSync(PAGE)) {
  issues.push({ severity: "error", area: "page", message: "ReflectionBoard.tsx missing" });
} else {
  const src = readFileSync(PAGE, "utf8");
  const required: Array<[string, string]> = [
    ["summarize_internal_agent_learning", "must call summary RPC"],
    ["internal_agent_reflections", "must read reflections table"],
    ["internal-agent-reflect", "must offer manual reflection trigger via edge function"],
    ["should_repeat", "repeat/avoid signal not surfaced"],
    ["pattern_tags", "pattern tags not surfaced"],
    ["outcome_quality", "outcome quality not surfaced"],
    ["trust_score", "trust score not surfaced"],
  ];
  for (const [token, msg] of required) {
    if (!src.includes(token)) issues.push({ severity: "error", area: "page", message: `${msg} (token: ${token})` });
  }
}

if (!existsSync(ROUTES)) {
  issues.push({ severity: "error", area: "routes", message: "AdminRoutes.tsx missing" });
} else {
  const routes = readFileSync(ROUTES, "utf8");
  if (!routes.includes("ReflectionBoard")) {
    issues.push({ severity: "error", area: "routes", message: "ReflectionBoard not lazy-imported" });
  }
  if (!routes.includes("/admin/ai-runtime/reflection-board")) {
    issues.push({ severity: "error", area: "routes", message: "/admin/ai-runtime/reflection-board route not registered" });
  }
  // Must be admin-gated (audit.view or stricter)
  const gated = /reflection-board"\s+element=\{gated\("(audit\.view|admin\.[a-z._]+)"/.test(routes);
  if (!gated) issues.push({ severity: "error", area: "security", message: "reflection-board route not behind audit.view permission gate" });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
