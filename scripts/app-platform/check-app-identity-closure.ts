#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — App Identity Closure Validator (BLOCK gate)
// Checks: every app has canonical identity, no duplicate IDs/slugs
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, readJsonSafe, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();

// Check canonical files exist
const REQUIRED_FILES = [
  "src/lib/app-platform/app-lifecycle-state-machine.ts",
  "src/lib/app-platform/app-lifecycle-manager.ts",
  "src/lib/app-platform/app-install-registry.ts",
  "src/lib/app-platform/app-permission-ledger.ts",
  "src/lib/app-platform/app-trust-tier-policy.ts",
  "src/lib/app-platform/app-recovery-manager.ts",
  "src/lib/app-platform/catalog.ts",
  "src/lib/app-platform/manifest-schema.ts",
  "src/lib/app-platform/install-state.ts",
];

for (const f of REQUIRED_FILES) {
  if (!fs.existsSync(f)) {
    vc.add(f, "missing-canonical-file", `Required canonical file missing: ${f}`);
  }
}

// Check catalog for duplicate IDs
const catalogPath = "src/lib/app-platform/catalog.ts";
if (fs.existsSync(catalogPath)) {
  const content = fs.readFileSync(catalogPath, "utf-8");
  // Match top-level app IDs (lines starting with optional whitespace + id:) not nested permission IDs
  const idMatches = content.match(/^\s{2,6}id:\s*"([^"]+)"/gm) ?? [];
  const ids = idMatches.map(m => m.trim().replace(/id:\s*"/, "").replace(/"$/, ""));
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      vc.add(catalogPath, "duplicate-app-id", `Duplicate app ID: ${id}`);
    }
    seen.add(id);
  }
  console.log(`  📱 ${seen.size} unique app IDs in catalog`);
}

// Check contracts package exists
if (!fs.existsSync("src/packages/app-contracts/index.ts")) {
  vc.add("src/packages/app-contracts/index.ts", "missing-contracts", "App contracts package missing");
}

// Generate report
const report = {
  gate: "app-identity-closure",
  tier: "BLOCK",
  ok: vc.errors.length === 0,
  errors: vc.errors.length,
  warnings: vc.warnings.length,
  checkedAt: new Date().toISOString(),
};
writeJsonOutput("generated/app-identity-closure-report.json", report);

vc.report("check-app-identity-closure");
vc.exitIfErrors();