#!/usr/bin/env node
// SITA OS — Phase 5 Anti-Pattern Detection
import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const ANTI_PATTERNS = [
  { pattern: /any\s*\)/, name: "explicit-any", detail: "Explicit 'any' type cast" },
  { pattern: /\/\/\s*@ts-ignore/, name: "ts-ignore", detail: "@ts-ignore suppression" },
  { pattern: /\/\/\s*@ts-nocheck/, name: "ts-nocheck", detail: "@ts-nocheck suppression" },
  { pattern: /console\.(log|debug)\(/, name: "console-log", detail: "console.log in production code" },
];
const files = scanDir("src/lib/services", [".ts"]);
for (const file of files) {
  if (file.includes(".test.") || file.includes(".spec.")) continue;
  const content = readFileContent(file);
  for (const { pattern, name, detail } of ANTI_PATTERNS) {
    const matches = content.match(new RegExp(pattern.source, "g"));
    if (matches && matches.length > 3) {
      vc.add(file, name, `${detail} (${matches.length} occurrences)`, "warning");
    }
  }
}
vc.report("check-phase5-anti-patterns");
vc.exitIfErrors();
