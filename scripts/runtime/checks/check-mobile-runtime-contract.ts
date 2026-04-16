#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Runtime Contract Check
// Validates mobile runtime requirements and split architecture
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

// Check mobile routes exist
const mobileRoutes = scanDir("src/pages/mobile", [".tsx", ".ts"]);
if (mobileRoutes.length === 0) {
  vc.add("src/pages/mobile", "no-mobile-pages", "No mobile pages found", "warning");
} else {
  console.log(`  📱 ${mobileRoutes.length} mobile pages found`);
}

// Check mobile route hub exists
const mobileRouteFiles = [
  "src/routes/MobileRoutes.tsx",
  "src/routes/mobile-routes.tsx",
];
const hasRouteHub = mobileRouteFiles.some(f => fs.existsSync(f));
if (!hasRouteHub) {
  vc.add("src/routes/", "no-mobile-route-hub", "No mobile route hub found", "warning");
} else {
  console.log("  🛤️ Mobile route hub found");
}

// Check viewport redirect logic exists
const appFile = "src/App.tsx";
if (fs.existsSync(appFile)) {
  const content = fs.readFileSync(appFile, "utf-8");
  if (content.includes("mobile") || content.includes("viewport") || content.includes("768")) {
    console.log("  📐 Mobile viewport handling detected in App.tsx");
  } else {
    vc.add(appFile, "no-mobile-redirect", "No mobile viewport redirect logic detected", "warning");
  }
}

// Check runtime capability matrix references mobile
const matrixPath = "src/lib/runtime/runtime-capability-matrix.ts";
if (fs.existsSync(matrixPath)) {
  const content = fs.readFileSync(matrixPath, "utf-8");
  if (!content.includes("mobile")) {
    vc.add(matrixPath, "no-mobile-in-matrix", "Mobile runtime not referenced in capability matrix", "warning");
  }
}

vc.report("check-mobile-runtime-contract");
vc.exitIfErrors();
