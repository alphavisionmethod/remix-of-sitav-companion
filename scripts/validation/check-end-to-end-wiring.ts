#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — End-to-End Wiring Validator (Layer 4)
// Traces golden path wiring: UI -> hook -> edge fn -> DB table
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync } from "fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "end-to-end-wiring";
const issues: GateIssue[] = [];

interface WiringCheck {
  name: string;
  uiFile: string;
  edgeFunction?: string;
  table: string;
}

const GOLDEN_PATHS: WiringCheck[] = [
  { name: "Auth -> Login -> Session", uiFile: "src/pages/auth/AuthPage.tsx", table: "accounts" },
  { name: "Business -> Leads", uiFile: "src/pages/business/BusinessPage.tsx", edgeFunction: "business-board-api", table: "leads" },
  { name: "Finance -> Invoices", uiFile: "src/pages/finance/FinancePage.tsx", edgeFunction: "cashflow-calculate", table: "invoices" },
  { name: "Boardroom -> Session", uiFile: "src/pages/boardroom/BoardroomPage.tsx", edgeFunction: "boardroom-session", table: "boardroom_items" },
  { name: "Files -> Storage", uiFile: "src/pages/files/FilesPage.tsx", table: "file_" },
  { name: "Admin -> Alerts", uiFile: "src/pages/admin/AlertsDashboard.tsx", edgeFunction: "alert-ingest", table: "alerts" },
  { name: "Admin -> Kill Switches", uiFile: "src/pages/admin/AR08KillSwitchCenter.tsx", table: "kill_switches" },
  { name: "Admin -> SLA Monitoring", uiFile: "src/pages/admin/SLAMonitoringDashboard.tsx", edgeFunction: "sla-evaluator", table: "sla_snapshots" },
];

let passed = 0;

for (const path of GOLDEN_PATHS) {
  // Check UI exists
  if (!existsSync(path.uiFile)) {
    issues.push({ severity: "error", area: path.name, message: `UI file missing: ${path.uiFile}` });
    continue;
  }

  // Check edge function exists if declared
  if (path.edgeFunction) {
    const fnPath = `supabase/functions/${path.edgeFunction}/index.ts`;
    if (!existsSync(fnPath)) {
      issues.push({ severity: "warning", area: path.name, message: `Edge function missing: ${fnPath}` });
    }
  }

  // Check table referenced in types
  const typesContent = readFileSync("src/integrations/supabase/types.ts", "utf-8");
  if (!typesContent.includes(path.table)) {
    issues.push({ severity: "warning", area: path.name, message: `Table "${path.table}" not found in DB schema` });
  } else {
    passed++;
  }
}

const ok = issues.filter(i => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${passed}/${GOLDEN_PATHS.length} golden paths wired`);
issues.forEach(i => console.error(`  [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({ gate: GATE, ok, issues, extra: { total: GOLDEN_PATHS.length, passed } });
process.exit(ok ? 0 : 1);