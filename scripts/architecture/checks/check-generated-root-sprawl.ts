#!/usr/bin/env tsx
/**
 * Wave E §B.3 — Generated Root-Sprawl Ratchet (Constitution Rule 49, BLOCKING)
 * Pins root-level files at generated/<file> and fails on net-new root files.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const GEN = join(ROOT, "generated");
const BASELINE = join(ROOT, "generated", "baselines", "root-sprawl-baseline.json");
const REPORT = join(ROOT, "generated", "root-sprawl-report.json");
const RESEAL = process.argv.includes("--reseal");
const WARN = process.argv.includes("--warn");

const liveRoot = readdirSync(GEN, { withFileTypes: true })
  .filter((e) => e.isFile())
  .map((e) => `generated/${e.name}`)
  .sort();

let baseline: { sealedAt: string; sealedFiles: string[]; baselineCount: number };
if (!existsSync(BASELINE) || RESEAL) {
  baseline = { sealedAt: new Date().toISOString(), sealedFiles: liveRoot, baselineCount: liveRoot.length };
  mkdirSync(dirname(BASELINE), { recursive: true });
  writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + "\n", "utf8");
  console.log(`🔒 Sealed root-sprawl baseline: ${baseline.baselineCount} files`);
} else {
  baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
}

const sealed = new Set(baseline.sealedFiles);
const newRootFiles = liveRoot.filter((f) => !sealed.has(f));
const ok = newRootFiles.length === 0;

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(
  REPORT,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      rule: "Constitution Rule 49 (Wave E §B.3)",
      baselineSealedAt: baseline.sealedAt,
      baselineCount: baseline.baselineCount,
      liveRootCount: liveRoot.length,
      newRootFileCount: newRootFiles.length,
      ok,
      newRootFiles,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);

if (newRootFiles.length > 0) {
  console.error(`❌ ${newRootFiles.length} NEW root-level generated file(s) — must live in a zone subfolder:`);
  for (const f of newRootFiles) console.error(`   - ${f}`);
}
console.log(`\nSummary: live-root=${liveRoot.length} baseline=${baseline.baselineCount} new=${newRootFiles.length}`);
if (!ok && !WARN) process.exit(1);
console.log("✅ Generated root-sprawl ratchet passed.");