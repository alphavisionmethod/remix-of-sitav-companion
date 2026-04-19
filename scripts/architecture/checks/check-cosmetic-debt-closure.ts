#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Cosmetic Debt Closure Check
// Asserts that the three formerly-open "cosmetic/tracked" items
// in PROJECT_TREE_AUDIT.md Section A are backed by living
// attestation artifacts on disk. If any attestation goes missing,
// the audit document's "100% deployment-ready" claim is no longer
// truthful and this check fails.
//
// Closes:
//   A1 — src/lib/ size      → generated/lib-size-budget-attestation.json
//   A2 — no src/services/   → docs/architecture/SERVICES_LAYER_DECISION.md
//   A3 — legacy barrels     → generated/legacy-barrel-attestation.json
//
// Wired as a composite assertion under the lib-ownership-drift
// BLOCK gate to preserve the documented 21/21 BLOCK count.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });

interface RequiredAttestation {
  closes: string;
  description: string;
  path: string;
  kind: "json" | "markdown";
  mustContain?: string[];
}

const REQUIRED: RequiredAttestation[] = [
  {
    closes: "A1",
    description: "src/lib/ size ratchet budget",
    path: "generated/lib-size-budget-attestation.json",
    kind: "json",
    mustContain: ["RATCHET_LOCKED", "lib-ownership-drift", "residual-lib-canonicality"],
  },
  {
    closes: "A2",
    description: "Services layer architectural decision",
    path: "docs/architecture/SERVICES_LAYER_DECISION.md",
    kind: "markdown",
    mustContain: ["Status:** Decided", "src/lib/core-services/"],
  },
  {
    closes: "A3",
    description: "Legacy barrel governance attestation",
    path: "generated/legacy-barrel-attestation.json",
    kind: "json",
    mustContain: ["GOVERNED_SCAFFOLDING", "src/legacy/canonical-backend", "src/legacy/simulation"],
  },
];

interface Violation {
  closes: string;
  path: string;
  reason: string;
}

const violations: Violation[] = [];
const verified: Array<{ closes: string; path: string; bytes: number }> = [];

for (const req of REQUIRED) {
  if (!existsSync(req.path)) {
    violations.push({ closes: req.closes, path: req.path, reason: "missing" });
    continue;
  }
  const stat = statSync(req.path);
  if (!stat.isFile() || stat.size === 0) {
    violations.push({ closes: req.closes, path: req.path, reason: "empty or not a file" });
    continue;
  }
  const body = readFileSync(req.path, "utf8");
  const missing = (req.mustContain ?? []).filter((needle) => !body.includes(needle));
  if (missing.length > 0) {
    violations.push({
      closes: req.closes,
      path: req.path,
      reason: `missing required marker(s): ${missing.join(", ")}`,
    });
    continue;
  }
  verified.push({ closes: req.closes, path: req.path, bytes: stat.size });
}

const report = {
  generatedAt: new Date().toISOString(),
  gate: "cosmetic-debt-closure",
  tier: "BLOCK-composite",
  parentGate: "lib-ownership-drift",
  required: REQUIRED.map((r) => ({ closes: r.closes, path: r.path, description: r.description })),
  verified,
  violations,
  ok: violations.length === 0,
  errorCount: violations.length,
};

writeFileSync(
  join(OUT_DIR, "cosmetic-debt-closure-report.json"),
  JSON.stringify(report, null, 2),
);

console.log(
  `cosmetic-debt-closure: ${verified.length}/${REQUIRED.length} attestations verified, ${violations.length} violation(s)`,
);
if (violations.length > 0) {
  for (const v of violations) {
    console.log(`  ❌ [${v.closes}] ${v.path}: ${v.reason}`);
  }
  process.exit(1);
}
for (const v of verified) {
  console.log(`  ✅ [${v.closes}] ${v.path} (${v.bytes} bytes)`);
}
process.exit(0);
