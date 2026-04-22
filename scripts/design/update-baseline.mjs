#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Update Design Audit Baseline
// Run after fixing issues to snapshot current state as accepted.
// Usage: npx tsx scripts/design/check-visual-coherence.ts && node scripts/design/update-baseline.mjs
// ═══════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_PATH = path.resolve(__dirname, "../../generated/design-token-audit.json");
const BASELINE_PATH = path.resolve(__dirname, "design-audit-baseline.json");

if (!fs.existsSync(AUDIT_PATH)) {
  console.error("Run the audit first: npx tsx scripts/design/check-visual-coherence.ts");
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf-8"));

function fingerprint(f) {
  return `${f.rule}::${f.file}::${f.message}`;
}

const fingerprints = audit.findings
  .filter((f) => f.severity === "error")
  .map(fingerprint);

const baseline = {
  updated_at: new Date().toISOString(),
  description: "Accepted design audit errors. Only NEW errors not in this list will fail CI.",
  error_count: fingerprints.length,
  fingerprints: [...new Set(fingerprints)],
};

fs.writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2));
console.log(`✅ Baseline updated: ${baseline.fingerprints.length} accepted error fingerprints.`);
console.log(`   Written to: ${BASELINE_PATH}`);