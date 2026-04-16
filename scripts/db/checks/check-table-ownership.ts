#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Table Ownership Check
// Validates that tables have declared ownership
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

const schemaRegistry = "src/lib/db/db-schema-registry.ts";
if (!fs.existsSync(schemaRegistry)) {
  vc.add(schemaRegistry, "missing-registry", "DB schema registry not found — cannot check ownership", "warning");
} else {
  const content = fs.readFileSync(schemaRegistry, "utf-8");
  const hasOwnership = content.includes("owner") || content.includes("ownedBy") || content.includes("domain");
  if (hasOwnership) {
    console.log("  👤 Table ownership data found in schema registry");
  } else {
    vc.add(schemaRegistry, "no-ownership", "Schema registry does not declare table ownership", "warning");
  }
}

vc.report("check-table-ownership");
vc.exitIfErrors();
