#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Deployment Unit Map Check
// Validates deployment-unit registry completeness
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

const unitRegistry = "src/lib/deployment/deployment-unit-registry.ts";
if (!fs.existsSync(unitRegistry)) {
  vc.add(unitRegistry, "missing-registry", "Deployment unit registry not found", "warning");
} else {
  const content = fs.readFileSync(unitRegistry, "utf-8");
  const unitCount = (content.match(/unitId|deploymentUnit/g) || []).length;
  console.log(`  📦 ~${unitCount} deployment unit references`);

  const requiredUnits = ["web", "edge-functions", "database"];
  for (const unit of requiredUnits) {
    if (!content.toLowerCase().includes(unit.replace("-", ""))) {
      vc.add(unitRegistry, "missing-unit", `Deployment unit "${unit}" not found`, "warning");
    }
  }
}

vc.report("check-deployment-unit-map");
vc.exitIfErrors();
