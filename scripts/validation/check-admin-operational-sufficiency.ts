#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Operational Sufficiency Check (Layer 8)
// Verifies admin can support users without dev intervention
// ═══════════════════════════════════════════════════════════════

import { existsSync } from "fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "admin-operational-sufficiency";
const issues: GateIssue[] = [];

const REQUIRED_CAPABILITIES: Array<{ name: string; evidence: string[] }> = [
  { name: "User Management UI", evidence: ["src/pages/admin/UserManagement.tsx", "src/pages/admin/AdminUsersPage.tsx"] },
  { name: "Kill Switch Center", evidence: ["src/pages/admin/AR08KillSwitchCenter.tsx"] },
  { name: "Connector Health Board", evidence: ["src/pages/admin/CN05ConnectorHealthBoard.tsx"] },
  { name: "Alert Dashboard", evidence: ["src/pages/admin/AlertsDashboard.tsx"] },
  { name: "Incident Dashboard", evidence: ["src/pages/admin/IncidentDashboardPage.tsx"] },
  { name: "SLA Monitoring", evidence: ["src/pages/admin/SLAMonitoringDashboard.tsx"] },
  { name: "Reset User Setup", evidence: ["supabase/functions/admin-reset-user-setup/index.ts"] },
  { name: "Revoke Session", evidence: ["supabase/functions/admin-revoke-session/index.ts"] },
  { name: "Webhook Replay", evidence: ["supabase/functions/webhook-replay/index.ts"] },
  { name: "Workflow Repair", evidence: ["supabase/functions/workflow-repair/index.ts"] },
  { name: "Support Bundle", evidence: ["supabase/functions/generate-support-bundle/index.ts"] },
  { name: "Recovery Center", evidence: ["src/pages/admin/RecoveryCenter.tsx", "src/pages/admin/AdminRecoveryCenter.tsx"] },
  { name: "Chaos Drill Runner", evidence: ["supabase/functions/chaos-drill-runner/index.ts"] },
  { name: "DR Drill System", evidence: ["supabase/functions/dr-drill-runner/index.ts", "supabase/functions/dr-drill-executor/index.ts"] },
];

let present = 0;

for (const cap of REQUIRED_CAPABILITIES) {
  const found = cap.evidence.some(e => existsSync(e));
  if (found) {
    present++;
  } else {
    issues.push({ severity: "warning", area: cap.name, message: `Not found: ${cap.evidence.join(" or ")}` });
  }
}

const ok = true; // warn-tier
console.log(`${present === REQUIRED_CAPABILITIES.length ? "✅" : "⚠"} ${GATE}: ${present}/${REQUIRED_CAPABILITIES.length} admin capabilities present`);
issues.forEach(i => console.error(`  [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({ gate: GATE, ok, issues, extra: { total: REQUIRED_CAPABILITIES.length, present } });
process.exit(0);