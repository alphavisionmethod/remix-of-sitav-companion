#!/usr/bin/env node
// SITA OS — Tenant Isolation Enforcement
import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const TENANT_VIOLATIONS = [
  { pattern: /\.from\(\s*["'][^"']+["']\s*\)(?!.*\.eq\(.*tenant)(?!.*\.eq\(.*user_id)(?!.*\.eq\(.*owner)/s, name: "missing-tenant-filter" },
];
const serviceFiles = scanDir("src/lib/services", [".ts"]);
let queriesChecked = 0;
for (const file of serviceFiles) {
  if (file.includes(".test.") || file.includes("index.ts")) continue;
  const content = readFileContent(file);
  if (content.includes(".from(")) {
    queriesChecked++;
    // Simple heuristic: if there's a .from() without any .eq() filter, flag it
    const fromBlocks = content.match(/\.from\([^)]+\)[^;]*/g);
    if (fromBlocks) {
      for (const block of fromBlocks) {
        if (!block.includes(".eq(") && !block.includes(".match(") && !block.includes(".filter(") && block.length > 20) {
          vc.add(file, "unfiltered-query", "Database query without filter — verify tenant isolation", "warning");
          break;
        }
      }
    }
  }
}
console.log(`  🔒 ${queriesChecked} files with database queries checked`);
vc.report("check-tenancy-firewall");
vc.exitIfErrors();
