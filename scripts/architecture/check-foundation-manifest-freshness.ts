#!/usr/bin/env tsx
/**
 * SITA OS — Foundation Manifest Freshness Validator (Constitution Rule 25)
 *
 * Verifies every entry in `generated/manifests/foundation-manifest-index.json`:
 *   - exists on disk
 *   - parses as JSON
 *   - was modified within its declared TTL (null TTL = sealed, never expires)
 *
 * Exit non-zero on any required-manifest failure. Use `--warn` for advisory mode.
 *
 * Run: npx tsx scripts/architecture/check-foundation-manifest-freshness.ts [--warn]
 */
import { existsSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const WARN = process.argv.includes("--warn");
const INDEX = join(ROOT, "generated", "manifests", "foundation-manifest-index.json");
const REPORT = join(ROOT, "generated", "manifests", "foundation-manifest-freshness-report.json");

type Entry = {
  id: string;
  rule: number;
  path: string;
  owner: string;
  freshnessTtlDays: number | null;
  required: boolean;
};

if (!existsSync(INDEX)) {
  console.error(`❌ Missing ${INDEX}. Run \`npm run foundation:emit\` first.`);
  process.exit(WARN ? 0 : 1);
}

const index = JSON.parse(readFileSync(INDEX, "utf8")) as { manifests: Entry[] };
const issues: Array<{ id: string; severity: "error" | "warn"; reason: string }> = [];
const summary = { checked: 0, missing: 0, stale: 0, unparsable: 0, fresh: 0 };

const ONE_DAY = 24 * 60 * 60 * 1000;

for (const entry of index.manifests) {
  summary.checked++;
  const abs = join(ROOT, entry.path);
  if (!existsSync(abs)) {
    summary.missing++;
    issues.push({ id: entry.id, severity: entry.required ? "error" : "warn", reason: "missing on disk" });
    continue;
  }
  try {
    JSON.parse(readFileSync(abs, "utf8"));
  } catch (err) {
    summary.unparsable++;
    issues.push({ id: entry.id, severity: "error", reason: `unparsable JSON: ${(err as Error).message}` });
    continue;
  }
  if (entry.freshnessTtlDays !== null) {
    const ageDays = (Date.now() - statSync(abs).mtime.getTime()) / ONE_DAY;
    if (ageDays > entry.freshnessTtlDays) {
      summary.stale++;
      issues.push({
        id: entry.id,
        severity: entry.required ? "error" : "warn",
        reason: `stale: ${ageDays.toFixed(1)}d > ttl ${entry.freshnessTtlDays}d (regenerate via ${entry.owner})`,
      });
      continue;
    }
  }
  summary.fresh++;
}

const errors = issues.filter((i) => i.severity === "error");
const ok = errors.length === 0;

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(
  REPORT,
  JSON.stringify({ generatedAt: new Date().toISOString(), ok, summary, issues }, null, 2) + "\n",
  "utf8"
);

if (issues.length > 0) {
  console.log("Foundation manifest freshness:");
  for (const i of issues) console.log(`  [${i.severity.toUpperCase()}] ${i.id} — ${i.reason}`);
}
console.log(`\nSummary: checked=${summary.checked} fresh=${summary.fresh} stale=${summary.stale} missing=${summary.missing} unparsable=${summary.unparsable}`);

if (!ok && !WARN) {
  console.error("❌ Foundation manifest freshness check failed.");
  process.exit(1);
}
console.log(WARN || ok ? "✅ Foundation manifest freshness check passed." : "");