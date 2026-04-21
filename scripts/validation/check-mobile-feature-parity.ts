#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Feature Parity Check
// Ensures mobile app has pages for all core OS domains and uses real data
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync } from "fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "mobile-feature-parity";
const issues: GateIssue[] = [];

const PARITY_MAP: Array<{ domain: string; mobilePage: string; requiredPatterns: string[] }> = [
  { domain: "Business", mobilePage: "src/pages/mobile/MobileBusiness.tsx", requiredPatterns: ["supabase", "useQuery", "from("] },
  { domain: "Finance", mobilePage: "src/pages/mobile/MobileMoney.tsx", requiredPatterns: ["supabase", "useQuery", "from("] },
  { domain: "Concierge", mobilePage: "src/pages/mobile/MobileConcierge.tsx", requiredPatterns: ["supabase", "useQuery", "from("] },
  { domain: "Investment", mobilePage: "src/pages/mobile/MobileInvestment.tsx", requiredPatterns: ["supabase", "useQuery", "from("] },
  { domain: "Boardroom", mobilePage: "src/pages/mobile/MobileBoardroom.tsx", requiredPatterns: ["supabase", "useQuery", "from("] },
  { domain: "Files", mobilePage: "src/pages/mobile/MobileFiles.tsx", requiredPatterns: ["supabase", "useQuery", "from("] },
  { domain: "Approvals", mobilePage: "src/pages/mobile/MobileApprovals.tsx", requiredPatterns: ["supabase", "useQuery", "from("] },
  { domain: "Alerts", mobilePage: "src/pages/mobile/MobileAlerts.tsx", requiredPatterns: ["supabase", "useQuery", "from("] },
  { domain: "Settings", mobilePage: "src/pages/mobile/MobileSettings.tsx", requiredPatterns: ["supabase", "useQuery", "from("] },
];

let present = 0;
let wired = 0;

for (const entry of PARITY_MAP) {
  if (!existsSync(entry.mobilePage)) {
    issues.push({ severity: "error", area: entry.domain, message: `Missing mobile page: ${entry.mobilePage}` });
    continue;
  }
  present++;

  const content = readFileSync(entry.mobilePage, "utf-8");
  const hasRealData = entry.requiredPatterns.some(p => content.includes(p));

  if (!hasRealData) {
    issues.push({ severity: "warning", area: entry.domain, message: `${entry.mobilePage} appears to use hardcoded data (no supabase/useQuery found)` });
  } else {
    wired++;
  }
}

const ok = issues.filter(i => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${present}/${PARITY_MAP.length} pages present, ${wired} wired to real data`);
issues.forEach(i => console.error(`  [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({ gate: GATE, ok, issues, extra: { total: PARITY_MAP.length, present, wired } });
process.exit(ok ? 0 : 1);