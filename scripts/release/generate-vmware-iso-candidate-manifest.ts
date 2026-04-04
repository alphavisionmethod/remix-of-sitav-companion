#!/usr/bin/env node
// SITA OS — VMware ISO Candidate Manifest
import * as fs from "fs";
import { writeJsonOutput, envelope } from "../architecture/lib/utils";

const candidates = [];
const TIERS = ["pilot", "production"];

for (const tier of TIERS) {
  const isoDir = `generated/iso-probe`;
  const isoInteropDir = `generated/iso-probe-interop`;
  candidates.push({
    tier,
    isoProbe: fs.existsSync(`${isoDir}/probe.iso`),
    isoInterop: fs.existsSync(`${isoInteropDir}/probe.iso`),
    status: "candidate",
  });
}

writeJsonOutput("generated/vmware-iso-candidate-manifest.json", envelope("1.0.0", { candidates }));
console.log("✅ VMware ISO candidate manifest generated");
