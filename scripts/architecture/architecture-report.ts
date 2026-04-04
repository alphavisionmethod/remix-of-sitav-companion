#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Report Generator
// Aggregates all architecture checks into a single JSON report
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { writeJsonOutput, envelope } from "./lib/utils";

const ARCH_CHECKS = [
  "scripts/architecture/boundary-check.ts",
  "scripts/architecture/check-advisor-registry.ts",
  "scripts/architecture/check-capability-families.ts",
  "scripts/architecture/check-connector-catalog.ts",
  "scripts/architecture/check-contract-family-completeness.ts",
  "scripts/architecture/check-contract-registry.ts",
  "scripts/architecture/check-event-catalog.ts",
  "scripts/architecture/check-event-receipt-linkage.ts",
  "scripts/architecture/check-module-count.ts",
  "scripts/architecture/check-outbound-communication-policy.ts",
  "scripts/architecture/check-policy-coverage.ts",
  "scripts/architecture/check-proof-coverage.ts",
  "scripts/architecture/check-sensitive-document-privacy.ts",
  "scripts/architecture/check-service-sprawl.ts",
  "scripts/architecture/check-status-truth-tags.ts",
  "scripts/architecture/check-surface-ownership.ts",
  "scripts/architecture/check-workflow-state-usage.ts",
];

interface CheckResult {
  script: string;
  passed: boolean;
  duration_ms: number;
  error?: string;
}

const results: CheckResult[] = [];
let totalPassed = 0;

console.log("📊 Generating Architecture Compliance Report...\n");

for (const script of ARCH_CHECKS) {
  if (!fs.existsSync(script)) {
    results.push({ script, passed: false, duration_ms: 0, error: "File not found" });
    continue;
  }
  const start = Date.now();
  try {
    execSync(`npx tsx ${script}`, { stdio: "pipe", timeout: 30000 });
    results.push({ script, passed: true, duration_ms: Date.now() - start });
    totalPassed++;
  } catch (e: any) {
    results.push({
      script,
      passed: false,
      duration_ms: Date.now() - start,
      error: e.stderr?.toString().slice(0, 200) || "Check failed",
    });
  }
}

const report = envelope("1.0.0", {
  summary: {
    total: ARCH_CHECKS.length,
    passed: totalPassed,
    failed: ARCH_CHECKS.length - totalPassed,
    score: Math.round((totalPassed / ARCH_CHECKS.length) * 100),
  },
  checks: results,
});

writeJsonOutput("generated/architecture-compliance-report.json", report);
console.log(`\n✅ Architecture report: ${totalPassed}/${ARCH_CHECKS.length} checks passed (${report.summary.score}%)`);
