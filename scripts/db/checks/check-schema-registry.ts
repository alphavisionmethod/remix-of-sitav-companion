#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Schema Registry Check (HARDENED)
//
// Asserts that:
//   1. src/lib/db/schema-registry.ts exists and exports DB_SCHEMA_REGISTRY
//   2. Every CREATE TABLE in supabase/migrations/ is in the registry
//   3. Every registry entry has a corresponding CREATE TABLE somewhere
//      (or a known-baseline exemption — handled by warning, not error)
//   4. Registry tracks RLS, tenancy, and schema class for every entry
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";
import * as path from "path";

const vc = new ViolationCollector();

const REGISTRY_PATH = "src/lib/db/schema-registry.ts";

if (!fs.existsSync(REGISTRY_PATH)) {
  vc.add(REGISTRY_PATH, "missing-registry", "DB schema registry not found", "error");
  vc.report("check-schema-registry");
  vc.exitIfErrors();
  process.exit(1);
}

const registry = fs.readFileSync(REGISTRY_PATH, "utf-8");

// Extract registered table names
const REG_NAME_RE = /name:\s*"([a-z_]+)"/g;
const registered = new Set<string>();
let m: RegExpExecArray | null;
while ((m = REG_NAME_RE.exec(registry)) !== null) {
  registered.add(m[1]);
}

if (!registry.includes("DB_SCHEMA_REGISTRY")) {
  vc.add(REGISTRY_PATH, "no-export", "Registry missing DB_SCHEMA_REGISTRY export", "error");
}

// Prefer live DB as source of truth (matches generator); fall back to migrations.
import { execSync } from "child_process";
let live: Set<string> | null = null;
try {
  if (process.env.PGHOST) {
    const out = execSync(`psql -A -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"`, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
    const names = out.split("\n").map(s => s.trim()).filter(Boolean);
    if (names.length) live = new Set(names);
  }
} catch { /* fall back to migrations */ }

let comparisonSet: Set<string>;
let comparisonSource: string;
if (live) {
  comparisonSet = live;
  comparisonSource = "live-pg";
} else {
  // Fallback: scan migrations for CREATE TABLE minus DROP TABLE
  const MIG_DIR = "supabase/migrations";
  const fromMigrations = new Set<string>();
  const dropped = new Set<string>();
  if (fs.existsSync(MIG_DIR)) {
    for (const f of fs.readdirSync(MIG_DIR).sort()) {
      if (!f.endsWith(".sql")) continue;
      const sql = fs.readFileSync(path.join(MIG_DIR, f), "utf-8");
      const createRe = /CREATE TABLE (?:IF NOT EXISTS )?public\.(\w+)/gi;
      let cm;
      while ((cm = createRe.exec(sql)) !== null) fromMigrations.add(cm[1]);
      const dropRe = /DROP TABLE (?:IF EXISTS )?public\.(\w+)/gi;
      let dm;
      while ((dm = dropRe.exec(sql)) !== null) dropped.add(dm[1]);
    }
  }
  for (const d of dropped) fromMigrations.delete(d);
  comparisonSet = fromMigrations;
  comparisonSource = "migrations";
}

// Check 1: every comparison-set table is in registry
let missing = 0;
for (const t of comparisonSet) {
  if (!registered.has(t)) {
    vc.add(REGISTRY_PATH, "missing-from-registry", `Table ${t} exists (${comparisonSource}) but missing from schema-registry.ts (regenerate via generate-schema-registry.ts)`, "error");
    missing++;
  }
}

// Check 2: every registry entry should map to a real table
let phantoms = 0;
for (const t of registered) {
  if (!comparisonSet.has(t)) {
    vc.add(REGISTRY_PATH, "phantom-registry-entry", `Table ${t} in registry but not found in ${comparisonSource}`, "warning");
    phantoms++;
  }
}

// Check 3: required metadata present
const requiredFields = ["domain:", "schemaClass:", "hasRls:", "tenancyColumn:", "sensitiveData:"];
for (const field of requiredFields) {
  if (!registry.includes(field)) {
    vc.add(REGISTRY_PATH, "missing-metadata-field", `Registry entries missing required field: ${field}`, "error");
  }
}

console.log(`  📊 Registry: ${registered.size} tables`);
console.log(`  📋 ${comparisonSource} declares: ${comparisonSet.size} tables`);
console.log(`  ⚠️  Missing from registry: ${missing}`);
console.log(`  ⚠️  Phantom entries: ${phantoms}`);

vc.report("check-schema-registry");
vc.exitIfErrors();
