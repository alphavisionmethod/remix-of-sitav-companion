#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — App Permission Enforcement Validator (Advisory)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();

const requiredFiles = [
  "src/lib/app-platform/permissions.ts",
  "src/lib/app-platform/permission-engine.ts",
  "src/lib/app-platform/app-permission-ledger.ts",
  "src/lib/app-platform/app-trust-tier-policy.ts",
];

for (const f of requiredFiles) {
  if (!fs.existsSync(f)) {
    vc.add(f, "missing-permission-file", `Permission enforcement file missing: ${f}`, "warning");
  }
}

// Check ledger has required exports
const ledgerFile = "src/lib/app-platform/app-permission-ledger.ts";
if (fs.existsSync(ledgerFile)) {
  const content = fs.readFileSync(ledgerFile, "utf-8");
  for (const fn of ["recordGrant", "recordDenial", "recordRevocation", "getHistory", "getEffectiveGrants", "exportAudit"]) {
    if (!content.includes(`export function ${fn}`)) {
      vc.add(ledgerFile, "missing-ledger-fn", `Ledger function missing: ${fn}`, "warning");
    }
  }
}

const report = {
  gate: "app-permission-enforcement",
  tier: "Advisory",
  ok: vc.errors.length === 0,
  warnings: vc.warnings.length,
  checkedAt: new Date().toISOString(),
};
writeJsonOutput("generated/app-permission-enforcement-report.json", report);

vc.report("check-app-permission-enforcement");
vc.exitIfErrors();