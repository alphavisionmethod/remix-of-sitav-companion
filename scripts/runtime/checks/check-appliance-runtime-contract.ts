#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Appliance Runtime Contract Check
// Validates appliance/ISO runtime requirements
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

// Check ISO build infrastructure
const isoFiles = [
  "scripts/release/build-iso.sh",
  "scripts/release/iso/autoinstall/user-data",
  "scripts/release/iso/sita-os.service",
];
let found = 0;
for (const f of isoFiles) {
  if (fs.existsSync(f)) found++;
}
console.log(`  💿 ${found}/${isoFiles.length} ISO/appliance artifacts found`);

if (found === 0) {
  vc.add("scripts/release/", "no-appliance-infra", "No appliance/ISO build infrastructure found", "warning");
}

// Check OVA build infrastructure
const ovaFiles = [
  "scripts/release/build-ova.sh",
  "scripts/release/templates/sita-os.ovf.template",
];
let ovaFound = 0;
for (const f of ovaFiles) {
  if (fs.existsSync(f)) ovaFound++;
}
console.log(`  📀 ${ovaFound}/${ovaFiles.length} OVA/VMware artifacts found`);

// Check runtime capability matrix references appliance
const matrixPath = "src/lib/runtime/runtime-capability-matrix.ts";
if (fs.existsSync(matrixPath)) {
  const content = fs.readFileSync(matrixPath, "utf-8");
  if (!content.includes("appliance")) {
    vc.add(matrixPath, "no-appliance-in-matrix", "Appliance runtime not referenced in capability matrix", "warning");
  }
}

vc.report("check-appliance-runtime-contract");
vc.exitIfErrors();
