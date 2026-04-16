#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Schema Registry
// Produces generated/schema-registry.json from Supabase types
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { writeJsonOutput, envelope } from "../../architecture/lib/utils";

const typesFile = "src/integrations/supabase/types.ts";
const tables: Array<{ name: string; hasUserId: boolean; columnCount: number }> = [];

if (fs.existsSync(typesFile)) {
  const content = fs.readFileSync(typesFile, "utf-8");
  // Parse table names from the Tables type
  const tableRegex = /^\s{6}(\w+):\s*\{$/gm;
  let match;
  const seenTables = new Set<string>();
  while ((match = tableRegex.exec(content)) !== null) {
    const tableName = match[1];
    if (seenTables.has(tableName)) continue;
    seenTables.add(tableName);

    // Find the Row section for this table
    const tableStart = match.index;
    const rowSection = content.substring(tableStart, tableStart + 5000);
    const hasUserId = rowSection.includes("user_id:");
    const columnMatches = rowSection.match(/^\s{10}\w+:/gm) || [];

    tables.push({ name: tableName, hasUserId, columnCount: Math.floor(columnMatches.length / 3) });
  }
}

writeJsonOutput("generated/schema-registry.json", envelope("1.0.0", {
  totalTables: tables.length,
  tablesWithUserId: tables.filter(t => t.hasUserId).length,
  tables,
}));

console.log(`✅ generate-schema-registry: ${tables.length} tables indexed`);
