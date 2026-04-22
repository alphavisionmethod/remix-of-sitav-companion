#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Design Audit Baseline Comparator
// Compares current audit findings against a baseline whitelist.
// Only NEW errors (not in baseline) cause a non-zero exit.
// Warnings and info are always allowed (never fail the build).
// ═══════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.resolve(__dirname, "design-audit-baseline.json");
const AUDIT_PATH = path.resolve(__dirname, "../../generated/design-token-audit.json");
const NEW_FINDINGS_PATH = "/tmp/audit-new-findings.txt";

// Load baseline
let baseline = { fingerprints: [] };
if (fs.existsSync(BASELINE_PATH)) {
  baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf-8"));
}

// Load current audit
if (!fs.existsSync(AUDIT_PATH)) {
  console.error("No audit output found at", AUDIT_PATH);
  process.exit(1);
}
const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf-8"));

// Build fingerprint: rule + file + message (line-agnostic to handle file shifts)
function fingerprint(f) {
  return `${f.rule}::${f.file}::${f.message}`;
}

const baselineSet = new Set(baseline.fingerprints);

// Only errors can fail the build; warnings and info are always whitelisted
const newErrors = audit.findings
  .filter((f) => f.severity === "error")
  .filter((f) => !baselineSet.has(fingerprint(f)));

if (newErrors.length > 0) {
  const lines = newErrors.map(
    (f) => `❌ [${f.rule}] ${f.file}:${f.line} — ${f.message}`
  );
  fs.writeFileSync(NEW_FINDINGS_PATH, lines.join("\n"), "utf-8");
  console.log(`\n❌ ${newErrors.length} NEW design error(s) not in baseline:\n`);
  lines.forEach((l) => console.log(l));
  process.exit(1);
} else {
  fs.writeFileSync(NEW_FINDINGS_PATH, "None", "utf-8");
  console.log("\n✅ All errors are in the baseline. No new violations.");
  process.exit(0);
}