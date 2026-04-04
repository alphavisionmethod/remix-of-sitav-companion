#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Migrate Contract Imports to Canonical Paths
// Rewrites deprecated imports to use @/packages/contracts
// Usage: npx tsx scripts/codemods/migrate-contract-imports-to-canonical.ts [--apply]
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { scanDir, readFileContent } from "../architecture/lib/utils";

const dryRun = !process.argv.includes("--apply");

const REWRITES: Array<{ from: RegExp; to: string }> = [
  { from: /from\s+["']@\/lib\/types["']/g, to: 'from "@/packages/contracts"' },
  { from: /from\s+["']@\/types["']/g, to: 'from "@/packages/contracts"' },
  { from: /from\s+["']\.\.\/\.\.\/types["']/g, to: 'from "@/packages/contracts"' },
  { from: /from\s+["']@\/lib\/services\/([^"']+)\/types["']/g, to: 'from "@/packages/contracts"' },
];

const files = scanDir("src", [".ts", ".tsx"]);
let filesModified = 0;
let totalRewrites = 0;

for (const file of files) {
  if (file.includes("node_modules") || file.includes(".test.")) continue;
  let content = readFileContent(file);
  let modified = false;

  for (const rule of REWRITES) {
    const matches = content.match(rule.from);
    if (matches) {
      content = content.replace(rule.from, rule.to);
      totalRewrites += matches.length;
      modified = true;
    }
  }

  if (modified) {
    filesModified++;
    if (dryRun) {
      console.log(`  📝 Would modify: ${file}`);
    } else {
      fs.writeFileSync(file, content);
      console.log(`  ✅ Modified: ${file}`);
    }
  }
}

console.log(`\n${dryRun ? "🔍 DRY RUN:" : "✅"} ${filesModified} files, ${totalRewrites} rewrites`);
if (dryRun) console.log("   Run with --apply to write changes");
