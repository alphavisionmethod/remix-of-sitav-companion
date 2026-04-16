#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Table Ownership Map
// Produces generated/table-ownership-map.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { writeJsonOutput, envelope } from "../../architecture/lib/utils";
import { classifyServiceDomain } from "../../architecture/lib/utils";

const typesFile = "src/integrations/supabase/types.ts";
const ownership: Array<{ table: string; domain: string }> = [];

if (fs.existsSync(typesFile)) {
  const content = fs.readFileSync(typesFile, "utf-8");
  const tableRegex = /^\s{6}(\w+):\s*\{$/gm;
  let match;
  const seen = new Set<string>();
  while ((match = tableRegex.exec(content)) !== null) {
    if (seen.has(match[1])) continue;
    seen.add(match[1]);
    ownership.push({ table: match[1], domain: classifyServiceDomain(match[1]) });
  }
}

writeJsonOutput("generated/table-ownership-map.json", envelope("1.0.0", {
  totalTables: ownership.length,
  byDomain: Object.fromEntries(
    Array.from(new Set(ownership.map(o => o.domain))).map(d => [d, ownership.filter(o => o.domain === d).length])
  ),
  tables: ownership,
}));

console.log(`✅ generate-table-ownership-map: ${ownership.length} tables mapped`);
