#!/usr/bin/env node
// SITA OS — Terraform/VMware Readiness Check
import * as fs from "fs";
import { ViolationCollector } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const TF_DIRS = ["infra/terraform", "terraform", "deploy/terraform"];
let tfDir: string | null = null;
for (const dir of TF_DIRS) { if (fs.existsSync(dir)) { tfDir = dir; break; } }
if (!tfDir) { console.log("⚠️ No Terraform directory found — skipping"); process.exit(0); }
const REQUIRED = ["main.tf", "variables.tf", "outputs.tf"];
for (const file of REQUIRED) {
  if (!fs.existsSync(`${tfDir}/${file}`)) {
    vc.add(tfDir, "missing-tf", `Required Terraform file not found: ${file}`, "warning");
  }
}
vc.report("check-terraform-vmware-readiness");
vc.exitIfErrors();
