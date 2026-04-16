#!/usr/bin/env node
// SITA OS — Route/Page Contract Layer Usage
import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const pageFiles = scanDir("src/pages", [".tsx", ".ts"]);
for (const file of pageFiles) {
  if (file.includes(".test.")) continue;
  const content = readFileContent(file);
  // Pages should import from contracts barrel, not deep paths
  const deepImports = content.match(/from\s+["']@\/packages\/[^"']+\/(?!index)[^"'/]+\/[^"']+["']/g);
  if (deepImports && deepImports.length > 3) {
    vc.add(file, "deep-import", `Page has ${deepImports.length} deep contract imports — use barrel`, "warning");
  }
}
vc.report("check-route-page-contract-layer-usage");
vc.exitIfErrors();
