#!/usr/bin/env node
// SITA OS — No Generated Artifact Imports in Contracts
import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const contractFiles = scanDir("src/packages", [".ts"]);
for (const file of contractFiles) {
  if (file.includes(".test.") || file.includes("node_modules")) continue;
  const content = readFileContent(file);
  if (/from\s+["'][^"']*generated\/[^"']+["']/.test(content)) {
    vc.add(file, "generated-import", "Contract file imports from generated/ — contracts must be source-of-truth");
  }
}
vc.report("check-contracts-generated-artifact-imports");
vc.exitIfErrors();
