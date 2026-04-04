#!/usr/bin/env node
// SITA OS — Final Delivery Conformance Check
import * as fs from "fs";
import { ViolationCollector, readJsonSafe } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const REQUIRED_ARTIFACTS = [
  "generated/service-manifest.json", "generated/route-manifest.json", "generated/capability-index.json",
  "generated/validation-summary.json", "generated/architecture-compliance-report.json",
  "generated/security-review-manifest.json", "generated/ownership-manifest.json",
  "generated/launch-tier-index.json", "generated/maturity-thresholds.json",
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
