#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 9 admin pages must be present and registered in AdminRoutes.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const PAGES = [
  "src/pages/admin/ai-runtime/SovereignDeploymentDRBoard.tsx",
  "src/pages/admin/ai-runtime/ComplianceAttestationBoard.tsx",
  "src/pages/tenant/TenantSelfServiceConsole.tsx",
];
const routes = existsSync("src/routes/AdminRoutes.tsx") ? readFileSync("src/routes/AdminRoutes.tsx", "utf-8") : "";
const tenantRoutes = ["src/routes/AppRoutes.tsx", "src/routes/AppRouter.tsx", "src/App.tsx"]
  .filter(existsSync).map(f => readFileSync(f, "utf-8")).join("\n");

const adminOk = PAGES.slice(0, 2).every(p => existsSync(p)) &&
  routes.includes("SovereignDeploymentDRBoard") &&
  routes.includes("ComplianceAttestationBoard");
const tenantPageOk = existsSync(PAGES[2]);
const tenantRouteOk = tenantRoutes.includes("TenantSelfServiceConsole") || routes.includes("TenantSelfServiceConsole");
const ok = adminOk && tenantPageOk && tenantRouteOk;
console.log(`${ok ? "✅" : "❌"} phase9-admin-pages: admin=${adminOk} tenantPage=${tenantPageOk} tenantRoute=${tenantRouteOk}`);
emitGateReport({
  gate: "phase9-admin-pages", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "ui", message: "phase 9 pages or routes missing" }],
});
process.exit(ok ? 0 : 1);
