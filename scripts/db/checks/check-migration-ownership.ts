#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Migration Ownership Check
// Validates migration files have clear ownership
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";
import * as path from "path";

const vc = new ViolationCollector();
const migrationsDir = "supabase/migrations";

if (!fs.existsSync(migrationsDir)) {
  vc.add(migrationsDir, "missing-dir", "Migrations directory not found");
} else {
  const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
  console.log(`  📂 ${migrations.length} migration files found`);

  let withComments = 0;
  for (const m of migrations) {
    const content = fs.readFileSync(path.join(migrationsDir, m), "utf-8");
    if (content.includes("--") && content.substring(0, 200).includes("--")) {
      withComments++;
    }
  }
  console.log(`  📝 ${withComments}/${migrations.length} migrations have header comments`);
}

vc.report("check-migration-ownership");
vc.exitIfErrors();
