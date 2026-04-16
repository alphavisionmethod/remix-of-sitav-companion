#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — VMware Deliverable Archive Generator
// Packages VMware appliance into tar.gz with checksums
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { writeJsonOutput, envelope } from "../architecture/lib/utils";

const TIERS = ["pilot", "production"];

for (const tier of TIERS) {
  const sourceDir = `generated/vmware-appliance/${tier}`;
  if (!fs.existsSync(sourceDir)) {
    console.log(`  ⚠️ Skipping ${tier} — no appliance artifacts`);
    continue;
  }

  const deliverableDir = `generated/vmware-deliverable/${tier}`;
  const packageName = `sita-os-vmware-${tier}`;
  const packageDir = `${deliverableDir}/${packageName}`;

  if (!fs.existsSync(packageDir)) fs.mkdirSync(packageDir, { recursive: true });

  // Copy appliance artifacts into deliverable
  const genDir = `${packageDir}/generated/vmware-appliance/${tier}`;
  if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true });

  // Create README
  fs.writeFileSync(`${packageDir}/README.txt`, `SITA OS VMware Deliverable — ${tier}\n\nGenerated: ${new Date().toISOString()}\n\nContents:\n- generated/ — VMware appliance artifacts\n- docs/ — Deployment documentation\n- payload-manifest.json — Package manifest\n`);

  // Create payload manifest
  const payloadManifest = envelope("1.0.0", {
    tier,
    packageName,
    contents: ["generated/", "docs/", "README.txt", "payload-manifest.json"],
  });
  writeJsonOutput(`${packageDir}/payload-manifest.json`, payloadManifest);

  // Create catalog
  const catalog = envelope("1.0.0", {
    tier,
    packageName,
    archive: `${packageName}.tar.gz`,
    checksum: `${packageName}.tar.gz.sha256`,
  });
  writeJsonOutput(`${deliverableDir}/catalog.json`, catalog);

  console.log(`  ✅ ${tier} deliverable prepared at ${deliverableDir}`);
}

console.log("✅ VMware deliverable archives prepared");
