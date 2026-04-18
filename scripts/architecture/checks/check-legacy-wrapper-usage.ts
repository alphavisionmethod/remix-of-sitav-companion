#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Check: Legacy Wrapper Usage
// Reports how many external consumers still import via deprecated
// src/lib wrapper shims. Goal: this number trends to zero.
// Writes generated/lib-decomposition/wrapper-usage-snapshot.json.
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import * as path from "path";
import { scanDir, readFileContent } from "../lib/utils";

const ROOT = process.cwd();
const WRAPPER_MAP_PATH = path.join(ROOT, "generated/lib-decomposition/src-lib-wrapper-map.json");
const SNAPSHOT_PATH = path.join(ROOT, "generated/lib-decomposition/wrapper-usage-snapshot.json");

if (!fs.existsSync(WRAPPER_MAP_PATH)) {
  console.log("  ℹ️  No wrapper map yet — skipping.");
  process.exit(0);
}
const map = JSON.parse(fs.readFileSync(WRAPPER_MAP_PATH, "utf8"));
const wrappers: Array<{ oldPath: string; canonicalPath: string; canonicalSpec: string }> = map.wrappers ?? [];

// Build importable spec for each wrapper old path
const wrapperSpecs = new Map<string, { canonical: string; count: number }>();
for (const w of wrappers) {
  const noSrc = w.oldPath.replace(/^src\//, "");
  const noExt = noSrc.replace(/\.(tsx?|jsx?)$/, "").replace(/\/index$/, "");
  wrapperSpecs.set(`@/${noExt}`, { canonical: w.canonicalSpec, count: 0 });
}

const allFiles = [
  ...scanDir("src/pages", [".ts", ".tsx"]),
  ...scanDir("src/components", [".ts", ".tsx"]),
  ...scanDir("src/hooks", [".ts", ".tsx"]),
  ...scanDir("src/contexts", [".ts", ".tsx"]),
  ...scanDir("src/features", [".ts", ".tsx"]),
  ...scanDir("src/planes", [".ts", ".tsx"]),
  ...scanDir("src/domains", [".ts", ".tsx"]),
  ...scanDir("src/platform", [".ts", ".tsx"]),
  ...scanDir("src/runtimes", [".ts", ".tsx"]),
  ...scanDir("src/data", [".ts", ".tsx"]),
  ...scanDir("src/integrations", [".ts", ".tsx"]),
];

const importRE = /from\s+['"]([^'"]+)['"]/g;
let totalUsage = 0;
for (const f of allFiles) {
  const content = readFileContent(f);
  let m: RegExpExecArray | null;
  while ((m = importRE.exec(content)) !== null) {
    const spec = m[1];
    if (wrapperSpecs.has(spec)) {
      wrapperSpecs.get(spec)!.count++;
      totalUsage++;
    }
  }
}

const usage = [...wrapperSpecs.entries()]
  .map(([spec, info]) => ({ wrapperImport: spec, canonical: info.canonical, externalConsumers: info.count }))
  .sort((a, b) => b.externalConsumers - a.externalConsumers);

const snapshot = {
  generatedAt: new Date().toISOString(),
  totalWrappers: wrappers.length,
  totalExternalUsages: totalUsage,
  hotWrappers: usage.slice(0, 30),
};
fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));

console.log(`  🪟 Wrappers tracked: ${wrappers.length}`);
console.log(`  🔌 External consumer imports through wrappers: ${totalUsage}`);
console.log(`  📄 Snapshot: generated/lib-decomposition/wrapper-usage-snapshot.json`);
// Non-fatal: this is a trend metric
process.exit(0);
