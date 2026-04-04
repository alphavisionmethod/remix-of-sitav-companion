#!/usr/bin/env node
// SITA OS — VMware Supply Chain Artifacts Generator
import * as fs from "fs";
import * as crypto from "crypto";
import { scanDir, readFileContent, writeJsonOutput, envelope } from "../architecture/lib/utils";

const supplyChainDir = "generated/vmware-supply-chain";
if (!fs.existsSync(supplyChainDir)) fs.mkdirSync(supplyChainDir, { recursive: true });

// Scan all VMware-related artifacts
const vmwareFiles = [
  ...scanDir("generated/vmware-appliance", [".json", ".yaml", ".yml", ".sh", ".ovf", ".mf"]),
  ...scanDir("generated/vmware-deliverable", [".json", ".yaml", ".yml"]),
];

const artifacts: Array<{ path: string; size: number; sha256: string }> = [];

for (const file of vmwareFiles) {
  try {
    const stat = fs.statSync(file);
    const content = fs.readFileSync(file);
    const hash = crypto.createHash("sha256").update(content).digest("hex");
    artifacts.push({ path: file, size: stat.size, sha256: hash });
  } catch { /* skip binary/unreadable */ }
}

const output = envelope("1.0.0", {
  totalArtifacts: artifacts.length,
  totalSizeBytes: artifacts.reduce((s, a) => s + a.size, 0),
  artifacts,
});

writeJsonOutput(`${supplyChainDir}/vmware-supply-chain-artifacts.json`, output);
console.log(`✅ Supply chain: ${artifacts.length} artifacts cataloged`);
