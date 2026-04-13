#!/usr/bin/env node
// SITA OS — Final Delivery Conformance Check (all 52 artifacts)
import * as fs from "fs";
import { ViolationCollector, readJsonSafe } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const REQUIRED_ARTIFACTS = [
  "generated/service-manifest.json", "generated/route-manifest.json", "generated/capability-index.json",
  "generated/validation-summary.json", "generated/architecture-compliance-report.json",
  "generated/security-review-manifest.json", "generated/ownership-manifest.json",
  "generated/launch-tier-index.json", "generated/maturity-thresholds.json",
  "generated/operational-scorecards.json", "generated/operational-metrics-snapshot.json",
  "generated/contract-manifest.json", "generated/capability-family-index.json",
  "generated/runtime-conformance-manifest.json", "generated/release-gate-thresholds.json",
  "generated/surface-performance-budget.json", "generated/accessibility-summary.json",
  "generated/visual-regression-baseline.json", "generated/connector-catalog.json",
  "generated/prompt-index.json", "generated/advisor-registry.json",
  "generated/internal-agent-registry.json", "generated/formula-registry.json",
  "generated/outcome-index.json", "generated/subject-manifest.json",
  "generated/startup-order.json", "generated/feature-integration-index.json",
  "generated/boardroom-template-index.json",
  "generated/capability-event-matrix.json", "generated/capability-owner-map.json",
  "generated/capability-policy-matrix.json", "generated/capability-receipt-matrix.json",
  "generated/capability-surface-matrix.json", "generated/capability-quality-metric.json",
  "generated/shell-space-registry.json", "generated/subscription-replacement-matrix.json",
  "generated/runtime-ports.json", "generated/service-consolidation-manifest.json",
  "generated/admin-support-visibility-manifest.json",
  // Extended artifacts
  "generated/base-os-manifest.json", "generated/boot-chain-manifest.json",
  "generated/first-boot-contract-manifest.json", "generated/first-boot-proof-receipts.json",
  "generated/integration-map.json", "generated/kernel-architecture-manifest.json",
  "generated/lifecycle-authority-manifest.json", "generated/recovery-outcome-manifest.json",
  "generated/rendering-pipeline-manifest.json", "generated/route-tier-manifest.json",
  "generated/security-model-manifest.json", "generated/syscall-manifest.json",
  "generated/userspace-services-manifest.json",
];
let present = 0;
for (const artifact of REQUIRED_ARTIFACTS) {
  if (fs.existsSync(artifact)) {
    const data = readJsonSafe(artifact);
    if (data) { present++; } else { vc.add(artifact, "invalid-json", "Artifact exists but is not valid JSON"); }
  } else {
    vc.add(artifact, "missing-artifact", `Required delivery artifact not found`);
  }
}
console.log(`  📦 ${present}/${REQUIRED_ARTIFACTS.length} delivery artifacts present and valid`);
vc.report("check-final-delivery-conformance");
vc.exitIfErrors();
