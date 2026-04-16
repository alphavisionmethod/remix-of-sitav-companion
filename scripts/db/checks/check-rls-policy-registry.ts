#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — RLS Policy Registry Check
// Validates RLS policy coverage across tables
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";
import * as path from "path";

const vc = new ViolationCollector();
const migrationsDir = "supabase/migrations";

if (!fs.existsSync(migrationsDir)) {
  vc.add(migrationsDir, "missing", "Migrations directory not found");
} else {
  const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
  const allSQL = migrations.map(m => fs.readFileSync(path.join(migrationsDir, m), "utf-8")).join("\n");

  const createTableMatches = allSQL.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:public\.)?(\w+)/gi) || [];
  const rlsMatches = allSQL.match(/ALTER TABLE\s+(?:public\.)?(\w+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi) || [];
  const policyMatches = allSQL.match(/CREATE POLICY/gi) || [];

  console.log(`  📊 ${createTableMatches.length} CREATE TABLE statements`);
  console.log(`  🔒 ${rlsMatches.length} tables with RLS enabled`);
  console.log(`  📋 ${policyMatches.length} RLS policies defined`);

  if (createTableMatches.length > 0 && rlsMatches.length < createTableMatches.length * 0.5) {
    vc.add(migrationsDir, "low-rls-coverage", `Only ${rlsMatches.length}/${createTableMatches.length} tables have RLS enabled`, "warning");
  }
}

vc.report("check-rls-policy-registry");
vc.exitIfErrors();
