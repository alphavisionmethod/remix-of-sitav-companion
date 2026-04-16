#!/usr/bin/env node
// SITA OS — Read Model Purity Check
import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const readModelFiles = scanDir("src/packages", [".ts"]).filter(f => f.includes("read-model") || f.includes("readmodel") || f.includes("projection"));
const WRITE_PATTERNS = [/\.insert\(/, /\.update\(/, /\.delete\(/, /\.upsert\(/, /mutation/i, /\.mutate\(/];
for (const file of readModelFiles) {
  if (file.includes(".test.")) continue;
  const content = readFileContent(file);
  for (const pattern of WRITE_PATTERNS) {
    if (pattern.test(content)) {
      vc.add(file, "write-in-read-model", "Read model contains write operation", "warning");
      break;
    }
  }
}
vc.report("check-contracts-read-model-purity");
vc.exitIfErrors();
