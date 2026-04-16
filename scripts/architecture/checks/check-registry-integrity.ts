#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Registry Integrity Check (Phase 7 Meta-Arch CI Gate)
// Validates that every cross-link between Bounded Contexts (P1),
// Kill Switches (P4), Runbooks (P5), and Golden Paths (P6)
// resolves to a real entry. Single source: validateRegistryIntegrity.
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../lib/utils";
import { validateRegistryIntegrity } from "../../../src/lib/meta-arch/registry-integrity";

const vc = new ViolationCollector();
const report = validateRegistryIntegrity();

for (const issue of report.issues) {
  vc.add(
    `${issue.registry}/${issue.subject}`,
    `cross-link/${issue.registry}`,
    issue.message,
    issue.severity,
  );
}

console.log(
  `🔎 Phase 7 registry integrity — ${report.contextCount} contexts · ${report.killSwitchCount} kill switches · ${report.runbookCount} runbooks · ${report.goldenPathCount} golden paths`
);
console.log(
  `   ${report.errorCount} errors · ${report.warningCount} warnings`
);

vc.report("check-registry-integrity");
vc.exitIfErrors();
