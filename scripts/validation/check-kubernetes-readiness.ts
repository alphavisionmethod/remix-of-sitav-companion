#!/usr/bin/env node
// SITA OS — Kubernetes Readiness Check
import * as fs from "fs";
import { ViolationCollector } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const K8S_DIRS = ["infra/kubernetes", "infra/k8s", "k8s", "deploy/k8s"];
let foundDir: string | null = null;
for (const dir of K8S_DIRS) { if (fs.existsSync(dir)) { foundDir = dir; break; } }
if (!foundDir) {
  console.log("⚠️ No Kubernetes manifests directory found — skipping");
  process.exit(0);
}
const REQUIRED = ["deployment.yaml", "service.yaml", "configmap.yaml"];
for (const file of REQUIRED) {
  const fullPath = `${foundDir}/${file}`;
  if (!fs.existsSync(fullPath)) {
    vc.add(foundDir, "missing-manifest", `Required K8s manifest not found: ${file}`, "warning");
  }
}
vc.report("check-kubernetes-readiness");
vc.exitIfErrors();
