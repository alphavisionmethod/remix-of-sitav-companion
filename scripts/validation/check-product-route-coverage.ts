#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Product Route Coverage Validator
// Asserts every product surface has routes for all required domains
// ═══════════════════════════════════════════════════════════════

import { existsSync } from "fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "product-route-coverage";
const issues: GateIssue[] = [];

const REQUIRED_ROUTES: Record<string, string[]> = {
  "sita-os-desktop": [
    "src/pages/business", "src/pages/finance", "src/pages/concierge",
    "src/pages/boardroom", "src/pages/files", "src/pages/settings",
    "src/pages/investment", "src/pages/advisor",
  ],
  "sita-mobile-app": [
    "src/pages/mobile/MobileHome.tsx", "src/pages/mobile/MobileBusiness.tsx",
    "src/pages/mobile/MobileMoney.tsx", "src/pages/mobile/MobileConcierge.tsx",
    "src/pages/mobile/MobileBoardroom.tsx", "src/pages/mobile/MobileFiles.tsx",
    "src/pages/mobile/MobileSettings.tsx", "src/pages/mobile/MobileInvestment.tsx",
    "src/pages/mobile/MobileApprovals.tsx", "src/pages/mobile/MobileAlerts.tsx",
  ],
  "sita-admin-backend": [
    "src/pages/admin",
  ],
};

let total = 0;
let covered = 0;

for (const [surface, paths] of Object.entries(REQUIRED_ROUTES)) {
  for (const p of paths) {
    total++;
    if (existsSync(p)) {
      covered++;
    } else {
      issues.push({ severity: "error", area: surface, message: `Missing: ${p}` });
    }
  }
}

const ok = issues.filter(i => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${covered}/${total} required routes present`);
issues.slice(0, 5).forEach(i => console.error(`  [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({ gate: GATE, ok, issues, extra: { total, covered } });
process.exit(ok ? 0 : 1);