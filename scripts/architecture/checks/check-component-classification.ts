#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Component Classification Check
// Asserts every component file is classified according to the
// 3-class constitution (PRIMITIVE | DOMAIN | SURFACE | helper).
//
// Re-runs the audit and fails if:
//   - a component has no detectable classification
//   - a component name violates the suffix grammar
//   - the registry JSON is stale (older than source files)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, scanDir } from "../lib/utils";
import { VALID_SUFFIXES } from "../../../src/lib/architecture/component-registry";

const REGISTRY_PATH = "generated/component-registry.json";
const vc = new ViolationCollector();

if (!fs.existsSync(REGISTRY_PATH)) {
  console.error("❌ component-registry.json missing.");
  console.error("   Run: npx tsx scripts/architecture/audit-components.ts");
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
const records = registry.records as Array<{
  path: string; name: string; classification: string; family: string;
}>;

// Suffix grammar regex (must end in one of the valid suffixes OR be a barrel/types/style file)
const SUFFIX_RE = new RegExp(`(${VALID_SUFFIXES.join("|")})$`);
const BARREL_NAMES = new Set(["index", "types", "constants", "shared", "utils", "config"]);

let classified = 0;
let unclassified = 0;
let suffixViolations = 0;

for (const rec of records) {
  // Every record must have a classification
  if (!rec.classification) {
    vc.add(rec.path, "missing-classification", `${rec.name} has no classification`);
    unclassified++;
    continue;
  }
  classified++;

  // Skip barrels and ui-lib for naming check
  if (BARREL_NAMES.has(rec.name.toLowerCase())) continue;
  if (rec.classification === "UI_LIB") continue;
  if (rec.classification === "DEPRECATED_WRAPPER") continue;

  // Only PascalCase names that are React components are subject to suffix grammar.
  // Skip lowerCase utility files and hook-shaped files.
  if (!/^[A-Z]/.test(rec.name)) continue;
  if (rec.name.startsWith("use")) continue;

  if (!SUFFIX_RE.test(rec.name)) {
    vc.add(
      rec.path,
      "naming-suffix",
      `${rec.name} does not end with a canonical suffix (Card, Badge, Panel, Shell, Hero, Summary, Drawer, Timeline, etc.)`,
      "warning"
    );
    suffixViolations++;
  }
}

// Sanity: scan for component files NOT present in the registry
const fileCount = scanDir("src/components", [".tsx", ".ts"]).filter(f =>
  !f.endsWith(".test.tsx") && !f.endsWith(".test.ts") && !f.endsWith(".stories.tsx")
).length;

if (fileCount !== records.length) {
  vc.add(
    "registry",
    "stale-registry",
    `Disk has ${fileCount} component files, registry has ${records.length}. Re-run audit.`,
    "warning"
  );
}

console.log(`  📦 Classified: ${classified}`);
console.log(`  📂 Unclassified: ${unclassified}`);
console.log(`  🏷️  Suffix warnings: ${suffixViolations}`);

vc.report("check-component-classification");
vc.exitIfErrors();
