#!/usr/bin/env tsx
/**
 * Wave F — Frontend Page Canonical Ownership Validator
 * Constitution Rule 50, BLOCKING.
 *
 * Fails CI if:
 *   - Any NEW canonical-body file appears under src/pages/** outside the
 *     allowlist (NotFound.tsx + __tests__/ + index.ts barrels + admin/** under Rule 30)
 *   - Any shim's canonicalOwner target file does not exist
 *   - Any thick body re-emerges under src/pages/{mobile,business-advisors,owner-mode}/**
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const MAP = join(ROOT, "generated", "manifests", "frontend-page-ownership-map.json");
const BASELINE = join(ROOT, "generated", "baselines", "frontend-page-canonical-baseline.json");
const REPORT = join(ROOT, "generated", "frontend-page-canonical-report.json");
const RESEAL = process.argv.includes("--reseal");
const WARN = process.argv.includes("--warn");

if (!existsSync(MAP)) {
  console.error(`❌ Missing ${MAP}. Run: npx tsx scripts/architecture/generate/generate-frontend-page-ownership-map.ts`);
  process.exit(WARN ? 0 : 1);
}

const SEALED_ZONES = ["src/pages/mobile/", "src/pages/business-advisors/", "src/pages/owner-mode/"];

const map = JSON.parse(readFileSync(MAP, "utf8")) as {
  entries: { path: string; kind: string; canonicalOwner: string | null; logicalLines: number }[];
};

// Seal baseline (canonical-body files outside the ratcheted-admin zone) at first run.
const canonicalBodies = map.entries
  .filter((e) => e.kind === "canonical-body")
  .map((e) => e.path)
  .sort();

let baseline: { sealedAt: string; sealedFiles: string[]; baselineCount: number };
if (!existsSync(BASELINE) || RESEAL) {
  baseline = {
    sealedAt: new Date().toISOString(),
    sealedFiles: canonicalBodies,
    baselineCount: canonicalBodies.length,
  };
  mkdirSync(dirname(BASELINE), { recursive: true });
  writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + "\n", "utf8");
  console.log(`🔒 Sealed canonical-body baseline at ${baseline.baselineCount} files`);
} else {
  baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
}

const sealed = new Set(baseline.sealedFiles);
const newCanonicalBodies = canonicalBodies.filter((p) => !sealed.has(p));

// Sealed-zone regression: any thick body re-emerging under the 3 zones we just sealed
const sealedZoneRegression = map.entries
  .filter((e) => e.kind === "canonical-body" && SEALED_ZONES.some((z) => e.path.startsWith(z)))
  .map((e) => e.path);

// Shim integrity: every shim's canonicalOwner target file must exist
const brokenShims: { path: string; canonicalOwner: string }[] = [];
for (const e of map.entries) {
  if (e.kind !== "shim" || !e.canonicalOwner) continue;
  const targetRel = e.canonicalOwner.replace(/^@\//, "src/");
  const candidates = [`${targetRel}.tsx`, `${targetRel}.ts`, `${targetRel}/index.tsx`, `${targetRel}/index.ts`];
  if (!candidates.some((c) => existsSync(join(ROOT, c)))) {
    brokenShims.push({ path: e.path, canonicalOwner: e.canonicalOwner });
  }
}

const ok = newCanonicalBodies.length === 0 && sealedZoneRegression.length === 0 && brokenShims.length === 0;

const report = {
  generatedAt: new Date().toISOString(),
  rule: "Constitution Rule 50 (Wave F — Frontend Page Ownership Law)",
  baselineSealedAt: baseline.sealedAt,
  baselineCount: baseline.baselineCount,
  currentCanonicalBodyCount: canonicalBodies.length,
  newCanonicalBodyCount: newCanonicalBodies.length,
  sealedZoneRegressionCount: sealedZoneRegression.length,
  brokenShimCount: brokenShims.length,
  ok,
  newCanonicalBodies,
  sealedZoneRegression,
  brokenShims,
};
mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");

if (newCanonicalBodies.length > 0) {
  console.error(`❌ ${newCanonicalBodies.length} new canonical body(ies) under src/pages/** — must move to canonical owner:`);
  for (const p of newCanonicalBodies.slice(0, 20)) console.error(`   - ${p}`);
}
if (sealedZoneRegression.length > 0) {
  console.error(`❌ ${sealedZoneRegression.length} thick bod(ies) re-emerged in Wave-F sealed zones:`);
  for (const p of sealedZoneRegression) console.error(`   - ${p}`);
}
if (brokenShims.length > 0) {
  console.error(`❌ ${brokenShims.length} shim(s) point at non-existent canonical owners:`);
  for (const s of brokenShims.slice(0, 10)) console.error(`   - ${s.path} → ${s.canonicalOwner}`);
}

console.log(
  `\nSummary: bodies-now=${canonicalBodies.length} baseline=${baseline.baselineCount} new=${newCanonicalBodies.length} sealed-zone-regression=${sealedZoneRegression.length} broken-shims=${brokenShims.length}`,
);

if (!ok && !WARN) process.exit(1);
console.log("✅ Frontend page canonical ownership check passed.");