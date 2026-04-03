#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Contract Completeness Checker
// Ensures every domain has required contract types
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const REQUIRED_CONTRACT_PACKAGES = [
  "business-contracts",
  "finance-contracts",
  "concierge-contracts",
  "policy-contracts",
  "proof-model",
];

const issues: string[] = [];

for (const pkg of REQUIRED_CONTRACT_PACKAGES) {
  const pkgPath = path.join("src/packages", pkg);
  if (!fs.existsSync(pkgPath)) {
    issues.push(`Missing contract package: ${pkg}`);
    continue;
  }
  const indexPath = path.join(pkgPath, "index.ts");
  if (!fs.existsSync(indexPath)) {
    issues.push(`${pkg}: missing index.ts`);
    continue;
  }
  const content = fs.readFileSync(indexPath, "utf-8");
  const exportCount = (content.match(/export/g) || []).length;
  if (exportCount < 2) {
    issues.push(`${pkg}: only ${exportCount} export(s) — seems incomplete`);
  }
}

if (issues.length === 0) {
  console.log(`✅ All ${REQUIRED_CONTRACT_PACKAGES.length} contract packages complete`);
} else {
  console.error(`❌ ${issues.length} contract completeness issue(s):\n`);
  for (const i of issues) console.error(`  → ${i}`);
  process.exit(1);
}
