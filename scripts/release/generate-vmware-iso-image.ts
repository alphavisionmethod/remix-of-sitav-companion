#!/usr/bin/env node
// SITA OS — VMware ISO Image Generator (stub — actual ISO creation requires mkisofs)
import * as fs from "fs";

const ISO_DIRS = ["generated/iso-probe", "generated/iso-probe-interop"];

for (const dir of ISO_DIRS) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const srcDir = `${dir}/src`;
  if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });
  if (!fs.existsSync(`${srcDir}/hello.txt`)) {
    fs.writeFileSync(`${srcDir}/hello.txt`, "SITA OS");
  }
  // ISO probe file (actual ISO generation requires mkisofs/genisoimage)
  if (!fs.existsSync(`${dir}/probe.iso`)) {
    fs.writeFileSync(`${dir}/probe.iso`, "");
  }
}
console.log("✅ ISO probe directories prepared");
