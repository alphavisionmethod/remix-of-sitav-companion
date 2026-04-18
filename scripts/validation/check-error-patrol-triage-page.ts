import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";
const GATE = "error-patrol-triage-page";
const issues: GateIssue[] = [];
const PAGE = "src/pages/admin/health/ErrorPatrolBoard.tsx";
const ROUTES = "src/routes/AdminRoutes.tsx";
if (!existsSync(PAGE)) issues.push({ severity: "error", area: "page", message: "ErrorPatrolBoard.tsx missing" });
if (!existsSync(ROUTES)) issues.push({ severity: "error", area: "routes", message: "AdminRoutes.tsx missing" });
if (existsSync(PAGE)) {
  const src = readFileSync(PAGE, "utf8");
  for (const t of ["error_patrol_triage_view", "internal-agent-execute-action", "rollback_available", "KS-INTERNAL-AGENTS-EXECUTE"]) {
    if (!src.includes(t)) issues.push({ severity: "error", area: "page", message: `missing token: ${t}` });
  }
}
if (existsSync(ROUTES)) {
  const r = readFileSync(ROUTES, "utf8");
  if (!r.includes("/admin/health/error-patrol")) issues.push({ severity: "error", area: "routes", message: "route not registered" });
  if (!r.includes("ErrorPatrolBoard")) issues.push({ severity: "error", area: "routes", message: "ErrorPatrolBoard not imported" });
}
const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
