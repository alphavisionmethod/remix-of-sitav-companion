#!/usr/bin/env node
// SITA OS — Enhanced Generated Truth Validator
import * as fs from "fs";
import { ViolationCollector, readJsonSafe } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const GENERATED_FILES = [
  "generated/service-manifest.json", "generated/route-manifest.json", "generated/capability-index.json",
  "generated/prompt-index.json", "generated/connector-catalog.json", "generated/advisor-registry.json",
  "generated/internal-agent-registry.json", "generated/formula-registry.json", "generated/outcome-index.json",
  "generated/subject-manifest.json", "generated/startup-order.json", "generated/feature-integration-index.json",
  "generated/boardroom-template-index.json", "generated/capability-event-matrix.json",
  "generated/capability-owner-map.json", "generated/capability-policy-matrix.json",
  "generated/capability-receipt-matrix.json", "generated/capability-surface-matrix.json",
  "generated/capability-family-index.json", "generated/capability-quality-metric.json",
  "generated/contract-manifest.json", "generated/shell-space-registry.json",
  "generated/subscription-replacement-matrix.json", "generated/runtime-conformance-manifest.json",
  "generated/runtime-ports.json", "generated/service-consolidation-manifest.json",
  "generated/admin-support-visibility-manifest.json", "generated/operational-scorecards.json",
  "generated/operational-metrics-snapshot.json", "generated/ownership-manifest.json",
  "generated/maturity-thresholds.json", "generated/release-gate-thresholds.json",
  "generated/surface-performance-budget.json", "generated/validation-summary.json",
  "generated/accessibility-summary.json", "generated/visual-regression-baseline.json",
  "generated/architecture-compliance-report.json", "generated/security-review-manifest.json",
  "generated/launch-tier-index.json",
];
let valid = 0;
for (const file of GENERATED_FILES) {
  if (!fs.existsSync(file)) { vc.add(file, "missing", "Generated file not found"); continue; }
  const data = readJsonSafe(file);
  if (!data) { vc.add(file, "invalid-json", "File is not valid JSON"); continue; }
  if (!data.version && !data.generatedAt) { vc.add(file, "no-envelope", "Missing version/generatedAt envelope", "warning"); }
  valid++;
}
console.log(`  📊 ${valid}/${GENERATED_FILES.length} generated files valid`);
vc.report("check-generated-truth");
vc.exitIfErrors();
