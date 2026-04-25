#!/usr/bin/env tsx
/**
 * Wave D §D.2 — Primary Concept Uniqueness Validator (Constitution Rule 46, BLOCKING)
 *
 * Reads:
 *   generated/manifests/primary-concept-ownership-map.json
 *
 * Fails when:
 *   - A net-new concept enters `duplicate-risk` status not present in the baseline
 *   - A canonical concept loses its owner directory or page family (regression)
 *   - A registry entry references a non-existent owner path
 *
 * Pre-existing duplicate-risk concepts are pinned in
 *   generated/baselines/primary-concept-duplicate-baseline.json
 * (auto-seeded; monotone-decreasing).
 *
 * Run: npx tsx scripts/architecture/checks/check-primary-concept-uniqueness.ts [--warn] [--reseal]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const WARN = process.argv.includes("--warn");
const RESEAL = process.argv.includes("--reseal");

const MAP = join(ROOT, "generated", "manifests", "primary-concept-ownership-map.json");
const BASELINE = join(ROOT, "generated", "baselines", "primary-concept-duplicate-baseline.json");
const REPORT = join(ROOT, "generated", "primary-concept-uniqueness-report.json");

type Concept = {
  concept: string;
  ownerExists: boolean;
  pageFamilyExists: boolean;
  status: "canonical" | "alias-only" | "duplicate-risk" | "no-routes";
  distinctOwnerDirs: string[];
};
type Map = { concepts: Concept[] };
type Baseline = { sealedAt: string; sealedConcepts: string[]; baselineCount: number };

function fail(msg: string): never {
  console.error(`❌ ${msg}`);
  if (WARN) process.exit(0);
  process.exit(1);
}

if (!existsSync(MAP)) {
  fail(`Missing ${MAP}. Run: npx tsx scripts/architecture/generate/generate-primary-concept-ownership-map.ts`);
}
const map = JSON.parse(readFileSync(MAP, "utf8")) as Map;
const concepts = map.concepts ?? [];

const duplicateNow = concepts.filter((c) => c.status === "duplicate-risk").map((c) => c.concept).sort();
const missingOwner = concepts.filter((c) => !c.ownerExists).map((c) => c.concept);
const missingPageFamily = concepts.filter((c) => !c.pageFamilyExists).map((c) => c.concept);

let baseline: Baseline;
if (!existsSync(BASELINE) || RESEAL) {
  baseline = {
    sealedAt: new Date().toISOString(),
    sealedConcepts: duplicateNow,
    baselineCount: duplicateNow.length,
  };
  mkdirSync(dirname(BASELINE), { recursive: true });
  writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + "\n", "utf8");
  console.log(`🔒 Sealed concept-duplicate baseline: ${baseline.baselineCount} concepts`);
} else {
  baseline = JSON.parse(readFileSync(BASELINE, "utf8")) as Baseline;
}

const sealedSet = new Set(baseline.sealedConcepts);
const newDuplicates = duplicateNow.filter((c) => !sealedSet.has(c));

const ok = newDuplicates.length === 0 && missingOwner.length === 0 && missingPageFamily.length === 0;

const report = {
  generatedAt: new Date().toISOString(),
  rule: "Constitution Rule 46 (Wave D §D.2)",
  baselineSealedAt: baseline.sealedAt,
  baselineCount: baseline.baselineCount,
  currentDuplicateCount: duplicateNow.length,
  newDuplicateCount: newDuplicates.length,
  missingOwnerCount: missingOwner.length,
  missingPageFamilyCount: missingPageFamily.length,
  ok,
  newDuplicates,
  missingOwner,
  missingPageFamily,
};

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");

if (newDuplicates.length > 0) {
  console.error("❌ New primary-concept duplications:");
  for (const c of newDuplicates) console.error(`   - ${c}`);
}
if (missingOwner.length > 0) {
  console.error("❌ Concepts with missing owner directory:");
  for (const c of missingOwner) console.error(`   - ${c}`);
}
if (missingPageFamily.length > 0) {
  console.error("❌ Concepts with missing canonical page family:");
  for (const c of missingPageFamily) console.error(`   - ${c}`);
}

console.log(
  `\nSummary: duplicate-now=${duplicateNow.length} baseline=${baseline.baselineCount} new=${newDuplicates.length} missing-owner=${missingOwner.length} missing-page-family=${missingPageFamily.length}`,
);

if (!ok && !WARN) {
  console.error("❌ Primary concept uniqueness check FAILED.");
  process.exit(1);
}
console.log("✅ Primary concept uniqueness check passed.");