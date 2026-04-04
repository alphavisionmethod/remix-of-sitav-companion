#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Operational Diagnostic Bundle Builder
// Builds a diagnostic bundle for support/debugging
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { readJsonSafe, writeJsonOutput, envelope, discoverServiceDirs, loadServiceManifest } from "../architecture/lib/utils";

const BUNDLE_DIR = "generated/diagnostic-bundle";
if (!fs.existsSync(BUNDLE_DIR)) fs.mkdirSync(BUNDLE_DIR, { recursive: true });

console.log("📦 Building diagnostic bundle...\n");

// 1. Service inventory
const manifest = loadServiceManifest();
const services = manifest?.services || [];
console.log(`  📋 ${services.length} services in manifest`);

// 2. Generated artifacts inventory
const generatedDir = "generated";
const generatedFiles = fs.existsSync(generatedDir)
  ? fs.readdirSync(generatedDir).filter(f => f.endsWith(".json"))
  : [];
console.log(`  📄 ${generatedFiles.length} generated JSON artifacts`);

// 3. Migration count
const migrationDir = "supabase/migrations";
const migrations = fs.existsSync(migrationDir)
  ? fs.readdirSync(migrationDir).filter(f => f.endsWith(".sql"))
  : [];
console.log(`  🗃️ ${migrations.length} database migrations`);

// 4. Edge function inventory
const fnDir = "supabase/functions";
const edgeFunctions = fs.existsSync(fnDir)
  ? fs.readdirSync(fnDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
  : [];
console.log(`  ⚡ ${edgeFunctions.length} edge functions`);

// 5. Service directory health
const serviceDirs = discoverServiceDirs();
const serviceHealth: Array<{ name: string; hasBarrel: boolean; fileCount: number }> = [];
for (const svc of serviceDirs) {
  const svcPath = path.join("src/lib/services", svc);
  const hasBarrel = fs.existsSync(path.join(svcPath, "index.ts"));
  const files = fs.existsSync(svcPath) ? fs.readdirSync(svcPath).filter(f => f.endsWith(".ts")).length : 0;
  serviceHealth.push({ name: svc, hasBarrel, fileCount: files });
}

// 6. Package inventory
const packagesDir = "src/packages";
const packages = fs.existsSync(packagesDir)
  ? fs.readdirSync(packagesDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
  : [];
console.log(`  📦 ${packages.length} packages`);

// Write bundle
const bundle = envelope("1.0.0", {
  environment: {
    node: process.version,
    platform: process.platform,
    cwd: process.cwd(),
  },
  inventory: {
    services: services.length,
    serviceDirs: serviceDirs.length,
    packages: packages.length,
    edgeFunctions: edgeFunctions.length,
    migrations: migrations.length,
    generatedArtifacts: generatedFiles.length,
  },
  serviceHealth,
  edgeFunctions,
  packages,
  generatedArtifacts: generatedFiles,
  migrations: migrations.slice(-10), // Last 10 migrations
});

writeJsonOutput(path.join(BUNDLE_DIR, "diagnostic-bundle.json"), bundle);
console.log(`\n✅ Diagnostic bundle written to ${BUNDLE_DIR}/diagnostic-bundle.json`);
