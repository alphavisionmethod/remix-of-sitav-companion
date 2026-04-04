#!/usr/bin/env node
// SITA OS — VMware Release Bundle Generator
import * as fs from "fs";
import * as crypto from "crypto";
import { writeJsonOutput, envelope } from "../architecture/lib/utils";

const TIERS = ["pilot", "production"];

for (const tier of TIERS) {
  const bundleDir = `generated/vmware-release-bundle`;
  if (!fs.existsSync(bundleDir)) fs.mkdirSync(bundleDir, { recursive: true });

  const catalogPath = `generated/vmware-appliance/${tier}/catalog.json`;
  const manifestPath = `generated/vmware-appliance/${tier}/manifest.mf`;

  const bundle = envelope("1.0.0", {
    tier,
    artifacts: {
      catalog: fs.existsSync(catalogPath),
      manifest: fs.existsSync(manifestPath),
      ovf: fs.existsSync(`generated/vmware-appliance/${tier}/ovf/sita-os-${tier}.ovf`),
    },
    checksums: {} as Record<string, string>,
  });

  // Generate checksums for key artifacts
  const filesToHash = [catalogPath, manifestPath].filter(f => fs.existsSync(f));
  for (const file of filesToHash) {
    const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    bundle.checksums[file] = hash;
  }

  writeJsonOutput(`${bundleDir}/vmware-release-bundle-${tier}.json`, bundle);

  // Write checksum file
  const checksumLines = Object.entries(bundle.checksums).map(([f, h]) => `${h}  ${f}`).join("\n");
  fs.writeFileSync(`${bundleDir}/vmware-release-bundle-${tier}.sha256`, checksumLines + "\n");

  console.log(`  ✅ ${tier} release bundle generated`);
}

console.log("✅ VMware release bundles generated");
