// SITA OS — Error Patrol Triage Page (Phase 2 BLOCK gate)
// Asserts the operator surface exists, reads from the canonical view,
// uses the constrained executor for rollback, and is registered in
// AdminRoutes under a permission gate.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "error-patrol-triage-page";
const issues: GateIssue[] = [];

const PAGE = "src/pages/admin/health/ErrorPatrolBoard.tsx";
const ROUTES = "src/routes/AdminRoutes.tsx";

if (!existsSync(PAGE)) {
  issues.push({ severity: "error", area: "page", message: "ErrorPatrolBoard.tsx missing" });
  emitGateReport({ gate: GATE, ok: false, issues });
  process.exit(1);
}
const pageSrc = readFileSync(PAGE, "utf8");

const requiredInPage = [
  { token: "error_patrol_triage_view", reason: "page must read from the canonical view" },
  { token: "internal-agent-execute-action", reason: "rollback button must invoke the canonical executor" },
  { token: "acknowledge_error_patrol_detection", reason: "acknowledge action must use canonical RPC" },
  { token: "mute_error_patrol_pattern", reason: "mute action must use canonical RPC" },
  { token: "useAuth", reason: "page must use canonical auth context" },
];
for (const r of requiredInPage) {
  if (!pageSrc.includes(r.token)) {
    issues.push({ severity: "error", area: "page", message: `${r.reason} (token: ${r.token})` });
  }
}

if (!existsSync(ROUTES)) {
  issues.push({ severity: "error", area: "routes", message: "AdminRoutes.tsx missing" });
} else {
  const routesSrc = readFileSync(ROUTES, "utf8");
  if (!routesSrc.includes("/admin/health/error-patrol")) {
    issues.push({ severity: "error", area: "routes", message: "/admin/health/error-patrol route not registered" });
  }
  if (!routesSrc.includes("ErrorPatrolBoard")) {
    issues.push({ severity: "error", area: "routes", message: "ErrorPatrolBoard not imported in AdminRoutes" });
  }
  if (!/ErrorPatrolBoard[^>]*\/>[^,]*\)\s*}/.test(routesSrc) && !routesSrc.includes("gated(\"maintenance.view\", <ErrorPatrolBoard")) {
    issues.push({ severity: "error", area: "routes", message: "ErrorPatrolBoard route not gated by maintenance.view permission" });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
