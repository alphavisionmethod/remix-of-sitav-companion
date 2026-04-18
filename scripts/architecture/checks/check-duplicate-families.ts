#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Duplicate Family Check
// Detects new shared-name component collisions and fails CI if any
// appear that are not already declared in component-duplication-map.ts
// (either as WRAPPED or FALSE_POSITIVE).
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, scanDir } from "../lib/utils";
import {
  DUPLICATE_FAMILIES,
  allKnownNameCollisions,
} from "../../../src/platform/architecture/component-duplication-map";

const vc = new ViolationCollector();
const COMPONENT_ROOT = "src/components";
const SKIP_NAMES = new Set([
  "index", "types", "constants", "shared", "utils", "config", "client",
]);

const files = scanDir(COMPONENT_ROOT, [".tsx", ".ts"]).filter(f =>
  !f.endsWith(".test.tsx") && !f.endsWith(".test.ts") && !f.endsWith(".stories.tsx")
);

// Group by basename (case-insensitive)
const byName = new Map<string, string[]>();
for (const f of files) {
  const base = path.basename(f).replace(/\.(tsx|ts)$/, "");
  if (SKIP_NAMES.has(base.toLowerCase())) continue;
  const key = base.toLowerCase();
  if (!byName.has(key)) byName.set(key, []);
  byName.get(key)!.push(f.replace(/\\/g, "/"));
}

const declared = new Set(allKnownNameCollisions().map(p => p.replace(/\\/g, "/")));

let totalCollisions = 0;
let undeclared = 0;

for (const [name, paths] of byName.entries()) {
  if (paths.length < 2) continue;
  totalCollisions++;
  // All paths in this collision must be declared (in one duplicate family)
  const undeclaredPaths = paths.filter(p => !declared.has(p));
  if (undeclaredPaths.length === 0) continue;

  undeclared++;
  vc.add(
    paths[0],
    "undeclared-duplicate",
    `Component name "${name}" appears in ${paths.length} files but is not declared in component-duplication-map.ts:\n      ${paths.join("\n      ")}`,
  );
}

console.log(`  🧬 Total name collisions: ${totalCollisions}`);
console.log(`  📋 Declared families: ${DUPLICATE_FAMILIES.length}`);
console.log(`  ⚠️  Undeclared collisions: ${undeclared}`);

vc.report("check-duplicate-families");
vc.exitIfErrors();
