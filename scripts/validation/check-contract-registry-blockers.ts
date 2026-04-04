#!/usr/bin/env node
// SITA OS — Contract Registry Blockers Check
import * as fs from "fs";
import { ViolationCollector, scanDir, extractExports, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const contractDirs = ["src/packages/contracts", "src/packages/business-contracts", "src/packages/finance-contracts", "src/packages/concierge-contracts"];
const allExports = new Map<string, string[]>();
for (const dir of contractDirs) {
  const files = scanDir(dir, [".ts"]);
  for (const file of files) {
    if (file.includes(".test.") || file.includes("__")) continue;
    const exports = extractExports(file);
    for (const exp of exports) {
      if (!allExports.has(exp)) allExports.set(exp, []);
      allExports.get(exp)!.push(file);
    }
  }
}
// Check for duplicate exports across contract packages
let duplicates = 0;
for (const [name, files] of allExports) {
  if (files.length > 1) {
    const uniqueDirs = new Set(files.map(f => f.split("/").slice(0, 3).join("/")));
    if (uniqueDirs.size > 1) {
      duplicates++;
      vc.add(files[0], "cross-package-duplicate", `"${name}" exported from ${files.length} packages: ${[...uniqueDirs].join(", ")}`, "warning");
    }
  }
}
// Check for circular re-exports
for (const dir of contractDirs) {
  const barrel = `${dir}/index.ts`;
  if (!fs.existsSync(barrel)) continue;
  const content = readFileContent(barrel);
  const selfImports = content.match(/from\s+["']\.\/index["']/g);
  if (selfImports) {
    vc.add(barrel, "circular-export", "Barrel imports from itself");
  }
}
console.log(`  📋 ${allExports.size} contract exports, ${duplicates} cross-package duplicates`);
vc.report("check-contract-registry-blockers");
vc.exitIfErrors();
