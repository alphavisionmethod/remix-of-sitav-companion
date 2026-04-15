#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Import Rewriter
// Rewrites @/ imports to @sita/ workspace imports after migration.
// Run: npx tsx scripts/migrate/rewrite-imports.ts [--dry-run]
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const DRY_RUN = process.argv.includes("--dry-run");

const IMPORT_MAP: Array<{ pattern: RegExp; replacement: string }> = [
  // Shared contracts
  { pattern: /from\s+["']@\/packages\/contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts$1"' },
  { pattern: /from\s+["']@\/packages\/business-contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/business$1"' },
  { pattern: /from\s+["']@\/packages\/finance-contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/finance$1"' },
  { pattern: /from\s+["']@\/packages\/concierge-contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/concierge$1"' },
  { pattern: /from\s+["']@\/packages\/protocols(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/protocols$1"' },
  
  // Design tokens
  { pattern: /from\s+["']@\/packages\/design-tokens(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-design-tokens$1"' },
  
  // Auth
  { pattern: /from\s+["']@\/packages\/auth(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-auth$1"' },
  
  // Events
  { pattern: /from\s+["']@\/packages\/event-types(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-events$1"' },
  
  // SDK
  { pattern: /from\s+["']@\/packages\/client-sdk(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-sdk$1"' },
  
  // Database schemas
  { pattern: /from\s+["']@\/packages\/database-schemas(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-database-schemas$1"' },
  
  // Nova SDK → OS
  { pattern: /from\s+["']@\/lib\/nova-sdk(\/[^"']*)?["']/g, replacement: 'from "@sita/os$1"' },
  
  // Core services → Backend
  { pattern: /from\s+["']@\/lib\/core-services(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/services$1"' },
  
  // Platform plane → Backend gateway
  { pattern: /from\s+["']@\/lib\/platform-plane(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/gateway$1"' },
  
  // Planes barrel (keep as-is for in-Lovable usage)
  { pattern: /from\s+["']@\/planes\/(backend|os|shared|admin|founder|mobile)["']/g, replacement: 'from "@sita/$1"' },
];

function scanDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes("node_modules") && !entry.name.startsWith(".")) {
      files.push(...scanDir(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

interface RewriteResult { file: string; changes: number; details: string[] }
const results: RewriteResult[] = [];

const targetDirs = ["shared", "os", "backend", "apps", "internal-tools"];
const allFiles = targetDirs.flatMap(d => scanDir(d));

console.log(`\n🔄 SITA OS Import Rewriter ${DRY_RUN ? "(DRY RUN)" : ""}`);
console.log(`   Scanning ${allFiles.length} files across ${targetDirs.length} planes...\n`);

for (const filePath of allFiles) {
  let content = fs.readFileSync(filePath, "utf-8");
  let changes = 0;
  const details: string[] = [];

  for (const rule of IMPORT_MAP) {
    const matches = content.match(rule.pattern);
    if (matches) {
      for (const match of matches) {
        details.push(`  ${match} → ${match.replace(rule.pattern, rule.replacement)}`);
        changes++;
      }
      content = content.replace(rule.pattern, rule.replacement);
    }
  }

  if (changes > 0) {
    if (!DRY_RUN) fs.writeFileSync(filePath, content, "utf-8");
    results.push({ file: filePath, changes, details });
  }
}

console.log(`📊 Results:`);
console.log(`   Files scanned: ${allFiles.length}`);
console.log(`   Files modified: ${results.length}`);
console.log(`   Total rewrites: ${results.reduce((s, r) => s + r.changes, 0)}\n`);

if (results.length > 0) {
  console.log("📝 Changes:");
  for (const r of results) {
    console.log(`\n   ${r.file} (${r.changes} changes)`);
    for (const d of r.details) console.log(`   ${d}`);
  }
}

// Write report
const report = {
  timestamp: new Date().toISOString(),
  dry_run: DRY_RUN,
  files_scanned: allFiles.length,
  files_modified: results.length,
  total_rewrites: results.reduce((s, r) => s + r.changes, 0),
  changes: results,
};
const reportPath = "generated/import-rewrite-report.json";
if (!DRY_RUN) {
  fs.mkdirSync("generated", { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved: ${reportPath}`);
}
