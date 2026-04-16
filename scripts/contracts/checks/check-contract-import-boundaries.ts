#!/usr/bin/env node
// SITA OS — Phase 5 Import Boundaries Check
import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const BOUNDARY_RULES = [
  { from: "src/pages", forbidden: /from\s+["']@\/lib\/services\/[^"']+\/(?!index)[^"']+["']/, rule: "page-deep-service-import" },
  { from: "src/components", forbidden: /from\s+["']@\/lib\/engines\/[^"']+["']/, rule: "component-engine-import" },
];
for (const rule of BOUNDARY_RULES) {
  const files = scanDir(rule.from, [".ts", ".tsx"]);
  for (const file of files) {
    if (file.includes(".test.")) continue;
    const content = readFileContent(file);
    if (rule.forbidden.test(content)) {
      vc.add(file, rule.rule, "Import boundary violation", "warning");
    }
  }
}
vc.report("check-phase5-import-boundaries");
vc.exitIfErrors();
