#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Schema Registry Check
// Validates DB schema registry completeness
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

const schemaRegistry = "src/lib/db/db-schema-registry.ts";
if (!fs.existsSync(schemaRegistry)) {
  vc.add(schemaRegistry, "missing-registry", "DB schema registry not found", "warning");
} else {
  const content = fs.readFileSync(schemaRegistry, "utf-8");
  const tableCount = (content.match(/tableName|table_name|"[a-z_]+"/g) || []).length;
  console.log(`  📊 ~${tableCount} table references in schema registry`);
  if (!content.includes("export")) {
    vc.add(schemaRegistry, "no-exports", "Schema registry has no exports");
  }
}

// Check types file exists
const typesFile = "src/integrations/supabase/types.ts";
if (!fs.existsSync(typesFile)) {
  vc.add(typesFile, "missing-types", "Supabase types file not found");
} else {
  const content = fs.readFileSync(typesFile, "utf-8");
  const tableMatches = content.match(/^\s{6}[a-z_]+:\s*\{$/gm) || [];
  console.log(`  📋 ${tableMatches.length} tables in Supabase types`);
}

vc.report("check-schema-registry");
vc.exitIfErrors();
