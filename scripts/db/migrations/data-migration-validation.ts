#!/usr/bin/env node
// SITA OS — Data Migration Validation
import * as fs from "fs";
import { ViolationCollector, readJsonSafe } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const MIGRATION_DIR = "supabase/migrations";
if (!fs.existsSync(MIGRATION_DIR)) { console.log("⚠️ No migrations directory — skipping"); process.exit(0); }
const migrations = fs.readdirSync(MIGRATION_DIR).filter(f => f.endsWith(".sql")).sort();
console.log(`  📊 ${migrations.length} migrations found`);
// Check for naming convention
for (const m of migrations) {
  if (!/^\d{14}_/.test(m) && !/^\d{8}/.test(m)) {
    vc.add(`${MIGRATION_DIR}/${m}`, "naming-convention", `Migration "${m}" doesn't follow timestamp naming`, "warning");
  }
}
// Check for destructive operations
for (const m of migrations) {
  const content = fs.readFileSync(`${MIGRATION_DIR}/${m}`, "utf-8");
  if (/DROP\s+TABLE/i.test(content)) {
    vc.add(`${MIGRATION_DIR}/${m}`, "destructive-drop", `Migration contains DROP TABLE`, "warning");
  }
  if (/TRUNCATE/i.test(content)) {
    vc.add(`${MIGRATION_DIR}/${m}`, "destructive-truncate", `Migration contains TRUNCATE`, "warning");
  }
}
vc.report("data-migration-validation");
vc.exitIfErrors();
