#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Auth-to-Permission Chain Audit (Layer 4)
// Verifies admin routes use AdminRoute, mobile uses ProtectedRoute
// ═══════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from "fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "auth-permission-chain";
const issues: GateIssue[] = [];

// Check AdminRoutes.tsx uses AdminRoute guard
const adminRoutesFile = "src/routes/AdminRoutes.tsx";
if (existsSync(adminRoutesFile)) {
  const content = readFileSync(adminRoutesFile, "utf-8");
  if (!content.includes("AdminRoute")) {
    issues.push({ severity: "error", area: "admin-guard", message: "AdminRoutes.tsx does not use AdminRoute guard" });
  }
  if (!content.includes("requiredPermission")) {
    issues.push({ severity: "warning", area: "admin-perms", message: "AdminRoutes.tsx does not use per-route requiredPermission" });
  }
} else {
  issues.push({ severity: "error", area: "admin-routes", message: "AdminRoutes.tsx not found" });
}

// Check MobileRoutes uses ProtectedRoute or auth gate
const mobileRoutesFile = "src/routes/MobileRoutes.tsx";
if (existsSync(mobileRoutesFile)) {
  const content = readFileSync(mobileRoutesFile, "utf-8");
  if (!content.includes("ProtectedRoute") && !content.includes("useAuth") && !content.includes("RequireAuth")) {
    issues.push({ severity: "warning", area: "mobile-auth", message: "MobileRoutes.tsx may lack authentication guard" });
  }
} else {
  issues.push({ severity: "warning", area: "mobile-routes", message: "MobileRoutes.tsx not found" });
}

// Check edge functions validate JWT
const edgeFnDirs = ["supabase/functions/admin-reset-user-setup", "supabase/functions/admin-revoke-session", "supabase/functions/escalation-engine"];
for (const dir of edgeFnDirs) {
  const fnFile = `${dir}/index.ts`;
  if (existsSync(fnFile)) {
    const content = readFileSync(fnFile, "utf-8");
    if (!content.includes("authorization") && !content.includes("getUser") && !content.includes("jwt")) {
      issues.push({ severity: "warning", area: "edge-auth", message: `${fnFile} may lack JWT validation` });
    }
  }
}

const ok = issues.filter(i => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${ok ? "auth chain intact" : `${issues.length} issue(s)`}`);
issues.forEach(i => console.error(`  [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);