#!/usr/bin/env tsx
/**
 * Wave D §D.3 — Retirement Evidence Completeness Validator (Constitution Rule 47, BLOCKING)
 *
 * Reads:
 *   - generated/manifests/safe-change-evidence-ledger.json (append-only)
 *   - generated/manifests/reverse-dependency-retirement-policy.json
 *
 * Augments check-safe-change-evidence.ts with:
 *   1. Re-validation: re-greps each retired target at validation time. If a
 *      retired path is now referenced anywhere in src/, CI BLOCKS.
 *   2. Policy completeness: every entry MUST have all required evidence kinds
 *      per the policy manifest's frozen subtree match.
 *   3. Merge entries MUST have non-null duplicateReconciliation.
 *
 * Run: npx tsx scripts/architecture/checks/check-retirement-evidence-completeness.ts [--warn]
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const WARN = process.argv.includes("--warn");
const LEDGER = join(ROOT, "generated", "manifests", "safe-change-evidence-ledger.json");
const POLICY = join(ROOT, "generated", "manifests", "reverse-dependency-retirement-policy.json");
const REPORT = join(ROOT, "generated", "retirement-evidence-completeness-report.json");
const BASELINE = join(ROOT, "generated", "baselines", "retirement-evidence-completeness-baseline.json");

type Entry = {
  changeId?: string;
  kind?: "delete" | "merge" | "retire";
  target?: string;
  evidence?: Record<string, unknown>;
  approvedAt?: string;
  owner?: string;
};
type Ledger = { appendOnly?: boolean; entries?: Entry[] };
type Policy = {
  evidenceKinds: string[];
  frozenSubtrees: { pattern: string; requiredEvidence: string[] }[];
};

function fail(msg: string): never {
  console.error(`❌ ${msg}`);
  if (WARN) process.exit(0);
  process.exit(1);
}

if (!existsSync(POLICY)) {
  fail(`Missing ${POLICY}. Run generate-reverse-dependency-policy.ts first.`);
}
const policy = JSON.parse(readFileSync(POLICY, "utf8")) as Policy;

if (!existsSync(LEDGER)) {
  // Empty ledger is fine — nothing to validate.
  mkdirSync(dirname(REPORT), { recursive: true });
  writeFileSync(REPORT, JSON.stringify({ generatedAt: new Date().toISOString(), entries: 0, ok: true }, null, 2) + "\n", "utf8");
  console.log("ℹ️  Empty ledger — nothing to validate.");
  process.exit(0);
}
const ledger = JSON.parse(readFileSync(LEDGER, "utf8")) as Ledger;
const entries = ledger.entries ?? [];

// Pre-Wave-D ledger entries are grandfathered: net-new requirements (e.g. docsProof)
// are informational for entries whose changeId is in the baseline. New entries must comply.
let baseline: { sealedAt: string; sealedChangeIds: string[] } = {
  sealedAt: "",
  sealedChangeIds: [],
};
if (existsSync(BASELINE)) {
  baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
} else {
  baseline = {
    sealedAt: new Date().toISOString(),
    sealedChangeIds: entries.map((e) => e.changeId).filter(Boolean) as string[],
  };
  mkdirSync(dirname(BASELINE), { recursive: true });
  writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + "\n", "utf8");
  console.log(`🔒 Sealed retirement-evidence baseline: ${baseline.sealedChangeIds.length} pre-existing entries`);
}
const grandfathered = new Set(baseline.sealedChangeIds);

function rgCount(pattern: string, scope: string): number {
  try {
    const out = execSync(`rg --no-heading --color=never -l ${JSON.stringify(pattern)} ${scope}`, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (!out) return 0;
    return out.split("\n").filter((l) => l && l !== pattern).length;
  } catch {
    return 0;
  }
}

function pickRequiredEvidence(target: string): string[] {
  for (const sub of policy.frozenSubtrees) {
    const re = new RegExp("^" + sub.pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*"));
    if (re.test(target)) return sub.requiredEvidence;
  }
  return policy.evidenceKinds; // default: all
}

const issues: { id: string; reason: string }[] = [];
let revalidationFailures = 0;

for (const e of entries) {
  const id = e.changeId ?? "<no-id>";
  const isGrandfathered = grandfathered.has(id);
  if (!e.target) {
    issues.push({ id, reason: "missing target" });
    continue;
  }
  if (!e.evidence) {
    issues.push({ id, reason: "missing evidence object" });
    continue;
  }
  const required = pickRequiredEvidence(e.target);
  for (const k of required) {
    if (!(k in e.evidence) || e.evidence[k] == null || e.evidence[k] === "") {
      if (isGrandfathered) continue; // pre-Wave-D entries are informational
      issues.push({ id, reason: `missing evidence.${k}` });
    }
  }
  if (e.kind === "merge" && !e.evidence.duplicateReconciliation) {
    issues.push({ id, reason: "merge entry missing duplicateReconciliation" });
  }

  // Re-validation: if grepProof was reference-zero, confirm still zero.
  if (e.evidence.grepProof === "reference-zero") {
    const stem = e.target.replace(/\.(tsx?|jsx?|mjs|cjs|json|md)$/i, "");
    const probe = stem.replace(/^src\//, "@/");
    const live = rgCount(e.target, "src") + rgCount(probe, "src");
    if (live > 0) {
      issues.push({ id, reason: `re-validation FAILED: ${e.target} now has ${live} live references` });
      revalidationFailures += 1;
    }
  }
}

const ok = issues.length === 0;

const report = {
  generatedAt: new Date().toISOString(),
  rule: "Constitution Rule 47 (Wave D §D.3)",
  totalEntries: entries.length,
  issueCount: issues.length,
  revalidationFailures,
  ok,
  issues,
};

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");

if (issues.length > 0) {
  console.error(`❌ ${issues.length} retirement-evidence issue(s):`);
  for (const i of issues.slice(0, 30)) console.error(`   - [${i.id}] ${i.reason}`);
}
console.log(
  `\nSummary: entries=${entries.length} issues=${issues.length} re-validation-failures=${revalidationFailures}`,
);

if (!ok && !WARN) {
  console.error("❌ Retirement evidence completeness check FAILED.");
  process.exit(1);
}
console.log("✅ Retirement evidence completeness check passed.");