#!/usr/bin/env tsx
/**
 * Wave E §B.3 — Generated Zone Coverage Validator (Constitution Rule 48, BLOCKING)
 *
 * Asserts that every file in generated/** appears in
 * generated/lifecycle/generated-artifact-zone-index.json with a valid zone.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const GEN = join(ROOT, "generated");
const INDEX = join(ROOT, "generated", "lifecycle", "generated-artifact-zone-index.json");
const WARN = process.argv.includes("--warn");

function fail(msg: string): never {
  console.error(`❌ ${msg}`);
  if (WARN) process.exit(0);
  process.exit(1);
}

if (!existsSync(INDEX)) {
  fail(`Missing ${INDEX}. Run: npx tsx scripts/architecture/generate/generate-generated-zone-index.ts`);
}

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const idx = JSON.parse(readFileSync(INDEX, "utf8")) as {
  entries: { path: string; zone: string }[];
};
const indexed = new Set(idx.entries.map((e) => e.path));
const VALID = new Set(["manifests", "audits", "proof", "readiness", "lifecycle", "historical", "reports"]);
const invalidZones = idx.entries.filter((e) => !VALID.has(e.zone));

const liveFiles = walk(GEN).map((f) => relative(ROOT, f).split(sep).join("/"));
const missingFromIndex = liveFiles.filter((f) => !indexed.has(f));
const stale = idx.entries.filter((e) => !liveFiles.includes(e.path));

const ok = missingFromIndex.length === 0 && invalidZones.length === 0 && stale.length === 0;

if (missingFromIndex.length > 0) {
  console.error(`❌ ${missingFromIndex.length} files in generated/** not present in zone index:`);
  for (const p of missingFromIndex.slice(0, 20)) console.error(`   - ${p}`);
  console.error("   → Re-run: npx tsx scripts/architecture/generate/generate-generated-zone-index.ts");
}
if (invalidZones.length > 0) {
  console.error(`❌ ${invalidZones.length} entries with invalid zone:`);
  for (const e of invalidZones.slice(0, 10)) console.error(`   - ${e.path} → ${e.zone}`);
}
if (stale.length > 0) {
  console.error(`❌ ${stale.length} entries reference deleted files:`);
  for (const e of stale.slice(0, 10)) console.error(`   - ${e.path}`);
}

console.log(
  `\nSummary: live=${liveFiles.length} indexed=${indexed.size} missing=${missingFromIndex.length} invalid=${invalidZones.length} stale=${stale.length}`,
);

if (!ok && !WARN) process.exit(1);
console.log("✅ Generated zone coverage check passed.");