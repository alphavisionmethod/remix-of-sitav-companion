#!/usr/bin/env node
// SITA OS — VMware Supply Chain Index
import * as fs from "fs";
import { readJsonSafe, writeJsonOutput, envelope } from "../architecture/lib/utils";

const index = envelope("1.0.0", {
  tiers: ["pilot", "production"],
  artifacts: {
    appliance: { pilot: fs.existsSync("generated/vmware-appliance/pilot/catalog.json"), production: fs.existsSync("generated/vmware-appliance/production/catalog.json") },
    deliverable: { pilot: fs.existsSync("generated/vmware-deliverable/pilot/catalog.json"), production: fs.existsSync("generated/vmware-deliverable/production/catalog.json") },
    releaseBundle: { pilot: fs.existsSync("generated/vmware-release-bundle/vmware-release-bundle-pilot.json"), production: fs.existsSync("generated/vmware-release-bundle/vmware-release-bundle-production.json") },
    supplyChain: fs.existsSync("generated/vmware-supply-chain/vmware-supply-chain-artifacts.json"),
    trivy: fs.existsSync("generated/trivy-reports/index.json"),
  },
});

writeJsonOutput("generated/vmware-supply-chain-index.json", index);
console.log("✅ VMware supply chain index generated");
