#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Security: Tenant Isolation Check
// Validates RLS policies, tenant filtering, cross-tenant prevention
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";

const vc = new ViolationCollector();

// Check migration files for RLS enablement
const migrationDir = "supabase/migrations";
if (fs.existsSync(migrationDir)) {
  const migrations = fs.readdirSync(migrationDir).filter(f => f.endsWith(".sql"));
  const tablesWithRLS = new Set<string>();
  const tablesCreated = new Set<string>();

  for (const m of migrations) {
    const content = fs.readFileSync(`${migrationDir}/${m}`, "utf-8");
    // Find CREATE TABLE statements
    const creates = content.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/gi);
    if (creates) {
      for (const c of creates) {
        const name = c.match(/(\w+)\s*$/)?.[1];
        if (name) tablesCreated.add(name);
      }
    }
    // Find ENABLE ROW LEVEL SECURITY
    const rls = content.match(/ALTER\s+TABLE\s+(?:public\.)?(\w+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi);
    if (rls) {
      for (const r of rls) {
        const name = r.match(/TABLE\s+(?:public\.)?(\w+)/i)?.[1];
        if (name) tablesWithRLS.add(name);
      }
    }
  }

  const tablesWithoutRLS = [...tablesCreated].filter(t => !tablesWithRLS.has(t));
  for (const table of tablesWithoutRLS) {
    vc.add(migrationDir, "no-rls", `Table "${table}" has no RLS enabled`, "warning");
  }

  console.log(`  🔒 ${tablesWithRLS.size}/${tablesCreated.size} tables have RLS enabled`);
}

// Check for direct table access without user_id filtering in services
const serviceFiles = scanDir("src/lib/services", [".ts"]);
for (const file of serviceFiles) {
  if (file.includes(".test.") || file.includes("index.ts")) continue;
  const content = readFileContent(file);
  if (content.includes(".from(") && !content.includes("auth") && !content.includes("user_id") && !content.includes("tenant")) {
    // Skip if file is clearly infrastructure
    if (!file.includes("diagnostic") && !file.includes("health")) {
      vc.add(file, "no-tenant-filter", "Database access without visible tenant/user filtering", "warning");
    }
  }
}

vc.report("security-check-tenant-isolation");
vc.exitIfErrors();
