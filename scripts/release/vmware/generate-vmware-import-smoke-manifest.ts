#!/usr/bin/env node
// SITA OS — VMware Import Smoke Manifest
import * as fs from "fs";
import { writeJsonOutput, envelope } from "../architecture/lib/utils";

const TIERS = ["pilot", "production"];
const checks = [];

for (const tier of TIERS) {
  const catalogPath = `generated/vmware-appliance/${tier}/catalog.json`;
  const ovfPath = `generated/vmware-appliance/${tier}/ovf/sita-os-${tier}.ovf`;
  const bootstrapPath = `generated/vmware-appliance/${tier}/boot/bootstrap.sh`;

  checks.push({
    tier,
    catalog: fs.existsSync(catalogPath),
    ovf: fs.existsSync(ovfPath),
    bootstrap: fs.existsSync(bootstrapPath),
    ready: fs.existsSync(catalogPath) && fs.existsSync(ovfPath) && fs.existsSync(bootstrapPath),
  });
}

writeJsonOutput("generated/vmware-import-smoke-manifest.json", envelope("1.0.0", { checks }));
console.log("✅ VMware import smoke manifest generated");
