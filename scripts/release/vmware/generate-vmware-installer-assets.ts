#!/usr/bin/env node
// SITA OS — VMware Installer Assets Generator
import * as fs from "fs";
import { writeJsonOutput, envelope } from "../architecture/lib/utils";

const TIERS = ["pilot", "production"];
for (const tier of TIERS) {
  const dir = `generated/vmware-appliance/${tier}`;
  if (!fs.existsSync(dir)) continue;

  // Ensure bootstrap is executable-ready
  const bootstrapPath = `${dir}/boot/bootstrap.sh`;
  if (fs.existsSync(bootstrapPath)) {
    const content = fs.readFileSync(bootstrapPath, "utf-8");
    if (!content.startsWith("#!/")) {
      fs.writeFileSync(bootstrapPath, `#!/bin/sh\n${content}`);
    }
  }
}
console.log("✅ VMware installer assets verified");
