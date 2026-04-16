#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Governance Runner
// Aggregates all 4 service-layer governance checks plus the
// authority/duplicate/deprecation registry sanity test.
//
//   1. check-service-layer-boundaries
//   2. check-service-authority-unique
//   3. check-wrapper-purity
//   4. check-projection-purity
//
// Emits generated/service-authority-report.json on success.
// ═══════════════════════════════════════════════════════════════

import { spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import {
  SERVICE_AUTHORITY_MAP,
  SERVICE_AUTHORITY_SUMMARY,
} from "../../src/lib/migration/service-authority-map";
import {
  DUPLICATE_SERVICE_MAP,
  DUPLICATE_FAMILY_SUMMARY,
} from "../../src/lib/migration/duplicate-service-map";
import {
  DEPRECATION_MAP,
  DEPRECATION_SUMMARY,
} from "../../src/lib/migration/deprecation-map";

const checks = [
  "scripts/architecture/checks/check-service-layer-boundaries.ts",
  "scripts/architecture/checks/check-service-authority-unique.ts",
  "scripts/architecture/checks/check-wrapper-purity.ts",
  "scripts/architecture/checks/check-projection-purity.ts",
];

console.log("🛡️  SITA OS — Service Governance");
console.log(`   Authority map: ${SERVICE_AUTHORITY_SUMMARY.totalEntries} entries`);
console.log(`   Duplicate families: ${DUPLICATE_FAMILY_SUMMARY.totalFamilies}`);
console.log(`   Wrappers tracked: ${DEPRECATION_SUMMARY.total}`);
console.log("");

const results: Array<{ check: string; ok: boolean; code: number }> = [];

for (const check of checks) {
  console.log(`▶ ${path.basename(check)}`);
  const r = spawnSync("npx", ["tsx", check], { stdio: "inherit" });
  results.push({ check, ok: r.status === 0, code: r.status ?? -1 });
  console.log("");
}

// ── Emit machine-readable report ───────────────────────────────
const outDir = "generated";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const report = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  authoritySummary: SERVICE_AUTHORITY_SUMMARY,
  duplicateSummary: DUPLICATE_FAMILY_SUMMARY,
  deprecationSummary: DEPRECATION_SUMMARY,
  authorityMap: SERVICE_AUTHORITY_MAP,
  duplicateMap: DUPLICATE_SERVICE_MAP,
  deprecationMap: DEPRECATION_MAP,
  governanceResults: results.map(r => ({
    check: path.basename(r.check),
    status: r.ok ? "PASS" : "FAIL",
    exitCode: r.code,
  })),
};

fs.writeFileSync(
  path.join(outDir, "service-authority-report.json"),
  JSON.stringify(report, null, 2) + "\n",
);

console.log("");
console.log("═══════════════════════════════════════════════════════════════");
const passed = results.filter(r => r.ok).length;
console.log(`📊 Service Governance: ${passed}/${results.length} checks PASSED`);
console.log(`📄 Report: generated/service-authority-report.json`);
console.log("═══════════════════════════════════════════════════════════════");

if (passed < results.length) process.exit(1);
