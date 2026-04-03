#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Usage Checker
// Ensures admin/control pages use useOSRuntime
// ═══════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from "fs";

// Admin pages that MUST use useOSRuntime
const REQUIRED_PAGES = [
  "src/pages/OwnerCenter.tsx",
  "src/pages/mission-control/MissionControlPage.tsx",
  "src/pages/ObservabilityPage.tsx",
  "src/pages/WorkflowReplayHub.tsx",
  "src/pages/EnterpriseMaturityDashboard.tsx",
  "src/pages/Boardroom.tsx",
  "src/pages/AIEconomicsPage.tsx",
  "src/pages/DigitalTwinsPage.tsx",
  "src/pages/ScenarioLabPage.tsx",
  "src/pages/IntegrationConcierge.tsx",
  "src/pages/RecoveredValuePage.tsx",
  "src/pages/SystemStatus.tsx",
];

const violations: string[] = [];

for (const page of REQUIRED_PAGES) {
  if (!existsSync(page)) continue;
  const content = readFileSync(page, "utf-8");
  if (!content.includes("useOSRuntime")) {
    violations.push(page);
  }
}

if (violations.length > 0) {
  console.error(`❌ ${violations.length} admin page(s) missing useOSRuntime:`);
  for (const v of violations) console.error(`   ${v}`);
  process.exit(1);
} else {
  console.log(`✅ All ${REQUIRED_PAGES.length} admin pages use useOSRuntime`);
}
