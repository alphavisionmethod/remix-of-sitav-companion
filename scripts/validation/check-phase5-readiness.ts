#!/usr/bin/env node
// SITA OS — Phase 5 Readiness Gate
import * as fs from "fs";
import { ViolationCollector, readJsonSafe } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const PHASE5_GATES = [
  { file: "generated/capability-quality-metric.json", minScore: 30, desc: "Quality metrics" },
  { file: "generated/architecture-compliance-report.json", desc: "Architecture compliance" },
  { file: "generated/validation-summary.json", desc: "Validation summary" },
  { file: "generated/feature-integration-index.json", desc: "Feature integration" },
  { file: "generated/ownership-manifest.json", desc: "Ownership manifest" },
];
let passed = 0;
for (const gate of PHASE5_GATES) {
  if (!fs.existsSync(gate.file)) { vc.add(gate.file, "missing-gate", `${gate.desc} not found`); continue; }
  const data = readJsonSafe(gate.file);
  if (!data) { vc.add(gate.file, "invalid-gate", `${gate.desc} is invalid JSON`); continue; }
  passed++;
  console.log(`  ✅ ${gate.desc}`);
}
console.log(`  📊 Phase 5: ${passed}/${PHASE5_GATES.length} gates passed`);
vc.report("check-phase5-readiness");
vc.exitIfErrors();
