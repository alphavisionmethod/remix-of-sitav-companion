#!/usr/bin/env node
// SITA OS — Memory Governance Validator
import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const memoryFiles = scanDir("src/lib/services/memory", [".ts"]);
if (memoryFiles.length === 0) { console.log("⚠️ No memory service found — skipping"); process.exit(0); }
for (const file of memoryFiles) {
  if (file.includes(".test.")) continue;
  const content = readFileContent(file);
  if (/localStorage\s*\./.test(content)) {
    vc.add(file, "localStorage-usage", "Memory service should not use localStorage directly", "warning");
  }
  if (/sessionStorage\s*\./.test(content)) {
    vc.add(file, "sessionStorage-usage", "Memory service should not use sessionStorage directly", "warning");
  }
}
console.log(`  🧠 ${memoryFiles.length} memory service files checked`);
vc.report("check-memory-governance");
vc.exitIfErrors();
