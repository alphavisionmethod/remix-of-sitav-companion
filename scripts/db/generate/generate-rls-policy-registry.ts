#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate RLS Policy Registry
// Produces generated/rls-policy-registry.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { writeJsonOutput, envelope } from "../../architecture/lib/utils";

const migrationsDir = "supabase/migrations";
const policies: Array<{ name: string; table: string; operation: string; file: string }> = [];

if (fs.existsSync(migrationsDir)) {
  const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
  for (const m of migrations) {
    const content = fs.readFileSync(path.join(migrationsDir, m), "utf-8");
    const policyRegex = /CREATE POLICY\s+"([^"]+)"\s+ON\s+(?:public\.)?(\w+)\s+(?:FOR\s+(\w+))?/gi;
    let match;
    while ((match = policyRegex.exec(content)) !== null) {
      policies.push({ name: match[1], table: match[2], operation: match[3] || "ALL", file: m });
    }
  }
}

writeJsonOutput("generated/rls-policy-registry.json", envelope("1.0.0", {
  totalPolicies: policies.length,
  uniqueTables: new Set(policies.map(p => p.table)).size,
  byOperation: Object.fromEntries(
    ["SELECT", "INSERT", "UPDATE", "DELETE", "ALL"].map(op => [op, policies.filter(p => p.operation.toUpperCase() === op).length])
  ),
  policies,
}));

console.log(`✅ generate-rls-policy-registry: ${policies.length} policies across ${new Set(policies.map(p => p.table)).size} tables`);
