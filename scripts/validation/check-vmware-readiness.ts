#!/usr/bin/env node
// SITA OS — VMware Deployment Readiness Check
import * as fs from "fs";
import { ViolationCollector, readJsonSafe } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const VMWARE_ARTIFACTS = [
  "generated/vmware-appliance/production/catalog.json",
  "generated/vmware-appliance/production/manifest.mf",
  "generated/vmware-appliance/production/ovf/sita-os-production.ovf",
  "generated/vmware-appliance/production/boot/bootstrap.sh",
];
let present = 0;
for (const artifact of VMWARE_ARTIFACTS) {
  if (fs.existsSync(artifact)) { present++; }
  else { vc.add(artifact, "missing-vmware-artifact", `VMware artifact not found`, "warning"); }
}
// Check deliverable
const deliverableCatalog = readJsonSafe<any>("generated/vmware-deliverable/production/catalog.json");
if (deliverableCatalog) {
  console.log(`  📦 Production deliverable catalog present`);
  present++;
} else {
  vc.add("generated/vmware-deliverable/production/catalog.json", "no-deliverable", "Production deliverable catalog not found", "warning");
}
console.log(`  🖥️ ${present}/${VMWARE_ARTIFACTS.length + 1} VMware artifacts present`);
vc.report("check-vmware-readiness");
vc.exitIfErrors();
