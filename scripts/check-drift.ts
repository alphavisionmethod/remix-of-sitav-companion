#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generated Manifest Drift Checker
// Validates freshness and accuracy of generated JSON manifests
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const GENERATED_DIR = path.resolve(__dirname, "../generated");
const SRC_SERVICES = path.resolve(__dirname, "../src/lib/services");
const SRC_CORE = path.resolve(__dirname, "../src/lib/core-services");
const MAX_AGE_DAYS = 7;

interface DriftResult {
  file: string;
  status: "ok" | "stale" | "missing" | "drift";
  detail: string;
}

const results: DriftResult[] = [];

function checkFileExists(filePath: string, label: string): boolean {
  if (!fs.existsSync(filePath)) {
    results.push({ file: label, status: "missing", detail: `File not found: ${filePath}` });
    return false;
  }
  return true;
}

function checkAge(filePath: string, label: string): void {
  try {
    const stat = fs.statSync(filePath);
    const ageMs = Date.now() - stat.mtimeMs;
    const ageDays = ageMs / 86400000;
    if (ageDays > MAX_AGE_DAYS) {
      results.push({ file: label, status: "stale", detail: `Last modified ${ageDays.toFixed(1)} days ago (threshold: ${MAX_AGE_DAYS}d)` });
    }
  } catch {
    // ignore — already checked existence
  }
}

function countDirectories(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

function readJsonSafe(filePath: string): any {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

// ── Check 1: Service Manifest vs actual services ────────────────

function checkServiceManifest(): void {
  const manifestPath = path.join(GENERATED_DIR, "service-manifest.json");
  if (!checkFileExists(manifestPath, "service-manifest.json")) return;
  checkAge(manifestPath, "service-manifest.json");

  const manifest = readJsonSafe(manifestPath);
  if (!manifest) {
    results.push({ file: "service-manifest.json", status: "drift", detail: "Could not parse JSON" });
    return;
  }

  const actualServices = countDirectories(SRC_SERVICES);
  const manifestServices = Array.isArray(manifest.services) ? manifest.services.length : Object.keys(manifest.services || {}).length;

  if (Math.abs(actualServices.length - manifestServices) > 2) {
    results.push({
      file: "service-manifest.json",
      status: "drift",
      detail: `Manifest has ${manifestServices} services but ${actualServices.length} exist in src/lib/services/`,
    });
  } else {
    results.push({ file: "service-manifest.json", status: "ok", detail: `${manifestServices} services (actual: ${actualServices.length})` });
  }
}

// ── Check 2: Capability Index vs core-services ──────────────────

function checkCapabilityIndex(): void {
  const indexPath = path.join(GENERATED_DIR, "capability-index.json");
  if (!checkFileExists(indexPath, "capability-index.json")) return;
  checkAge(indexPath, "capability-index.json");

  const index = readJsonSafe(indexPath);
  if (!index) {
    results.push({ file: "capability-index.json", status: "drift", detail: "Could not parse JSON" });
    return;
  }

  const actualCore = countDirectories(SRC_CORE);
  const coreFiles = fs.existsSync(SRC_CORE)
    ? fs.readdirSync(SRC_CORE).filter(f => f.endsWith(".ts") && !f.startsWith("index")).length
    : 0;

  const indexEntries = Array.isArray(index.capabilities) ? index.capabilities.length : Object.keys(index).length;
  results.push({
    file: "capability-index.json",
    status: Math.abs(indexEntries - coreFiles) > 5 ? "drift" : "ok",
    detail: `Index has ${indexEntries} entries, ${coreFiles} core-service files exist`,
  });
}

// ── Check 3: Route Manifest freshness ───────────────────────────

function checkRouteManifest(): void {
  const routePath = path.join(GENERATED_DIR, "route-manifest.json");
  if (!checkFileExists(routePath, "route-manifest.json")) return;
  checkAge(routePath, "route-manifest.json");
  results.push({ file: "route-manifest.json", status: "ok", detail: "Exists and age checked" });
}

// ── Check 4: All generated JSON files age check ─────────────────

function checkAllGeneratedAge(): void {
  if (!fs.existsSync(GENERATED_DIR)) {
    results.push({ file: "generated/", status: "missing", detail: "Generated directory not found" });
    return;
  }

  const walkJson = (dir: string): string[] => {
    const files: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) files.push(...walkJson(full));
      else if (entry.name.endsWith(".json")) files.push(full);
    }
    return files;
  };

  const jsonFiles = walkJson(GENERATED_DIR);
  let staleCount = 0;
  for (const f of jsonFiles) {
    const stat = fs.statSync(f);
    if (Date.now() - stat.mtimeMs > MAX_AGE_DAYS * 86400000) staleCount++;
  }

  if (staleCount > 0) {
    results.push({ file: "generated/**/*.json", status: "stale", detail: `${staleCount}/${jsonFiles.length} JSON files older than ${MAX_AGE_DAYS} days` });
  } else {
    results.push({ file: "generated/**/*.json", status: "ok", detail: `All ${jsonFiles.length} JSON files within ${MAX_AGE_DAYS}-day threshold` });
  }
}

// ── Run all checks ──────────────────────────────────────────────

checkServiceManifest();
checkCapabilityIndex();
checkRouteManifest();
checkAllGeneratedAge();

// ── Report ──────────────────────────────────────────────────────

console.log("\n═══ SITA OS Drift Report ═══\n");
for (const r of results) {
  const icon = r.status === "ok" ? "✅" : r.status === "stale" ? "⏳" : r.status === "missing" ? "❌" : "⚠️";
  console.log(`${icon} [${r.status.toUpperCase()}] ${r.file}`);
  console.log(`   ${r.detail}\n`);
}

const issues = results.filter(r => r.status !== "ok");
if (issues.length > 0) {
  console.log(`\n⚠️  ${issues.length} issue(s) detected. Run generators to fix drift.\n`);
  process.exit(1);
} else {
  console.log("\n✅ No drift detected. All manifests are current.\n");
  process.exit(0);
}
