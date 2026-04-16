#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Tenancy Boundary Map Check
// Validates tenancy isolation patterns in the database
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

const typesFile = "src/integrations/supabase/types.ts";
if (!fs.existsSync(typesFile)) {
  vc.add(typesFile, "missing-types", "Supabase types file not found");
} else {
  const content = fs.readFileSync(typesFile, "utf-8");
  // Count tables with user_id column (tenant isolation)
  const userIdTables = (content.match(/user_id:\s*string/g) || []).length;
  // Count total Row definitions
  const totalTables = (content.match(/Row:\s*\{/g) || []).length;

  console.log(`  🏢 ${userIdTables} table definitions reference user_id`);
  console.log(`  📊 ${totalTables} total table Row definitions`);

  if (totalTables > 0 && userIdTables < totalTables * 0.5) {
    vc.add(typesFile, "low-tenancy-coverage", `Only ${userIdTables}/${totalTables} tables have user_id — check tenancy isolation`, "warning");
  }
}

vc.report("check-tenancy-boundary-map");
vc.exitIfErrors();
