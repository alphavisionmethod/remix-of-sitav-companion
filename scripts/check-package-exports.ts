#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Package Exports Checker
// Validates all packages in src/packages/ have proper exports
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const packagesDir = "src/packages";
const issues: string[] = [];

if (fs.existsSync(packagesDir)) {
  for (const pkg of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!pkg.isDirectory()) continue;
    const indexPath = path.join(packagesDir, pkg.name, "index.ts");
    if (!fs.existsSync(indexPath)) {
      issues.push(`${pkg.name}: missing index.ts`);
      continue;
    }
    const content = fs.readFileSync(indexPath, "utf-8");
    if (!content.includes("export")) {
      issues.push(`${pkg.name}: index.ts has no exports`);
    }
  }
}

if (issues.length === 0) {
  console.log("✅ All packages have proper exports");
} else {
  console.error(`❌ ${issues.length} package export issue(s):\n`);
  for (const i of issues) console.error(`  → ${i}`);
  process.exit(1);
}
