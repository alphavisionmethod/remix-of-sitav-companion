#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Migration Registry
// Produces generated/migration-registry.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { writeJsonOutput, envelope } from "../../architecture/lib/utils";

const migrationsDir = "supabase/migrations";
const entries: Array<{ file: string; timestamp: string; sizeBytes: number; hasRLS: boolean; tableCount: number }> = [];

if (fs.existsSync(migrationsDir)) {
  const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
  for (const m of migrations) {
    const content = fs.readFileSync(path.join(migrationsDir, m), "utf-8");
    const stats = fs.statSync(path.join(migrationsDir, m));
    const timestampMatch = m.match(/^(\d{14})/);
    entries.push({
      file: m,
      timestamp: timestampMatch ? timestampMatch[1] : "unknown",
      sizeBytes: stats.size,
      hasRLS: /ENABLE ROW LEVEL SECURITY/i.test(content),
      tableCount: (content.match(/CREATE TABLE/gi) || []).length,
    });
  }
}

writeJsonOutput("generated/migration-registry.json", envelope("1.0.0", {
  totalMigrations: entries.length,
  totalSizeBytes: entries.reduce((a, e) => a + e.sizeBytes, 0),
  withRLS: entries.filter(e => e.hasRLS).length,
  entries,
}));

console.log(`✅ generate-migration-registry: ${entries.length} migrations indexed`);
