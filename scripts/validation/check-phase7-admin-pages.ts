// Phase 7 — BLOCK validator: phase 7 admin pages exist and are routed
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "phase7-admin-pages";
const issues: GateIssue[] = [];
const pages = [
  "src/pages/admin/ai-runtime/SLOObservabilityBoard.tsx",
  "src/pages/admin/ai-runtime/OwnerCopilotBriefings.tsx",
  "src/pages/admin/ai-runtime/TenantFederationBoard.tsx",
];
for (const p of pages) {
  if (!existsSync(p)) issues.push({ severity: "error", area: p, message: `missing page ${p}` });
}
const routes = "src/routes/AdminRoutes.tsx";
if (existsSync(routes)) {
  const src = readFileSync(routes, "utf8");
  for (const [name, path] of [
    ["SLOObservabilityBoard", "/admin/ai-runtime/observatory"],
    ["OwnerCopilotBriefings", "/admin/ai-runtime/owner-copilot"],
    ["TenantFederationBoard", "/admin/ai-runtime/tenant-federation"],
  ] as const) {
    if (!src.includes(name)) issues.push({ severity: "error", area: name, message: `${name} not lazy-imported` });
    if (!src.includes(path)) issues.push({ severity: "error", area: path, message: `route ${path} not registered` });
  }
}
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
