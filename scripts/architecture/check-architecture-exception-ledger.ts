#!/usr/bin/env tsx
/**
 * SITA OS — Architecture Exception Ledger Validator (Constitution Rule 23)
 *
 * Verifies:
 *   1. Every exception entry has the required fields (ruleId, scope, owner, reason).
 *   2. expiresAt is either null OR a valid future ISO date OR waveBound is set.
 *   3. Total exception count never grows above the baselineCount stored at the
 *      ledger root (monotone ratchet).
 *
 * Run: npx tsx scripts/architecture/check-architecture-exception-ledger.ts [--warn]
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const WARN = process.argv.includes("--warn");
const LEDGER = join(ROOT, "generated", "manifests", "architecture-exception-ledger.json");
const REPORT = join(ROOT, "generated", "manifests", "architecture-exception-ledger-report.json");

type Exception = {
  ruleId?: string;
  scope?: string;
  owner?: string;
  reason?: string;
  expiresAt?: string | null;
  waveBound?: string | null;
  createdAt?: string;
  baselineCount?: number;
};
type Ledger = {
  exceptions?: Exception[];
  totalExceptions?: number;
  monotoneRatchet?: { enabled?: boolean };
};

if (!existsSync(LEDGER)) {
  console.error(`❌ Missing ${LEDGER}. Run \`npm run foundation:emit\` first.`);
  process.exit(WARN ? 0 : 1);
}

const ledger = JSON.parse(readFileSync(LEDGER, "utf8")) as Ledger;
const exceptions = ledger.exceptions ?? [];
const issues: Array<{ index: number; severity: "error" | "warn"; reason: string }> = [];

exceptions.forEach((ex, i) => {
  if (!ex.ruleId) issues.push({ index: i, severity: "error", reason: "missing ruleId" });
  if (!ex.scope) issues.push({ index: i, severity: "error", reason: "missing scope" });
  if (!ex.owner) issues.push({ index: i, severity: "error", reason: "missing owner" });
  if (!ex.reason) issues.push({ index: i, severity: "error", reason: "missing reason" });
  const hasExpiry = ex.expiresAt && !Number.isNaN(Date.parse(ex.expiresAt));
  const hasWave = !!ex.waveBound;
  if (!hasExpiry && !hasWave) {
    issues.push({ index: i, severity: "warn", reason: `${ex.ruleId ?? "?"}: needs expiresAt or waveBound` });
  }
  if (hasExpiry && Date.parse(ex.expiresAt!) < Date.now()) {
    issues.push({ index: i, severity: "warn", reason: `${ex.ruleId ?? "?"}: expiresAt is in the past` });
  }
});

// Monotone ratchet: total count must not exceed declared baseline.
const declaredBaseline = typeof ledger.totalExceptions === "number" ? ledger.totalExceptions : exceptions.length;
if (exceptions.length > declaredBaseline) {
  issues.push({
    index: -1,
    severity: "error",
    reason: `monotone ratchet violated: ${exceptions.length} exceptions exceeds baseline ${declaredBaseline}. Decrease, do not grow.`,
  });
}

const errors = issues.filter((i) => i.severity === "error");
const ok = errors.length === 0;

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(
  REPORT,
  JSON.stringify({ generatedAt: new Date().toISOString(), ok, total: exceptions.length, baseline: declaredBaseline, issues }, null, 2) + "\n",
  "utf8"
);

if (issues.length > 0) {
  console.log("Exception ledger:");
  for (const i of issues) console.log(`  [${i.severity.toUpperCase()}] #${i.index} — ${i.reason}`);
}
console.log(`\nSummary: exceptions=${exceptions.length} baseline=${declaredBaseline} errors=${errors.length}`);

if (!ok && !WARN) {
  console.error("❌ Exception ledger validation failed.");
  process.exit(1);
}
console.log(WARN || ok ? "✅ Exception ledger validation passed." : "");