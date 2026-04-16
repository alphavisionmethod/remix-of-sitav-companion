#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — DB Schema Manifest vs Migrations Linkage Check
// Diffs generated/schema-registry.json against the union of
// CREATE TABLE statements in supabase/migrations/*.sql
// ═══════════════════════════════════════════════════════════════
//
// Source of truth: supabase/migrations/*.sql (CREATE TABLE statements)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, readJsonSafe } from "../../architecture/lib/utils";

const vc = new ViolationCollector();
const SCHEMA_PATH = "generated/schema-registry.json";
const MIGRATIONS_DIR = "supabase/migrations";

// ── Parse migrations for CREATE TABLE statements ───────────────
const migrationTables = new Set<string>();
if (fs.existsSync(MIGRATIONS_DIR)) {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .map((f) => path.join(MIGRATIONS_DIR, f));

  // CREATE TABLE [IF NOT EXISTS] [public.]name
  const createTableRx =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?["`]?(\w+)["`]?/gi;

  for (const file of files) {
    const sql = fs.readFileSync(file, "utf-8");
    let m: RegExpExecArray | null;
    while ((m = createTableRx.exec(sql)) !== null) {
      const name = m[1].toLowerCase();
      // Filter known supabase-managed schemas
      if (
        ["users", "buckets", "objects", "schema_migrations"].includes(name)
      ) continue;
      migrationTables.add(name);
    }
  }
}

// ── Manifest inventory ─────────────────────────────────────────
const schema = readJsonSafe<any>(SCHEMA_PATH);
const manifestTables = new Set<string>();
if (schema) {
  const tables = schema.tables || schema.entries || [];
  for (const t of tables) {
    const name = typeof t === "string" ? t : t.name;
    if (name) manifestTables.add(name.toLowerCase());
  }
}

// ── Diff ───────────────────────────────────────────────────────
let manifestOnly = 0;
let migrationOnly = 0;
const manifestOnlySamples: string[] = [];
const migrationOnlySamples: string[] = [];

for (const t of manifestTables) {
  if (!migrationTables.has(t)) {
    manifestOnly++;
    manifestOnlySamples.push(t);
  }
}
for (const t of migrationTables) {
  if (!manifestTables.has(t)) {
    migrationOnly++;
    migrationOnlySamples.push(t);
  }
}

if (manifestTables.size === 0) {
  vc.add(
    SCHEMA_PATH,
    "empty-or-missing-schema-registry",
    `Schema registry missing/empty — ${migrationTables.size} tables exist in migrations.`,
    "warning"
  );
} else {
  const SAMPLE_LIMIT = 8;
  if (manifestOnly > 0) {
    // The schema registry is generated from src/integrations/supabase/types.ts which can include views;
    // mark as warning unless ratio is large
    const severity = manifestOnly > manifestTables.size * 0.25 ? "error" : "warning";
    vc.add(
      SCHEMA_PATH,
      "manifest-claims-missing-table",
      `${manifestOnly} table(s) in schema registry not found in migrations (could be views or supabase-managed). Sample: ${manifestOnlySamples.slice(0, SAMPLE_LIMIT).join(", ")}`,
      severity
    );
  }
  if (migrationOnly > 0) {
    vc.add(
      SCHEMA_PATH,
      "migration-table-not-in-registry",
      `${migrationOnly} table(s) in migrations not in schema registry (regenerate). Sample: ${migrationOnlySamples.slice(0, SAMPLE_LIMIT).join(", ")}`,
      "warning"
    );
  }
}

console.log(
  `  🗄️  DB tables — registry: ${manifestTables.size}, migrations: ${migrationTables.size}`
);
console.log(
  `  📊 Drift — registry→missing-mig: ${manifestOnly}, mig→missing-registry: ${migrationOnly}`
);

vc.report("check-db-manifest-vs-migrations");
vc.exitIfErrors();
