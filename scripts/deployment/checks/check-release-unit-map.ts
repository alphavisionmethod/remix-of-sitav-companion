#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Unit Map Check
// Validates release packaging for all target platforms
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

const releaseTargets = [
  { name: "desktop", scripts: ["scripts/release/build-electron.sh"] },
  { name: "appliance", scripts: ["scripts/release/build-iso.sh"] },
  { name: "vmware", scripts: ["scripts/release/build-ova.sh"] },
];

for (const target of releaseTargets) {
  const found = target.scripts.filter(s => fs.existsSync(s)).length;
  if (found > 0) {
    console.log(`  📦 ${target.name}: ${found} build scripts`);
  } else {
    vc.add(`scripts/release/${target.name}`, "missing-build-scripts", `No build scripts for ${target.name}`, "warning");
  }
}

vc.report("check-release-unit-map");
vc.exitIfErrors();
