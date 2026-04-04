#!/usr/bin/env node
// SITA OS — Phase 4 Foundations Check
import * as fs from "fs";
import { ViolationCollector, readJsonSafe } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const PHASE4_REQUIREMENTS = [
  { file: "generated/service-manifest.json", desc: "Service manifest" },
  { file: "generated/route-manifest.json", desc: "Route manifest" },
  { file: "generated/capability-index.json", desc: "Capability index" },
  { file: "generated/contract-manifest.json", desc: "Contract manifest" },
  { file: "generated/runtime-conformance-manifest.json", desc: "Runtime conformance" },
];
let met = 0;
for (const req of PHASE4_REQUIREMENTS) {
  if (fs.existsSync(req.file)) {
    const data = readJsonSafe(req.file);
    if (data) { met++; console.log(`  ✅ ${req.desc}`); }
    else { vc.add(req.file, "invalid", `${req.desc} exists but is invalid`); }
  } else {
    vc.add(req.file, "missing", `${req.desc} not found`);
  }
}
console.log(`  📊 Phase 4: ${met}/${PHASE4_REQUIREMENTS.length} foundations met`);
vc.report("check-phase4-foundations");
vc.exitIfErrors();
