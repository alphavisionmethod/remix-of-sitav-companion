#!/usr/bin/env node
// SITA OS — Contracts Layer Purity Check
// Apps should not import truth contracts directly
import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const appFiles = [...scanDir("src/pages", [".ts", ".tsx"]), ...scanDir("src/components", [".ts", ".tsx"])];
const FORBIDDEN = [
  /from\s+["']@\/packages\/contracts\/(?!index)[^"']+["']/,
  /from\s+["']@\/packages\/business-contracts\/(?!index)[^"']+["']/,
  /from\s+["']@\/packages\/finance-contracts\/(?!index)[^"']+["']/,
];
for (const file of appFiles) {
  if (file.includes(".test.")) continue;
  const content = readFileContent(file);
  for (const pattern of FORBIDDEN) {
    if (pattern.test(content)) {
      vc.add(file, "deep-contract-import", "App layer imports deep contract path — use barrel export", "warning");
    }
  }
}
vc.report("check-contracts-layer-purity");
vc.exitIfErrors();
