#!/usr/bin/env node
// SITA OS — No Duplicate Contract Concepts
// Ignore pure redirect stubs
import { ViolationCollector, scanDir, extractExports } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const contractDirs = ["src/packages/contracts", "src/packages/business-contracts", "src/packages/finance-contracts", "src/packages/concierge-contracts"];
const exportMap = new Map<string, string[]>();
for (const dir of contractDirs) {
  for (const file of scanDir(dir, [".ts"])) {
    if (file.includes(".test.") || file.endsWith("index.ts")) continue;
    for (const exp of extractExports(file)) {
      if (!exportMap.has(exp)) exportMap.set(exp, []);
      exportMap.get(exp)!.push(file);
    }
  }
}
let dups = 0;
for (const [name, files] of exportMap) {
  if (files.length > 1) {
    dups++;
    if (dups <= 20) vc.add(files[0], "duplicate-concept", `"${name}" defined in ${files.length} files`, "warning");
  }
}
console.log(`  📋 ${exportMap.size} contract exports, ${dups} duplicates`);
vc.report("check-contracts-no-duplicate-concepts");
vc.exitIfErrors();
