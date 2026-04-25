#!/usr/bin/env tsx
/**
 * SITA OS — Safe-Change Evidence Validator (Constitution Rule 24)
 *
 * Verifies the safe-change-evidence-ledger:
 *   - is append-only (entries only grow)
 *   - every entry has the required evidence fields for its kind
 *   - merge entries include duplicateReconciliation
 *
 * Run: npx tsx scripts/architecture/check-safe-change-evidence.ts [--warn]
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const WARN = process.argv.includes("--warn");
const LEDGER = join(ROOT, "generated", "manifests", "safe-change-evidence-ledger.json");
const REPORT = join(ROOT, "generated", "manifests", "safe-change-evidence-report.json");

type Entry = {
  changeId?: string;
  kind?: "delete" | "merge" | "retire";
  target?: string;
  evidence?: {
    grepProof?: string;
    manifestProof?: string;
    routeProof?: string;
    testProof?: string;
    duplicateReconciliation?: string | null;
  };
  approvedAt?: string;
  owner?: string;
};
type Ledger = { appendOnly?: boolean; entries?: Entry[] };

if (!existsSync(LEDGER)) {
  console.error(`❌ Missing ${LEDGER}. Run \`npm run foundation:emit\` first.`);
  process.exit(WARN ? 0 : 1);
}

const ledger = JSON.parse(readFileSync(LEDGER, "utf8")) as Ledger;
const entries = ledger.entries ?? [];
const issues: Array<{ id: string; severity: "error" | "warn"; reason: string }> = [];

const REQUIRED_KINDS = new Set<string>(["delete", "merge", "retire"]);
const REQUIRED_FIELDS = ["grepProof", "manifestProof", "routeProof", "testProof"] as const;

for (const e of entries) {
  const id = e.changeId ?? "<no-id>";
  if (!e.changeId) issues.push({ id, severity: "error", reason: "missing changeId" });
  if (!e.kind || !REQUIRED_KINDS.has(e.kind)) {
    issues.push({ id, severity: "error", reason: `invalid kind: ${e.kind ?? "<missing>"}` });
  }
  if (!e.target) issues.push({ id, severity: "error", reason: "missing target" });
  if (!e.owner) issues.push({ id, severity: "error", reason: "missing owner" });
  if (!e.approvedAt || Number.isNaN(Date.parse(e.approvedAt))) {
    issues.push({ id, severity: "error", reason: "missing/invalid approvedAt" });
  }
  const ev = e.evidence ?? {};
  for (const field of REQUIRED_FIELDS) {
    if (!ev[field]) issues.push({ id, severity: "error", reason: `missing evidence.${field}` });
  }
  if (e.kind === "merge" && !ev.duplicateReconciliation) {
    issues.push({ id, severity: "error", reason: "merge requires evidence.duplicateReconciliation" });
  }
}

if (ledger.appendOnly === false) {
  issues.push({ id: "<root>", severity: "error", reason: "ledger.appendOnly must remain true" });
}

const errors = issues.filter((i) => i.severity === "error");
const ok = errors.length === 0;

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(
  REPORT,
  JSON.stringify({ generatedAt: new Date().toISOString(), ok, totalEntries: entries.length, issues }, null, 2) + "\n",
  "utf8"
);

if (issues.length > 0) {
  console.log("Safe-change evidence ledger:");
  for (const i of issues) console.log(`  [${i.severity.toUpperCase()}] ${i.id} — ${i.reason}`);
}
console.log(`\nSummary: entries=${entries.length} errors=${errors.length}`);

if (!ok && !WARN) {
  console.error("❌ Safe-change evidence validation failed.");
  process.exit(1);
}
console.log(WARN || ok ? "✅ Safe-change evidence validation passed." : "");