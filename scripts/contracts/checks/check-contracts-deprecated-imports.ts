#!/usr/bin/env node
// SITA OS — Deprecated Contract Imports Check
import { ViolationCollector, scanDir, readFileContent, matchImports } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const DEPRECATED_IMPORTS = [
  /from\s+["']@\/lib\/types["']/,
  /from\s+["']@\/types["']/,
  /from\s+["']\.\.\/\.\.\/types["']/,
  /from\s+["']@\/lib\/services\/[^"']+\/types["']/,
];
const sourceFiles = scanDir("src", [".ts", ".tsx"]);
for (const file of sourceFiles) {
  if (file.includes("node_modules") || file.includes(".test.")) continue;
  const content = readFileContent(file);
  for (const pattern of DEPRECATED_IMPORTS) {
    if (pattern.test(content)) {
      const match = content.match(pattern);
      vc.add(file, "deprecated-import", `Uses deprecated import: ${match?.[0]}`, "warning");
    }
  }
}
vc.report("check-contracts-deprecated-imports");
vc.exitIfErrors();
