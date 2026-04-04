#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Launch Truth Audit
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { readJsonSafe, writeJsonOutput, envelope } from "../architecture/lib/utils";

const AUDIT_GATES = [
  { file: "generated/service-manifest.json", name: "Service Manifest", required: true },
  { file: "generated/route-manifest.json", name: "Route Manifest", required: true },
  { file: "generated/capability-index.json", name: "Capability Index", required: true },
  { file: "generated/architecture-compliance-report.json", name: "Architecture Compliance", required: true },
  { file: "generated/security-review-manifest.json", name: "Security Review", required: true },
  { file: "generated/validation-summary.json", name: "Validation Summary", required: true },
  { file: "generated/launch-tier-index.json", name: "Launch Tier Index", required: true },
  { file: "generated/maturity-thresholds.json", name: "Maturity Thresholds", required: false },
  { file: "generated/ownership-manifest.json", name: "Ownership Manifest", required: false },
  { file: "generated/operational-scorecards.json", name: "Operational Scorecards", required: false },
];

const results = AUDIT_GATES.map(gate => ({
  name: gate.name,
  file: gate.file,
  required: gate.required,
  exists: fs.existsSync(gate.file),
  valid: !!readJsonSafe(gate.file),
}));

const passed = results.filter(r => r.valid);
const failedRequired = results.filter(r => r.required && !r.valid);

const audit = envelope("1.0.0", {
  summary: {
    total: results.length,
    passed: passed.length,
    failed: results.length - passed.length,
    requiredFailed: failedRequired.length,
    launchReady: failedRequired.length === 0,
  },
  gates: results,
});

writeJsonOutput("generated/launch-truth-audit.json", audit);

console.log(`📋 Launch Truth Audit: ${passed.length}/${results.length} gates passed`);
if (failedRequired.length > 0) {
  console.log(`❌ ${failedRequired.length} required gates failed — NOT launch ready`);
  for (const f of failedRequired) console.log(`   ❌ ${f.name}`);
} else {
  console.log("✅ All required gates passed — launch ready");
}
