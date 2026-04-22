// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Registry Validator
// Ensures every feature barrel has a registry entry, no page
// files live under src/features/, and no peer feature imports.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface Violation {
  rule: string;
  file: string;
  detail: string;
}

const FEATURES_DIR = path.resolve("src/features");
const violations: Violation[] = [];

// ── 1. Discover all feature barrel directories ──────────────
function getFeatureDirs(dir: string, prefix = ""): string[] {
  const dirs: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const indexPath = path.join(fullPath, "index.ts");
      if (fs.existsSync(indexPath)) {
        dirs.push(prefix ? `${prefix}/${entry.name}` : entry.name);
      }
      dirs.push(...getFeatureDirs(fullPath, prefix ? `${prefix}/${entry.name}` : entry.name));
    }
  }
  return dirs;
}

// ── 2. Check no .tsx page files under src/features/ ─────────
function checkNoPageFiles(dir: string): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkNoPageFiles(fullPath);
    } else if (entry.name.endsWith(".tsx") && entry.name !== "index.tsx") {
      violations.push({
        rule: "no-page-in-features",
        file: fullPath,
        detail: "Page/component .tsx files must live in src/pages/ or src/components/, not src/features/",
      });
    }
  }
}

// ── 3. Check no peer feature imports ────────────────────────
function checkNoPeerImports(dir: string): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkNoPeerImports(fullPath);
      continue;
    }
    if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) continue;
    const content = fs.readFileSync(fullPath, "utf-8");
    const featureImportRe = /from\s+["']@\/features\/([^"']+)["']/g;
    let match: RegExpExecArray | null;
    while ((match = featureImportRe.exec(content)) !== null) {
      violations.push({
        rule: "no-peer-feature-import",
        file: fullPath,
        detail: `Peer feature import: @/features/${match[1]}`,
      });
    }
  }
}

// ── 4. Check registry coverage ──────────────────────────────
function checkRegistryCoverage(): void {
  // We read the registry file to extract featureIds
  const registryPath = path.resolve("src/features/feature-registry.ts");
  if (!fs.existsSync(registryPath)) {
    violations.push({ rule: "registry-exists", file: registryPath, detail: "Feature registry file missing" });
    return;
  }
  const registryContent = fs.readFileSync(registryPath, "utf-8");
  const featureDirs = getFeatureDirs(FEATURES_DIR);
  
  for (const dir of featureDirs) {
    const featureId = dir.replace(/\//g, "/"); // e.g. "business/crm"
    // Top-level features only need registry entries (sub-features tracked via subFeatures field)
    if (featureId.includes("/")) continue;
    if (!registryContent.includes(`featureId: "${featureId}"`)) {
      violations.push({
        rule: "registry-coverage",
        file: `src/features/${dir}/index.ts`,
        detail: `Feature "${featureId}" has no entry in feature-registry.ts`,
      });
    }
  }
}

// ── Run ─────────────────────────────────────────────────────
checkNoPageFiles(FEATURES_DIR);
checkNoPeerImports(FEATURES_DIR);
checkRegistryCoverage();

// ── Report ──────────────────────────────────────────────────
const report = {
  timestamp: new Date().toISOString(),
  totalFeatures: getFeatureDirs(FEATURES_DIR).length,
  violations,
  compliant: violations.length === 0,
};

const outDir = path.resolve("generated");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "feature-registry-audit.json"),
  JSON.stringify(report, null, 2),
);

console.log(`\n═══ Feature Registry Audit ═══`);
console.log(`Features discovered: ${report.totalFeatures}`);
console.log(`Violations: ${violations.length}`);
if (violations.length > 0) {
  for (const v of violations) {
    console.log(`  [${v.rule}] ${v.file}: ${v.detail}`);
  }
}
console.log(`Compliant: ${report.compliant}`);
console.log(`Report: generated/feature-registry-audit.json\n`);