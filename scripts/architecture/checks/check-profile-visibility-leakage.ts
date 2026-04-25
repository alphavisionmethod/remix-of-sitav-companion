#!/usr/bin/env tsx
/**
 * Wave D §D.1 — Profile Visibility Leakage Validator (Constitution Rule 45, BLOCKING)
 *
 * Fails CI when:
 *   1. The profile-route-visibility-map manifest is missing or empty
 *   2. Any operator-only route lacks an admin/permission guard
 *   3. The optional `// @profile: <user|operator|both>` directive on a page
 *      adapter contradicts the manifest profile set
 *
 * Pre-existing leak-risk routes are pinned in
 *   generated/baselines/profile-visibility-leakage-baseline.json
 * (auto-seeded on first run; monotone-decreasing thereafter).
 *
 * Run: npx tsx scripts/architecture/checks/check-profile-visibility-leakage.ts [--warn] [--reseal]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const WARN = process.argv.includes("--warn");
const RESEAL = process.argv.includes("--reseal");

const MANIFEST = join(ROOT, "generated", "manifests", "profile-route-visibility-map.json");
const BASELINE = join(ROOT, "generated", "baselines", "profile-visibility-leakage-baseline.json");
const REPORT = join(ROOT, "generated", "profile-visibility-leakage-report.json");

type Entry = {
  path: string;
  plane: string | null;
  profiles: string[];
  operatorOnly: boolean;
  sourceOwner: string | null;
  routeAdapter: string | null;
  guards: string[];
  validationStatus: "ok" | "leak-risk" | "missing-profile";
};
type Manifest = { entries: Entry[]; generatedAt: string };
type Baseline = { sealedAt: string; baselineCount: number; sealedPaths: string[] };

function fail(msg: string): never {
  console.error(`❌ ${msg}`);
  if (WARN) process.exit(0);
  process.exit(1);
}

if (!existsSync(MANIFEST)) {
  fail(`Missing ${MANIFEST}. Run: npx tsx scripts/architecture/generate/generate-profile-route-visibility-map.ts`);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8")) as Manifest;
const entries = manifest.entries ?? [];
if (entries.length === 0) fail("profile-route-visibility-map.json is empty");

// Detect leak-risk routes (operator-only without admin guard)
const leakRiskNow = entries
  .filter((e) => e.validationStatus === "leak-risk")
  .map((e) => e.path)
  .sort();

// Load or seed baseline
let baseline: Baseline;
if (!existsSync(BASELINE) || RESEAL) {
  baseline = {
    sealedAt: new Date().toISOString(),
    baselineCount: leakRiskNow.length,
    sealedPaths: leakRiskNow,
  };
  mkdirSync(dirname(BASELINE), { recursive: true });
  writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + "\n", "utf8");
  console.log(`🔒 Sealed leakage baseline: ${baseline.baselineCount} paths`);
} else {
  baseline = JSON.parse(readFileSync(BASELINE, "utf8")) as Baseline;
}

const sealedSet = new Set(baseline.sealedPaths);
const newViolators = leakRiskNow.filter((p) => !sealedSet.has(p));

// Optional directive scan: parse `// @profile: <list>` from declared adapter file
const directiveMismatches: Array<{ path: string; declared: string; manifest: string[] }> = [];
for (const e of entries) {
  if (!e.routeAdapter) continue;
  const adapterPath = join(ROOT, e.routeAdapter);
  if (!existsSync(adapterPath)) continue;
  const head = readFileSync(adapterPath, "utf8").slice(0, 1024);
  const m = head.match(/\/\/\s*@profile:\s*([a-z,\s|]+)/i);
  if (!m) continue;
  const declared = m[1]
    .split(/[,|\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join(",");
  const actual = [...e.profiles].sort().join(",");
  if (declared && declared !== "both" && declared !== actual) {
    directiveMismatches.push({ path: e.path, declared, manifest: e.profiles });
  }
}

const ok = newViolators.length === 0 && directiveMismatches.length === 0;

const report = {
  generatedAt: new Date().toISOString(),
  rule: "Constitution Rule 45 (Wave D §D.1)",
  baselineSealedAt: baseline.sealedAt,
  baselineCount: baseline.baselineCount,
  currentLeakRiskCount: leakRiskNow.length,
  newViolatorCount: newViolators.length,
  directiveMismatchCount: directiveMismatches.length,
  ok,
  newViolators,
  directiveMismatches,
};

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");

if (newViolators.length > 0) {
  console.error("❌ New profile-leakage violators (operator-only routes without admin guard):");
  for (const p of newViolators.slice(0, 20)) console.error(`   - ${p}`);
}
if (directiveMismatches.length > 0) {
  console.error("❌ Page-adapter @profile directive mismatches:");
  for (const m of directiveMismatches.slice(0, 20)) {
    console.error(`   - ${m.path}: declared=${m.declared} manifest=${m.manifest.join(",")}`);
  }
}

console.log(
  `\nSummary: leak-risk-now=${leakRiskNow.length} baseline=${baseline.baselineCount} new=${newViolators.length} directive-mismatch=${directiveMismatches.length}`,
);

if (!ok && !WARN) {
  console.error("❌ Profile visibility leakage check FAILED.");
  process.exit(1);
}
console.log("✅ Profile visibility leakage check passed.");