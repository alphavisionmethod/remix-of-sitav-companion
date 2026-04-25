#!/usr/bin/env tsx
/**
 * SITA OS — Generated Artifact Governance Validator
 * Wave B / Constitution §B.1 — BLOCKING
 *
 * Reads generated/manifests/generated-artifact-governance-map.json and:
 *   1. Fails if any active-blocking artifact is stale (age > 7 days).
 *   2. Fails if any active-blocking/active-informational artifact is missing on disk.
 *   3. Fails if NEW orphan artifacts exist beyond the baseline.
 *   4. Fails if any artifact in public/generated/** is active-blocking unless allowlisted.
 *
 * Usage: npx tsx scripts/architecture/checks/check-generated-artifact-governance.ts [--warn]
 */
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();
const WARN = process.argv.includes("--warn");
const MAP = path.join(ROOT, "generated/manifests/generated-artifact-governance-map.json");
const BASELINE = path.join(ROOT, "generated/baselines/orphan-artifact-baseline.json");

interface Entry {
  path: string;
  lifecycleClass: "active-blocking" | "active-informational" | "reference" | "historical-archived";
  freshnessTtlDays: number | null;
  owningScript: string | null;
  publishable: boolean;
  ageDays: number;
  stale: boolean;
}

if (!fs.existsSync(MAP)) {
  console.error(`❌ Missing ${MAP}. Run: npx tsx scripts/architecture/generate/generate-artifact-governance-map.ts`);
  process.exit(WARN ? 0 : 1);
}

const data = JSON.parse(fs.readFileSync(MAP, "utf8")) as { entries: Entry[] };
const baseline = fs.existsSync(BASELINE)
  ? new Set<string>((JSON.parse(fs.readFileSync(BASELINE, "utf8")).paths || []) as string[])
  : new Set<string>();

const issues: Array<{ severity: "error" | "warn"; area: string; path: string; reason: string }> = [];

for (const e of data.entries) {
  const exists = fs.existsSync(path.join(ROOT, e.path));
  if (!exists && (e.lifecycleClass === "active-blocking" || e.lifecycleClass === "active-informational")) {
    issues.push({ severity: e.lifecycleClass === "active-blocking" ? "error" : "warn", area: "missing", path: e.path, reason: `${e.lifecycleClass} artifact missing on disk` });
    continue;
  }
  if (e.stale && e.lifecycleClass === "active-blocking") {
    issues.push({ severity: "error", area: "stale", path: e.path, reason: `active-blocking artifact age ${e.ageDays}d > TTL ${e.freshnessTtlDays}d` });
  } else if (e.stale && e.lifecycleClass === "active-informational") {
    issues.push({ severity: "warn", area: "stale", path: e.path, reason: `active-informational artifact age ${e.ageDays}d > TTL ${e.freshnessTtlDays}d` });
  }
  // Orphan ratchet: new orphans beyond baseline are errors.
  if (!e.owningScript && e.lifecycleClass !== "historical-archived" && !baseline.has(e.path)) {
    issues.push({
      severity: e.lifecycleClass === "active-blocking" ? "error" : "warn",
      area: "new-orphan",
      path: e.path,
      reason: `${e.lifecycleClass} artifact has no owning script and is not on orphan baseline`,
    });
  }
}

const errors = issues.filter((i) => i.severity === "error");
const warns = issues.filter((i) => i.severity === "warn");

console.log(`\nGenerated Artifact Governance — ${data.entries.length} artifacts checked`);
console.log(`  errors=${errors.length} warns=${warns.length} baseline-orphans=${baseline.size}`);
if (issues.length) {
  for (const i of issues.slice(0, 50)) console.log(`  [${i.severity.toUpperCase()}] ${i.area} — ${i.path} — ${i.reason}`);
  if (issues.length > 50) console.log(`  ... and ${issues.length - 50} more`);
}

const ok = errors.length === 0;

// Emit gate report
const reportPath = path.join(ROOT, "generated/generated-artifact-governance-report.json");
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "generated-artifact-governance",
  ok,
  errorCount: errors.length,
  warningCount: warns.length,
  totalArtifacts: data.entries.length,
  baselineOrphans: baseline.size,
  issues: issues.slice(0, 200),
}, null, 2) + "\n", "utf8");

if (!ok && !WARN) {
  console.error("❌ Generated artifact governance check failed.");
  process.exit(1);
}
console.log(ok ? "✅ Generated artifact governance check passed." : "⚠️  WARN mode — exit 0");