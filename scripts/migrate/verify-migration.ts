#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Post-Migration Verification (Complete)
// Validates the monorepo structure after migration.
// Run: npx tsx scripts/migrate/verify-migration.ts
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface CheckResult { name: string; passed: boolean; details: string }
const results: CheckResult[] = [];

function check(name: string, fn: () => { passed: boolean; details: string }) {
  try { results.push({ name, ...fn() }); }
  catch (e) { results.push({ name, passed: false, details: `Error: ${e}` }); }
}

function dirExists(dir: string): boolean { return fs.existsSync(dir) && fs.statSync(dir).isDirectory(); }
function fileExists(f: string): boolean { return fs.existsSync(f) && fs.statSync(f).isFile(); }

function scanDir(dir: string, exts: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes("node_modules")) files.push(...scanDir(full, exts));
    else if (exts.some(e => entry.name.endsWith(e))) files.push(full);
  }
  return files;
}

// ── Check 1: Required directories ──
check("Required plane directories", () => {
  const required = ["shared/contracts", "os", "backend", "apps/product-shell", "infra"];
  const missing = required.filter(d => !dirExists(d));
  return { passed: missing.length === 0, details: missing.length ? `Missing: ${missing.join(", ")}` : "All plane directories present" };
});

// ── Check 2: Package.json files ──
check("Per-plane package.json", () => {
  const expected = ["shared/contracts/package.json", "os/package.json", "backend/package.json", "apps/product-shell/package.json"];
  const missing = expected.filter(f => !fileExists(f));
  return { passed: missing.length === 0, details: missing.length ? `Missing: ${missing.join(", ")}` : "All plane package.json files present" };
});

// ── Check 3: No orphaned @/ imports ──
check("No stale @/ imports in migrated code", () => {
  const planes = ["shared", "os", "backend", "apps"];
  const violations: string[] = [];
  for (const plane of planes) {
    for (const f of scanDir(plane, [".ts", ".tsx"])) {
      const content = fs.readFileSync(f, "utf-8");
      if (/from\s+["']@\//.test(content)) violations.push(path.relative(process.cwd(), f));
    }
  }
  return { passed: violations.length === 0, details: violations.length ? `${violations.length} files still use @/ imports` : "No stale @/ imports found" };
});

// ── Check 4: No cross-plane imports ──
check("No cross-plane imports", () => {
  const planePatterns: Record<string, RegExp[]> = {
    shared: [/@sita\/os/, /@sita\/backend/, /@sita\/admin/, /@sita\/founder/],
    os: [/@sita\/backend/, /@sita\/admin/, /@sita\/founder/, /@sita\/product-shell/],
    backend: [/@sita\/os/, /@sita\/admin/, /@sita\/product-shell/, /@sita\/founder/],
  };
  const violations: string[] = [];
  for (const [plane, forbidden] of Object.entries(planePatterns)) {
    for (const f of scanDir(plane, [".ts", ".tsx"])) {
      const content = fs.readFileSync(f, "utf-8");
      for (const pat of forbidden) {
        if (pat.test(content)) violations.push(`${path.relative(process.cwd(), f)} → ${pat.source}`);
      }
    }
  }
  return { passed: violations.length === 0, details: violations.length ? `${violations.length} cross-plane violations` : "No cross-plane import violations" };
});

// ── Check 5: No duplicate contract definitions ──
check("No duplicate contract definitions", () => {
  const contractFiles = scanDir("shared/contracts", [".ts"]);
  const typeNames = new Map<string, string[]>();
  for (const f of contractFiles) {
    const content = fs.readFileSync(f, "utf-8");
    for (const m of content.matchAll(/export\s+(?:interface|type|enum)\s+(\w+)/g)) {
      const name = m[1];
      if (!typeNames.has(name)) typeNames.set(name, []);
      typeNames.get(name)!.push(path.relative(process.cwd(), f));
    }
  }
  const dupes = Array.from(typeNames.entries()).filter(([, files]) => files.length > 1);
  return { passed: dupes.length === 0, details: dupes.length ? `${dupes.length} duplicates` : "No duplicate contract definitions" };
});

// ── Check 6: turbo.json ──
check("Turborepo configuration", () => ({
  passed: fileExists("turbo.json"),
  details: fileExists("turbo.json") ? "turbo.json present" : "Missing turbo.json",
}));

// ── Check 7: Demo/prod leakage ──
check("No demo/prod import leakage", () => {
  const demoPatterns = [/from\s+["'].*demo-data/, /from\s+["'].*seed\//,  /from\s+["'].*mock-data/];
  const prodDirs = ["backend/services", "os/kernel", "os/security", "shared"];
  const violations: string[] = [];
  for (const dir of prodDirs) {
    for (const f of scanDir(dir, [".ts", ".tsx"])) {
      const content = fs.readFileSync(f, "utf-8");
      for (const pat of demoPatterns) {
        if (pat.test(content)) violations.push(path.relative(process.cwd(), f));
      }
    }
  }
  return { passed: violations.length === 0, details: violations.length ? `${violations.length} demo imports in production code` : "No demo/prod leakage" };
});

// ── Check 8: Service budget ──
check("Service budget (~45 max)", () => {
  const serviceDir = "backend/services";
  if (!dirExists(serviceDir)) return { passed: true, details: "backend/services not yet created (pre-migration)" };
  const subdirs = fs.readdirSync(serviceDir, { withFileTypes: true }).filter(e => e.isDirectory()).length;
  return { passed: subdirs <= 50, details: `${subdirs} services (budget: ~45)` };
});

// ── Check 9: Duplicate authority detection ──
check("No duplicate service authorities", () => {
  const barrelFiles = ["shared", "os", "backend"].map(p => `${p}/index.ts`).filter(fileExists);
  const exported = new Map<string, string[]>();
  for (const f of barrelFiles) {
    const content = fs.readFileSync(f, "utf-8");
    for (const m of content.matchAll(/export\s+\{\s*([^}]+)\}/g)) {
      for (const name of m[1].split(",").map(s => s.trim().split(/\s+as\s+/)[0])) {
        if (!name || name.startsWith("type")) continue;
        if (!exported.has(name)) exported.set(name, []);
        exported.get(name)!.push(f);
      }
    }
  }
  const dupes = Array.from(exported.entries()).filter(([, files]) => files.length > 1);
  return { passed: dupes.length === 0, details: dupes.length ? `${dupes.length} duplicate authorities` : "No duplicate authorities" };
});

// ── Output ──
console.log("\n═══ SITA OS Post-Migration Verification ═══\n");
let allPassed = true;
for (const r of results) {
  const icon = r.passed ? "✅" : "❌";
  console.log(`${icon} ${r.name}`);
  console.log(`   ${r.details}\n`);
  if (!r.passed) allPassed = false;
}

console.log(allPassed ? "🎉 All checks passed!" : "⚠️  Some checks failed.");

fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync("generated/migration-verification-report.json", JSON.stringify({
  timestamp: new Date().toISOString(), all_passed: allPassed, results,
}, null, 2));
console.log("\n📄 Report: generated/migration-verification-report.json");
process.exit(allPassed ? 0 : 1);
